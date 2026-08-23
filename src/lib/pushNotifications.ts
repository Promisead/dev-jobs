import {
    getJobCanonicalUrl,
} from "@/lib/jobSeo";

import {
    SITE,
} from "@/lib/site";

import {
    Job,
} from "@/models/Job";

import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import mongoose from "mongoose";

import webpush from "web-push";


type PushPayload = {
    title:
    string;

    body:
    string;

    url:
    string;

    tag:
    string;

    icon?:
    string;

    badge?:
    string;
};


function configureWebPush() {
    const publicKey =
        process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const privateKey =
        process.env
            .VAPID_PRIVATE_KEY;

    const subject =
        process.env
            .VAPID_SUBJECT ||
        `mailto:${SITE.contact.email}`;


    if (
        !publicKey ||
        !privateKey
    ) {
        return false;
    }


    webpush.setVapidDetails(
        subject,
        publicKey,
        privateKey,
    );


    return true;
}


function getPushStatusCode(
    error:
        unknown,
) {
    if (
        typeof error ===
        "object" &&
        error !== null &&
        "statusCode" in
        error
    ) {
        const statusCode =
            Number(
                (
                    error as {
                        statusCode?:
                        unknown;
                    }
                ).statusCode,
            );


        return Number.isFinite(
            statusCode,
        )
            ? statusCode
            : null;
    }


    return null;
}


export async function sendPushToSubscribers(
    payload:
        PushPayload,
) {
    if (
        !configureWebPush()
    ) {
        console.warn(
            "Web Push skipped: VAPID keys are not configured.",
        );

        return;
    }


    try {
        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        const subscriptions =
            await PushSubscriptionModel.find({
                enabled:
                    true,
            })
                .lean()
                .exec();


        /*
         * Small batches avoid blasting every
         * subscription concurrently once the
         * platform grows.
         */
        const BATCH_SIZE =
            25;


        for (
            let index = 0;
            index <
            subscriptions.length;
            index +=
            BATCH_SIZE
        ) {
            const batch =
                subscriptions.slice(
                    index,
                    index +
                    BATCH_SIZE,
                );


            await Promise.allSettled(
                batch.map(
                    async (
                        subscription,
                    ) => {
                        try {
                            await webpush.sendNotification(
                                {
                                    endpoint:
                                        subscription.endpoint,

                                    keys: {
                                        p256dh:
                                            subscription
                                                .keys
                                                .p256dh,

                                        auth:
                                            subscription
                                                .keys
                                                .auth,
                                    },
                                },

                                JSON.stringify(
                                    payload,
                                ),

                                {
                                    /*
                                     * A job notification that
                                     * arrives a day later is
                                     * normally still useful.
                                     */
                                    TTL:
                                        60 *
                                        60 *
                                        24,
                                },
                            );
                        } catch (
                        error
                        ) {
                            const statusCode =
                                getPushStatusCode(
                                    error,
                                );


                            /*
                             * 404/410 means the browser's
                             * subscription is dead.
                             *
                             * Remove it automatically.
                             */
                            if (
                                statusCode ===
                                404 ||
                                statusCode ===
                                410
                            ) {
                                await PushSubscriptionModel.deleteOne({
                                    endpoint:
                                        subscription.endpoint,
                                });

                                return;
                            }


                            console.error(
                                "Web Push delivery failed:",
                                statusCode ||
                                "unknown",
                            );
                        }
                    },
                ),
            );
        }
    } catch (
    error
    ) {
        /*
         * Push failure must NEVER undo
         * successful job publishing.
         */
        console.error(
            "Unable to send job notifications:",
            error,
        );
    }
}


export async function notifyNewJobSubscribers(
    job:
        Job,
) {
    const location =
        job.remote ===
            "remote"
            ? "Remote"
            : [
                job.city,
                job.state,
                job.country,
            ]
                .filter(
                    Boolean,
                )
                .join(
                    ", ",
                );


    const company =
        job.orgName ||
        "New employer";


    await sendPushToSubscribers({
        title:
            `New job: ${job.title}`,

        body:
            `${company} • ${location}`,

        url:
            getJobCanonicalUrl(
                String(
                    job._id,
                ),
            ),

        tag:
            `job-${job._id}`,

        icon:
            "/icons/icon-192.png",

        badge:
            "/icons/icon-192.png",
    });
}