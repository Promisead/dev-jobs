import {
    randomUUID,
} from "crypto";

import {
    SITE,
} from "@/lib/site";

import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import mongoose, {
    Types,
} from "mongoose";

import webpush from "web-push";


const DAY_MS =
    24 *
    60 *
    60 *
    1000;


const LOCK_MINUTES =
    10;


const DEFAULT_BATCH_SIZE =
    20;


type WinBackCandidate = {
    _id:
    Types.ObjectId;

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

    lastSeenAt?:
    Date | null;

    lastWinBackAt?:
    Date | null;

    winBackStage?:
    number | null;

    winBackLockUntil?:
    Date | null;
};


type DeliveryStatus =
    | "delivered"
    | "failed"
    | "removed";


type WinBackPayload = {
    title:
    string;

    body:
    string;

    url:
    string;

    tag:
    string;

    icon:
    string;

    badge:
    string;

    renotify:
    boolean;

    type:
    "winback";

    campaign:
    string;

    pushId:
    string;
};


export type WinBackRunSummary = {
    dryRun:
    boolean;

    eligible7Day:
    number;

    eligible14Day:
    number;

    selected7Day:
    number;

    selected14Day:
    number;

    attempted:
    number;

    delivered:
    number;

    failed:
    number;

    removed:
    number;

    skipped:
    number;

    advancedToStage1:
    number;

    advancedToStage2:
    number;
};


function subtractDays(
    value:
        Date,

    days:
        number,
) {
    return new Date(
        value.getTime() -
        (
            days *
            DAY_MS
        ),
    );
}


function addMinutes(
    value:
        Date,

    minutes:
        number,
) {
    return new Date(
        value.getTime() +
        (
            minutes *
            60 *
            1000
        ),
    );
}


async function connectMongo() {
    const mongoUri =
        process.env
            .MONGO_URI;


    if (
        !mongoUri
    ) {
        throw new Error(
            "MONGO_URI is not configured.",
        );
    }


    await mongoose.connect(
        mongoUri,
    );
}


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
        throw new Error(
            "VAPID keys are not configured.",
        );
    }


    webpush.setVapidDetails(
        subject,

        publicKey,

        privateKey,
    );
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


function getSevenDayQuery(
    now:
        Date,
) {
    const sevenDaysAgo =
        subtractDays(
            now,

            7,
        );


    return {
        enabled:
            true,

        "preferences.careerReminders": {
            $ne:
                false,
        },

        /*
         * Never send win-back messages to records
         * where we don't actually know when the
         * visitor was last active.
         */
        lastSeenAt: {
            $ne:
                null,

            $lte:
                sevenDaysAgo,
        },

        $and: [
            {
                /*
                 * Missing stage supports older records.
                 */
                $or: [
                    {
                        winBackStage:
                            0,
                    },

                    {
                        winBackStage: {
                            $exists:
                                false,
                        },
                    },

                    {
                        winBackStage:
                            null,
                    },
                ],
            },

            {
                /*
                 * Available unless another cron run
                 * currently owns this subscription.
                 */
                $or: [
                    {
                        winBackLockUntil:
                            null,
                    },

                    {
                        winBackLockUntil: {
                            $exists:
                                false,
                        },
                    },

                    {
                        winBackLockUntil: {
                            $lte:
                                now,
                        },
                    },
                ],
            },
        ],
    };
}


function getFourteenDayQuery(
    now:
        Date,
) {
    const fourteenDaysAgo =
        subtractDays(
            now,

            14,
        );


    /*
     * Ensures there is reasonable spacing
     * between reminder #1 and #2.
     */
    const sixDaysAgo =
        subtractDays(
            now,

            6,
        );


    return {
        enabled:
            true,

        "preferences.careerReminders": {
            $ne:
                false,
        },

        winBackStage:
            1,

        lastSeenAt: {
            $ne:
                null,

            $lte:
                fourteenDaysAgo,
        },

        lastWinBackAt: {
            $ne:
                null,

            $lte:
                sixDaysAgo,
        },

        $or: [
            {
                winBackLockUntil:
                    null,
            },

            {
                winBackLockUntil: {
                    $exists:
                        false,
                },
            },

            {
                winBackLockUntil: {
                    $lte:
                        now,
                },
            },
        ],
    };
}


function buildWinBackPayload(
    stage:
        0 |
        1,
) {
    const pushId =
        randomUUID();


    if (
        stage ===
        0
    ) {
        return {
            nextStage:
                1 as const,

            campaign:
                "win_back_7d",

            payload: {
                title:
                    "Still looking for the right role? 👀",

                body:
                    "Fresh opportunities may have landed since your last visit. Take a quick look — your next role could already be waiting.",

                url:
                    "/",

                tag:
                    "dc-jobs-win-back-7d",

                icon:
                    "/icons/icon-192.png",

                badge:
                    "/icons/icon-192.png",

                renotify:
                    false,

                type:
                    "winback" as const,

                campaign:
                    "win_back_7d",

                pushId,
            },
        };
    }


    return {
        nextStage:
            2 as const,

        campaign:
            "win_back_14d",

        payload: {
            title:
                "Your next opportunity could be here 🚀",

            body:
                "New roles are being added to D•C Jobs. Come back and see what matches your goals.",

            url:
                "/",

            tag:
                "dc-jobs-win-back-14d",

            icon:
                "/icons/icon-192.png",

            badge:
                "/icons/icon-192.png",

            renotify:
                false,

            type:
                "winback" as const,

            campaign:
                "win_back_14d",

            pushId,
        },
    };
}


async function deliverWinBackPush(
    subscription:
        WinBackCandidate,

    payload:
        WinBackPayload,
):
    Promise<DeliveryStatus> {
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


        return "delivered";
    } catch (
    error
    ) {
        const statusCode =
            getPushStatusCode(
                error,
            );


        if (
            statusCode ===
            404 ||
            statusCode ===
            410
        ) {
            await PushSubscriptionModel.deleteOne({
                _id:
                    subscription
                        ._id,
            });


            return "removed";
        }


        console.error(
            "Win-back Push delivery failed:",
            statusCode ||
            "unknown",
        );


        return "failed";
    }
}


async function claimCandidate(
    subscription:
        WinBackCandidate,

    eligibilityQuery:
        Record<
            string,
            unknown
        >,

    now:
        Date,
) {
    const lockUntil =
        addMinutes(
            now,

            LOCK_MINUTES,
        );


    const claimed =
        (
            await PushSubscriptionModel.findOneAndUpdate(
                {
                    _id:
                        subscription
                            ._id,

                    ...eligibilityQuery,
                },

                {
                    $set: {
                        winBackLockUntil:
                            lockUntil,
                    },
                },

                {
                    new:
                        true,
                },
            )
                .select(
                    "_id endpoint keys enabled preferences lastSeenAt lastWinBackAt winBackStage winBackLockUntil",
                )
                .lean()
                .exec()
        ) as unknown as
        WinBackCandidate |
        null;


    return {
        claimed,

        lockUntil,
    };
}


async function releaseCandidate(
    subscriptionId:
        Types.ObjectId,

    lockUntil:
        Date,
) {
    await PushSubscriptionModel.updateOne(
        {
            _id:
                subscriptionId,

            winBackLockUntil:
                lockUntil,
        },

        {
            $set: {
                winBackLockUntil:
                    null,
            },
        },
    );
}


async function advanceCandidate(
    subscriptionId:
        Types.ObjectId,

    lockUntil:
        Date,

    nextStage:
        1 |
        2,

    deliveredAt:
        Date,
) {
    return PushSubscriptionModel.updateOne(
        {
            _id:
                subscriptionId,

            winBackLockUntil:
                lockUntil,
        },

        {
            $set: {
                winBackStage:
                    nextStage,

                lastWinBackAt:
                    deliveredAt,

                winBackLockUntil:
                    null,
            },
        },
    );
}


export async function runWinBackNotifications(
    options: {
        dryRun?:
        boolean;

        limit?:
        number;
    } = {},
):
    Promise<WinBackRunSummary> {
    const dryRun =
        options.dryRun ===
        true;


    const requestedLimit =
        options.limit ??
        DEFAULT_BATCH_SIZE;


    const limit =
        Math.min(
            Math.max(
                requestedLimit,

                1,
            ),

            50,
        );


    await connectMongo();


    const runStartedAt =
        new Date();


    const sevenDayQuery =
        getSevenDayQuery(
            runStartedAt,
        );


    const fourteenDayQuery =
        getFourteenDayQuery(
            runStartedAt,
        );


    const [
        eligible7Day,
        eligible14Day,
    ] =
        await Promise.all([
            PushSubscriptionModel.countDocuments(
                sevenDayQuery,
            ),

            PushSubscriptionModel.countDocuments(
                fourteenDayQuery,
            ),
        ]);


    /*
     * Dry-run mode performs zero sends
     * and zero database mutations.
     */
    if (
        dryRun
    ) {
        return {
            dryRun:
                true,

            eligible7Day,

            eligible14Day,

            selected7Day:
                0,

            selected14Day:
                0,

            attempted:
                0,

            delivered:
                0,

            failed:
                0,

            removed:
                0,

            skipped:
                0,

            advancedToStage1:
                0,

            advancedToStage2:
                0,
        };
    }


    configureWebPush();


    /*
     * Prioritize subscribers already waiting
     * for their second/final reminder.
     */
    const fourteenDayCandidates =
        (
            await PushSubscriptionModel.find(
                fourteenDayQuery,
            )
                .select(
                    "_id endpoint keys enabled preferences lastSeenAt lastWinBackAt winBackStage winBackLockUntil",
                )
                .sort({
                    lastSeenAt:
                        1,
                })
                .limit(
                    limit,
                )
                .lean()
                .exec()
        ) as unknown as
        WinBackCandidate[];


    const remaining =
        Math.max(
            limit -
            fourteenDayCandidates.length,

            0,
        );


    const sevenDayCandidates =
        remaining >
            0
            ? (
                await PushSubscriptionModel.find(
                    sevenDayQuery,
                )
                    .select(
                        "_id endpoint keys enabled preferences lastSeenAt lastWinBackAt winBackStage winBackLockUntil",
                    )
                    .sort({
                        lastSeenAt:
                            1,
                    })
                    .limit(
                        remaining,
                    )
                    .lean()
                    .exec()
            ) as unknown as
            WinBackCandidate[]
            : [];


    let attempted =
        0;


    let delivered =
        0;


    let failed =
        0;


    let removed =
        0;


    let skipped =
        0;


    let advancedToStage1 =
        0;


    let advancedToStage2 =
        0;


    const jobs = [
        ...fourteenDayCandidates.map(
            (
                subscription,
            ) => ({
                subscription,

                stage:
                    1 as const,

                query:
                    fourteenDayQuery,
            }),
        ),

        ...sevenDayCandidates.map(
            (
                subscription,
            ) => ({
                subscription,

                stage:
                    0 as const,

                query:
                    sevenDayQuery,
            }),
        ),
    ];


    for (
        const job of
        jobs
    ) {
        /*
         * Atomic claim protects against another
         * invocation processing the same subscriber.
         */
        const {
            claimed,
            lockUntil,
        } =
            await claimCandidate(
                job.subscription,

                job.query,

                new Date(),
            );


        if (
            !claimed
        ) {
            skipped +=
                1;


            continue;
        }


        attempted +=
            1;


        const {
            nextStage,
            payload,
        } =
            buildWinBackPayload(
                job.stage,
            );


        const status =
            await deliverWinBackPush(
                claimed,

                payload,
            );


        if (
            status ===
            "removed"
        ) {
            removed +=
                1;


            continue;
        }


        if (
            status ===
            "failed"
        ) {
            failed +=
                1;


            /*
             * A temporary Push failure should not
             * advance the user's journey.
             */
            await releaseCandidate(
                claimed._id,

                lockUntil,
            );


            continue;
        }


        delivered +=
            1;


        const advanceResult =
            await advanceCandidate(
                claimed._id,

                lockUntil,

                nextStage,

                new Date(),
            );


        /*
         * If the user returned while delivery was
         * happening, activity tracking may already
         * have cleared the lock. We then intentionally
         * refuse to overwrite their fresh state.
         */
        if (
            advanceResult.modifiedCount ===
            0
        ) {
            skipped +=
                1;


            continue;
        }


        if (
            nextStage ===
            1
        ) {
            advancedToStage1 +=
                1;
        } else {
            advancedToStage2 +=
                1;
        }
    }


    return {
        dryRun:
            false,

        eligible7Day,

        eligible14Day,

        selected7Day:
            sevenDayCandidates.length,

        selected14Day:
            fourteenDayCandidates.length,

        attempted,

        delivered,

        failed,

        removed,

        skipped,

        advancedToStage1,

        advancedToStage2,
    };
}