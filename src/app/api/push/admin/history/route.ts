import {
    PushAuthorizationError,
    requirePushAdmin,
} from "@/lib/pushAuthorization";

import {
    PushCampaignModel,
} from "@/models/PushCampaign";

import mongoose from "mongoose";

import {
    NextResponse,
} from "next/server";


export const dynamic =
    "force-dynamic";


type LeanCampaign = {
    _id:
    unknown;

    title?:
    string;

    body?:
    string;

    url?:
    string;

    audience?: {
        kind?:
        string;

        value?:
        string |
        null;
    };

    status?:
    string;

    attempted?:
    number;

    delivered?:
    number;

    failed?:
    number;

    removed?:
    number;

    createdByEmail?:
    string |
    null;

    sentAt?:
    Date |
    string |
    null;

    createdAt?:
    Date |
    string;

    failureReason?:
    string |
    null;
};


export async function GET() {
    try {
        await requirePushAdmin();


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        const rawCampaigns =
            await PushCampaignModel.find({})
                .sort({
                    createdAt:
                        -1,
                })
                .limit(
                    25,
                )
                .lean()
                .exec();


        const campaigns =
            rawCampaigns as unknown as
            LeanCampaign[];


        return NextResponse.json(
            {
                campaigns:
                    campaigns.map(
                        (
                            campaign,
                        ) => ({
                            id:
                                String(
                                    campaign._id,
                                ),

                            title:
                                campaign.title ||
                                "",

                            body:
                                campaign.body ||
                                "",

                            url:
                                campaign.url ||
                                "/",

                            audience: {
                                kind:
                                    campaign
                                        .audience
                                        ?.kind ||
                                    "all",

                                value:
                                    campaign
                                        .audience
                                        ?.value ||
                                    null,
                            },

                            status:
                                campaign.status ||
                                "failed",

                            attempted:
                                campaign.attempted ||
                                0,

                            delivered:
                                campaign.delivered ||
                                0,

                            failed:
                                campaign.failed ||
                                0,

                            removed:
                                campaign.removed ||
                                0,

                            createdByEmail:
                                campaign.createdByEmail ||
                                null,

                            sentAt:
                                campaign.sentAt
                                    ? new Date(
                                        campaign.sentAt,
                                    )
                                        .toISOString()
                                    : null,

                            createdAt:
                                campaign.createdAt
                                    ? new Date(
                                        campaign.createdAt,
                                    )
                                        .toISOString()
                                    : null,

                            failureReason:
                                campaign.failureReason ||
                                null,
                        }),
                    ),
            },

            {
                headers: {
                    "Cache-Control":
                        "no-store",
                },
            },
        );
    } catch (
    error
    ) {
        if (
            error instanceof
            PushAuthorizationError
        ) {
            return NextResponse.json(
                {
                    error:
                        error.message,
                },

                {
                    status:
                        error.status,
                },
            );
        }


        console.error(
            "Unable to load Push notification history:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to load notification history.",
            },

            {
                status:
                    500,
            },
        );
    }
}