import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import {
    isAllowedAppOrigin,
} from "@/lib/requestOrigin";

import mongoose from "mongoose";

import {
    NextRequest,
    NextResponse,
} from "next/server";


type ActivityPayload = {
    endpoint?:
    unknown;

    source?:
    unknown;

    campaign?:
    unknown;

    pushId?:
    unknown;
};


function cleanShortText(
    value:
        unknown,

    maxLength =
        120,
) {
    if (
        typeof value !==
        "string"
    ) {
        return null;
    }


    const cleaned =
        value
            .trim()
            .slice(
                0,
                maxLength,
            );


    return cleaned ||
        null;
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
            ActivityPayload;


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


        const source =
            body.source ===
                "notification_click"
                ? "notification_click"
                : "site_visit";


        const campaign =
            cleanShortText(
                body.campaign,
            );


        const pushId =
            cleanShortText(
                body.pushId,
            );


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        const now =
            new Date();


        const update:
            Record<
                string,
                unknown
            > = {
            lastSeenAt:
                now,
        };


        if (
            source ===
            "notification_click"
        ) {
            update.lastPushClickAt =
                now;


            update.lastPushCampaign =
                campaign;


            update.lastPushId =
                pushId;
        }


        const result =
            await PushSubscriptionModel.updateOne(
                {
                    endpoint:
                        body.endpoint,

                    enabled:
                        true,
                },

                {
                    $set:
                        update,
                },
            );


        return NextResponse.json({
            success:
                true,

            matched:
                result.matchedCount >
                0,
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to update push activity:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to update activity.",
            },

            {
                status:
                    500,
            },
        );
    }
}