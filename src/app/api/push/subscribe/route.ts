import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import {
    isAllowedAppOrigin,
} from "@/lib/requestOrigin";

import {
    getUser,
} from "@workos-inc/authkit-nextjs";

import mongoose from "mongoose";

import {
    NextRequest,
    NextResponse,
} from "next/server";


type SubscriptionPayload = {
    endpoint?:
    unknown;

    expirationTime?:
    unknown;

    keys?: {
        p256dh?:
        unknown;

        auth?:
        unknown;
    };
};


function isValidSubscription(
    value:
        SubscriptionPayload,
) {
    if (
        typeof value.endpoint !==
        "string" ||
        !value.endpoint.startsWith(
            "https://",
        ) ||
        value.endpoint.length >
        2048
    ) {
        return false;
    }


    if (
        typeof value.keys
            ?.p256dh !==
        "string" ||
        typeof value.keys
            ?.auth !==
        "string"
    ) {
        return false;
    }


    if (
        value.keys.p256dh.length >
        1024 ||
        value.keys.auth.length >
        1024
    ) {
        return false;
    }


    return true;
}


export async function POST(
    request:
        NextRequest,
) {
    try {
        if (
            !isAllowedAppOrigin(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },

                {
                    status:
                        403,
                },
            );
        }


        const body =
            (await request.json()) as
            SubscriptionPayload;


        if (
            !isValidSubscription(
                body,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid push subscription.",
                },

                {
                    status:
                        400,
                },
            );
        }


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        let userId:
            string | null =
            null;


        try {
            const {
                user,
            } =
                await getUser();


            userId =
                user?.id ??
                null;
        } catch {
            /*
             * Anonymous visitors remain allowed
             * to receive Push notifications.
             */
            userId =
                null;
        }


        const now =
            new Date();


        await PushSubscriptionModel.findOneAndUpdate(
            {
                endpoint:
                    body.endpoint,
            },

            {
                $set: {
                    expirationTime:
                        typeof body.expirationTime ===
                            "number"
                            ? body.expirationTime
                            : null,

                    keys: {
                        p256dh:
                            body.keys!
                                .p256dh,

                        auth:
                            body.keys!
                                .auth,
                    },

                    userId,

                    enabled:
                        true,

                    /*
                     * Subscription creation/resync occurs
                     * while the visitor is actively using
                     * D•C Jobs.
                     */
                    lastSeenAt:
                        now,
                },

                $setOnInsert: {
                    preferences: {
                        newJobs:
                            true,

                        specialAnnouncements:
                            true,

                        careerReminders:
                            true,

                        workModes:
                            [],

                        jobTypes:
                            [],

                        countries:
                            [],

                        states:
                            [],

                        cities:
                            [],

                        keywords:
                            [],

                        minSalary:
                            null,
                    },

                    lastPushClickAt:
                        null,

                    lastPushCampaign:
                        null,

                    lastPushId:
                        null,
                },
            },

            {
                upsert:
                    true,

                new:
                    true,

                setDefaultsOnInsert:
                    true,

                runValidators:
                    true,
            },
        );


        return NextResponse.json({
            subscribed:
                true,
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to save push subscription:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to enable job alerts.",
            },

            {
                status:
                    500,
            },
        );
    }
}


export async function DELETE(
    request:
        NextRequest,
) {
    try {
        if (
            !isAllowedAppOrigin(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },

                {
                    status:
                        403,
                },
            );
        }


        const body =
            (await request.json()) as {
                endpoint?:
                unknown;
            };


        if (
            typeof body.endpoint !==
            "string" ||
            body.endpoint.length >
            2048
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid push subscription.",
                },

                {
                    status:
                        400,
                },
            );
        }


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        await PushSubscriptionModel.deleteOne({
            endpoint:
                body.endpoint,
        });


        return NextResponse.json({
            subscribed:
                false,
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to remove push subscription:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to disable job alerts.",
            },

            {
                status:
                    500,
            },
        );
    }
}