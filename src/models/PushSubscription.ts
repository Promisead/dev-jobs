import {
    model,
    models,
    Schema,
} from "mongoose";


export type StoredPushSubscription = {
    endpoint: string;

    expirationTime?:
    number | null;

    keys: {
        p256dh: string;
        auth: string;
    };

    userId?:
    string | null;

    enabled:
    boolean;

    createdAt?:
    Date;

    updatedAt?:
    Date;
};


const PushSubscriptionSchema =
    new Schema(
        {
            endpoint: {
                type:
                    String,

                required:
                    true,

                unique:
                    true,

                index:
                    true,
            },

            expirationTime: {
                type:
                    Number,

                default:
                    null,
            },

            keys: {
                p256dh: {
                    type:
                        String,

                    required:
                        true,
                },

                auth: {
                    type:
                        String,

                    required:
                        true,
                },
            },

            /*
             * Optional.
             *
             * Anonymous job seekers can still
             * subscribe.
             *
             * Logged-in users can additionally
             * be associated with their WorkOS ID.
             */
            userId: {
                type:
                    String,

                default:
                    null,

                index:
                    true,
            },

            enabled: {
                type:
                    Boolean,

                default:
                    true,

                index:
                    true,
            },
        },

        {
            timestamps:
                true,
        },
    );


export const PushSubscriptionModel =
    models.PushSubscription ||
    model(
        "PushSubscription",
        PushSubscriptionSchema,
    );