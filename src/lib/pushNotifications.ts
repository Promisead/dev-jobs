import {
    getJobCanonicalUrl,
} from "@/lib/jobSeo";

import {
    matchesJobPreferences,
    normalizePushPreferences,
} from "@/lib/pushMatching";

import {
    SITE,
} from "@/lib/site";

import type {
    Job,
} from "@/models/Job";

import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import mongoose from "mongoose";

import webpush from "web-push";


/*
 * ========================================
 * PUSH PAYLOAD
 * ========================================
 */

export type PushPayload = {
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

    renotify?:
    boolean;

    type?:
    "job" |
    "special";
};


/*
 * ========================================
 * SPECIAL NOTIFICATION AUDIENCE
 * ========================================
 */

export type SpecialPushAudienceKind =
    | "all"
    | "workMode"
    | "jobType"
    | "country"
    | "state"
    | "city";


export type SpecialPushAudience = {
    kind:
    SpecialPushAudienceKind;

    value?:
    string |
    null;
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

    enabled?:
    boolean;

    preferences?:
    unknown;
};


export type PushDeliverySummary = {
    attempted:
    number;

    delivered:
    number;

    failed:
    number;

    removed:
    number;
};


type DeliveryResult = {
    status:
    | "delivered"
    | "failed"
    | "removed";
};


/*
 * ========================================
 * HELPERS
 * ========================================
 */

function normalizeText(
    value:
        string,
) {
    return value
        .trim()
        .toLowerCase();
}


function preferenceAllowsValue(
    selectedValues:
        string[],

    targetValue:
        string,
) {
    /*
     * Empty preference means:
     *
     * "Any value is acceptable."
     *
     * Therefore an unpersonalized subscriber
     * can still receive targeted campaigns.
     */
    if (
        selectedValues.length ===
        0
    ) {
        return true;
    }


    const normalizedTarget =
        normalizeText(
            targetValue,
        );


    return selectedValues.some(
        (
            selectedValue,
        ) =>
            normalizeText(
                selectedValue,
            ) ===
            normalizedTarget,
    );
}


/*
 * ========================================
 * SPECIAL-AUDIENCE MATCHING
 * ========================================
 */

function matchesSpecialAudience(
    subscription:
        LeanPushSubscription,

    audience:
        SpecialPushAudience,
) {
    const preferences =
        normalizePushPreferences(
            subscription
                .preferences,
        );


    /*
     * Subscriber explicitly disabled
     * special announcements.
     */
    if (
        !preferences
            .specialAnnouncements
    ) {
        return false;
    }


    if (
        audience.kind ===
        "all"
    ) {
        return true;
    }


    const value =
        audience.value
            ?.trim() ||
        "";


    if (
        !value
    ) {
        return false;
    }


    switch (
    audience.kind
    ) {
        case "workMode":
            return preferenceAllowsValue(
                preferences
                    .workModes,

                value,
            );


        case "jobType":
            return preferenceAllowsValue(
                preferences
                    .jobTypes,

                value,
            );


        case "country":
            return preferenceAllowsValue(
                preferences
                    .countries,

                value,
            );


        case "state":
            return preferenceAllowsValue(
                preferences
                    .states,

                value,
            );


        case "city":
            return preferenceAllowsValue(
                preferences
                    .cities,

                value,
            );


        default:
            return false;
    }
}


/*
 * ========================================
 * WEB PUSH CONFIGURATION
 * ========================================
 */

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
        console.warn(
            "Web Push skipped: VAPID keys are not configured.",
        );


        return false;
    }


    webpush.setVapidDetails(
        subject,

        publicKey,

        privateKey,
    );


    return true;
}


/*
 * ========================================
 * PUSH ERROR STATUS
 * ========================================
 */

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


/*
 * ========================================
 * LOAD ENABLED SUBSCRIPTIONS
 * ========================================
 */

async function getEnabledSubscriptions() {
    await mongoose.connect(
        process.env
            .MONGO_URI as string,
    );


    const subscriptions =
        await PushSubscriptionModel.find({
            enabled:
                true,
        })
            .select(
                "endpoint keys enabled preferences",
            )
            .lean()
            .exec();


    return subscriptions as unknown as
        LeanPushSubscription[];
}


/*
 * ========================================
 * DELIVER ONE PUSH
 * ========================================
 */

async function deliverPush(
    subscription:
        LeanPushSubscription,

    payload:
        PushPayload,
):
    Promise<DeliveryResult> {
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
                "delivered",
        };
    } catch (
    error
    ) {
        const statusCode =
            getPushStatusCode(
                error,
            );


        /*
         * Subscription is permanently gone.
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
                    "removed",
            };
        }


        console.error(
            "Web Push delivery failed:",
            statusCode ||
            "unknown",
        );


        return {
            status:
                "failed",
        };
    }
}


/*
 * ========================================
 * SEND BATCH
 * ========================================
 */

async function sendToSubscriptions(
    subscriptions:
        LeanPushSubscription[],

    payload:
        PushPayload,
):
    Promise<PushDeliverySummary> {
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
                    (
                        subscription,
                    ) =>
                        deliverPush(
                            subscription,

                            payload,
                        ),
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


    return {
        attempted:
            subscriptions.length,

        delivered,

        failed,

        removed,
    };
}


/*
 * ========================================
 * GENERIC BROADCAST
 * ========================================
 */

export async function sendPushToSubscribers(
    payload:
        PushPayload,
):
    Promise<PushDeliverySummary> {
    if (
        !configureWebPush()
    ) {
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
        const subscriptions =
            await getEnabledSubscriptions();


        return await sendToSubscriptions(
            subscriptions,

            payload,
        );
    } catch (
    error
    ) {
        console.error(
            "Unable to send push broadcast:",
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
 * AUTOMATIC NEW-JOB NOTIFICATION
 * ========================================
 */

export async function notifyNewJobSubscribers(
    job:
        Job,
):
    Promise<PushDeliverySummary> {
    if (
        !configureWebPush()
    ) {
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
        const subscriptions =
            await getEnabledSubscriptions();


        const matchingSubscriptions =
            subscriptions.filter(
                (
                    subscription,
                ) =>
                    matchesJobPreferences(
                        subscription
                            .preferences,

                        job,
                    ),
            );


        console.info(
            "Web Push job matching:",
            {
                enabled:
                    subscriptions.length,

                matched:
                    matchingSubscriptions.length,

                excluded:
                    subscriptions.length -
                    matchingSubscriptions.length,

                jobId:
                    String(
                        job._id,
                    ),
            },
        );


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


        const employmentType =
            job.type ===
                "full"
                ? "Full-time"
                : job.type ===
                    "part"
                    ? "Part-time"
                    : "Project / Contract";


        const result =
            await sendToSubscriptions(
                matchingSubscriptions,

                {
                    title:
                        job.title,

                    body:
                        `${company} • ${location} • ${employmentType}`,

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

                    type:
                        "job",
                },
            );


        console.info(
            "Web Push job delivery:",
            result,
        );


        return result;
    } catch (
    error
    ) {
        /*
         * Push failure must never undo
         * a successfully-created job.
         */
        console.error(
            "Unable to send new-job notifications:",
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
 * SPECIAL / MANUAL NOTIFICATION
 * ========================================
 */

export async function sendSpecialPushNotification(
    payload:
        PushPayload,

    audience:
        SpecialPushAudience = {
            kind:
                "all",
        },
):
    Promise<PushDeliverySummary> {
    if (
        !configureWebPush()
    ) {
        throw new Error(
            "VAPID keys are not configured.",
        );
    }


    const subscriptions =
        await getEnabledSubscriptions();


    const matchingSubscriptions =
        subscriptions.filter(
            (
                subscription,
            ) =>
                matchesSpecialAudience(
                    subscription,

                    audience,
                ),
        );


    console.info(
        "Web Push special matching:",
        {
            enabled:
                subscriptions.length,

            matched:
                matchingSubscriptions.length,

            excluded:
                subscriptions.length -
                matchingSubscriptions.length,

            audience:
                audience.kind,
        },
    );


    const result =
        await sendToSubscriptions(
            matchingSubscriptions,

            {
                ...payload,

                type:
                    "special",
            },
        );


    console.info(
        "Web Push special delivery:",
        result,
    );


    return result;
}