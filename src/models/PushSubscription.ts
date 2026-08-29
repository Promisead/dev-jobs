import {
    model,
    models,
    Schema,
} from "mongoose";


export type PushPreferences = {
    newJobs:
    boolean;

    specialAnnouncements:
    boolean;

    careerReminders:
    boolean;

    workModes:
    string[];

    jobTypes:
    string[];

    countries:
    string[];

    states:
    string[];

    cities:
    string[];

    keywords:
    string[];

    minSalary:
    number | null;
};


export type StoredPushSubscription = {
    endpoint:
    string;

    expirationTime?:
    number | null;

    keys: {
        p256dh:
        string;

        auth:
        string;
    };

    userId?:
    string | null;

    enabled:
    boolean;

    preferences:
    PushPreferences;

    /*
     * ========================================
     * ENGAGEMENT
     * ========================================
     */

    lastSeenAt?:
    Date | null;

    lastPushClickAt?:
    Date | null;

    lastPushCampaign?:
    string | null;

    lastPushId?:
    string | null;

    createdAt?:
    Date;

    updatedAt?:
    Date;
};


const PushPreferencesSchema =
    new Schema(
        {
            newJobs: {
                type:
                    Boolean,

                default:
                    true,
            },

            specialAnnouncements: {
                type:
                    Boolean,

                default:
                    true,
            },

            /*
             * Used later by the win-back flow.
             *
             * Users can disable these reminders
             * without disabling normal job alerts.
             */
            careerReminders: {
                type:
                    Boolean,

                default:
                    true,
            },

            workModes: {
                type:
                    [String],

                default:
                    [],
            },

            jobTypes: {
                type:
                    [String],

                default:
                    [],
            },

            countries: {
                type:
                    [String],

                default:
                    [],
            },

            states: {
                type:
                    [String],

                default:
                    [],
            },

            cities: {
                type:
                    [String],

                default:
                    [],
            },

            keywords: {
                type:
                    [String],

                default:
                    [],
            },

            minSalary: {
                type:
                    Number,

                default:
                    null,
            },
        },

        {
            _id:
                false,
        },
    );


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

            preferences: {
                type:
                    PushPreferencesSchema,

                default:
                    () => ({
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
                    }),
            },


            /*
             * ========================================
             * ACTIVITY
             * ========================================
             *
             * These are intentionally minimal.
             *
             * We do not store fingerprints,
             * device IDs or unnecessary browser data.
             */

            lastSeenAt: {
                type:
                    Date,

                default:
                    null,

                index:
                    true,
            },

            lastPushClickAt: {
                type:
                    Date,

                default:
                    null,
            },

            lastPushCampaign: {
                type:
                    String,

                default:
                    null,
            },

            lastPushId: {
                type:
                    String,

                default:
                    null,
            },
        },

        {
            timestamps:
                true,
        },
    );


PushSubscriptionSchema.index({
    enabled:
        1,

    "preferences.newJobs":
        1,
});


PushSubscriptionSchema.index({
    enabled:
        1,

    "preferences.specialAnnouncements":
        1,
});


PushSubscriptionSchema.index({
    enabled:
        1,

    "preferences.careerReminders":
        1,

    lastSeenAt:
        1,
});


export const PushSubscriptionModel =
    models.PushSubscription ||
    model(
        "PushSubscription",
        PushSubscriptionSchema,
    );