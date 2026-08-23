import {
    model,
    models,
    Schema,
} from "mongoose";


export type PushCampaignStatus =
    | "sending"
    | "sent"
    | "failed";


const PushCampaignSchema =
    new Schema(
        {
            title: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    80,
            },

            body: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    240,
            },

            url: {
                type:
                    String,

                required:
                    true,
            },

            audience: {
                kind: {
                    type:
                        String,

                    required:
                        true,

                    enum: [
                        "all",
                        "workMode",
                        "jobType",
                        "country",
                        "state",
                        "city",
                    ],
                },

                value: {
                    type:
                        String,

                    default:
                        null,

                    maxlength:
                        120,
                },
            },

            status: {
                type:
                    String,

                enum: [
                    "sending",
                    "sent",
                    "failed",
                ],

                default:
                    "sending",

                index:
                    true,
            },

            attempted: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,
            },

            delivered: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,
            },

            failed: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,
            },

            removed: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,
            },

            createdByUserId: {
                type:
                    String,

                required:
                    true,

                index:
                    true,
            },

            createdByEmail: {
                type:
                    String,

                default:
                    null,
            },

            sentAt: {
                type:
                    Date,

                default:
                    null,
            },

            failureReason: {
                type:
                    String,

                default:
                    null,

                maxlength:
                    500,
            },
        },

        {
            timestamps:
                true,
        },
    );


PushCampaignSchema.index({
    createdAt:
        -1,
});


export const PushCampaignModel =
    models.PushCampaign ||
    model(
        "PushCampaign",
        PushCampaignSchema,
    );