import {
    InferSchemaType,
    Model,
    models,
    model,
    Schema,
} from "mongoose";

const PostingAccessRequestSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        accountEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        workEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160,
        },

        companyWebsite: {
            type: String,
            default: null,
            trim: true,
            maxlength: 500,
        },

        role: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
            ],
            default: "pending",
            required: true,
            index: true,
        },

        emailNotificationStatus: {
            type: String,
            enum: [
                "pending",
                "sent",
                "failed",
            ],
            default: "pending",
            required: true,
        },

        emailSentAt: {
            type: Date,
            default: null,
        },

        emailError: {
            type: String,
            default: null,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    },
);

/*
 * A user may have historical approved/rejected
 * requests, but may only have one active
 * pending request at a time.
 */
PostingAccessRequestSchema.index(
    {
        userId: 1,
    },
    {
        unique: true,

        partialFilterExpression: {
            status: "pending",
        },
    },
);

export type PostingAccessRequest =
    InferSchemaType<
        typeof PostingAccessRequestSchema
    >;

export const PostingAccessRequestModel =
    (
        models.PostingAccessRequest as
        Model<PostingAccessRequest>
    ) ||
    model<PostingAccessRequest>(
        "PostingAccessRequest",
        PostingAccessRequestSchema,
    );