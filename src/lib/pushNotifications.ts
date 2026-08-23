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


type LeanPushSubscription = {
    endpoint:
    string;

    keys: {
        p256dh:
        string;

        auth:
        string;
    };
};


type DeliverySummary = {
    attempted:
    number;

    delivered:
    number;

    failed:
    number;

    removed:
    number;
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
        error !==
        null &&
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
                )
                    .statusCode,
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
):
    Promise<DeliverySummary> {
    if (
        !configureWebPush()
    ) {
        console.warn(
            "Web Push skipped: VAPID keys are not configured.",
        );


        return {
            attempted:
                0,

            delivered:
                0,

            failed:
                0,

            removed:
                0,
        };
    }


    try {
        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        /*
         * STAGE 6:
         *
         * NO PREFERENCE FILTERING YET.
         *
         * Every enabled subscription receives
         * new-job notifications.
         */
        const rawSubscriptions =
            await PushSubscriptionModel.find({
                enabled:
                    true,
            })
                .select(
                    "endpoint keys",
                )
                .lean()
                .exec();


        const subscriptions =
            rawSubscriptions as unknown as
            LeanPushSubscription[];


        console.info(
            `Web Push: ${subscriptions.length} enabled subscription(s) found.`,
        );


        const BATCH_SIZE =
            25;


        let delivered =
            0;


        let failed =
            0;


        let removed =
            0;


        for (
            let index =
                0;
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


            const results =
                await Promise.all(
                    batch.map(
                        async (
                            subscription,
                        ) => {
                            try {
                                await webpush.sendNotification(
                                    {
                                        endpoint:
                                            subscription
                                                .endpoint,

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
                                        TTL:
                                            60 *
                                            60 *
                                            24,
                                    },
                                );


                                return {
                                    status:
                                        "delivered" as const,
                                };
                            } catch (
                            error
                            ) {
                                const statusCode =
                                    getPushStatusCode(
                                        error,
                                    );


                                /*
                                 * Browser subscription is gone.
                                 */
                                if (
                                    statusCode ===
                                    404 ||
                                    statusCode ===
                                    410
                                ) {
                                    await PushSubscriptionModel.deleteOne({
                                        endpoint:
                                            subscription
                                                .endpoint,
                                    });


                                    return {
                                        status:
                                            "removed" as const,
                                    };
                                }


                                console.error(
                                    "Web Push delivery failed:",
                                    statusCode ||
                                    "unknown",

                                    error,
                                );


                                return {
                                    status:
                                        "failed" as const,
                                };
                            }
                        },
                    ),
                );


            delivered +=
                results.filter(
                    (
                        result,
                    ) =>
                        result.status ===
                        "delivered",
                ).length;


            failed +=
                results.filter(
                    (
                        result,
                    ) =>
                        result.status ===
                        "failed",
                ).length;


            removed +=
                results.filter(
                    (
                        result,
                    ) =>
                        result.status ===
                        "removed",
                ).length;
        }


        const summary = {
            attempted:
                subscriptions.length,

            delivered,

            failed,

            removed,
        };


        console.info(
            "Web Push delivery summary:",
            summary,
        );


        return summary;
    } catch (
    error
    ) {
        /*
         * Push must never undo job publishing.
         */
        console.error(
            "Unable to send push notifications:",
            error,
        );


        return {
            attempted:
                0,

            delivered:
                0,

            failed:
                0,

            removed:
                0,
        };
    }
}


/*
 * ========================================
 * NEW JOB
 * ========================================
 */

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


    return sendPushToSubscribers({
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
            job.jobIcon ||
            "/icons/icon-192.png",

        badge:
            "/icons/icon-192.png",
    });
}