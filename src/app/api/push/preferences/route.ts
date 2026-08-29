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


const ALLOWED_WORK_MODES =
    new Set([
        "remote",
        "hybrid",
        "onsite",
    ]);


const ALLOWED_JOB_TYPES =
    new Set([
        "full",
        "part",
        "project",
    ]);


type PushPreferencesLeanDocument = {
    preferences?:
    unknown;
};


function cleanStrings(
    value:
        unknown,

    maxItems =
        20,
) {
    if (
        !Array.isArray(
            value,
        )
    ) {
        return [];
    }


    return value
        .filter(
            (
                item,
            ): item is string =>
                typeof item ===
                "string",
        )
        .map(
            (
                item,
            ) =>
                item.trim(),
        )
        .filter(
            Boolean,
        )
        .slice(
            0,
            maxItems,
        );
}


function normalizePreferences(
    value:
        unknown,
) {
    const preferences =
        typeof value ===
            "object" &&
            value !==
            null
            ? value as Record<
                string,
                unknown
            >
            : {};


    let minSalary:
        number | null =
        null;


    if (
        typeof preferences
            .minSalary ===
        "number" &&
        Number.isFinite(
            preferences
                .minSalary,
        )
    ) {
        minSalary =
            preferences
                .minSalary;
    }


    return {
        newJobs:
            preferences
                .newJobs !==
            false,

        specialAnnouncements:
            preferences
                .specialAnnouncements !==
            false,

        /*
         * Existing subscriptions without this
         * field behave as enabled.
         */
        careerReminders:
            preferences
                .careerReminders !==
            false,

        workModes:
            cleanStrings(
                preferences
                    .workModes,
            ),

        jobTypes:
            cleanStrings(
                preferences
                    .jobTypes,
            ),

        countries:
            cleanStrings(
                preferences
                    .countries,
            ),

        states:
            cleanStrings(
                preferences
                    .states,
            ),

        cities:
            cleanStrings(
                preferences
                    .cities,
            ),

        keywords:
            cleanStrings(
                preferences
                    .keywords,

                10,
            ),

        minSalary,
    };
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
            Record<
                string,
                unknown
            >;


        if (
            typeof body.endpoint !==
            "string" ||
            body.endpoint.length >
            2048
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push subscription is required.",
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


        const subscription =
            (
                await PushSubscriptionModel.findOne({
                    endpoint:
                        body.endpoint,
                })
                    .select(
                        "preferences",
                    )
                    .lean()
                    .exec()
            ) as unknown as
            PushPreferencesLeanDocument |
            null;


        if (
            !subscription
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push subscription was not found.",
                },

                {
                    status:
                        404,
                },
            );
        }


        return NextResponse.json({
            success:
                true,

            preferences:
                normalizePreferences(
                    subscription
                        .preferences,
                ),
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to load push preferences:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to load notification preferences.",
            },

            {
                status:
                    500,
            },
        );
    }
}


export async function PATCH(
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
            Record<
                string,
                unknown
            >;


        if (
            typeof body.endpoint !==
            "string" ||
            body.endpoint.length >
            2048
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push subscription is required.",
                },

                {
                    status:
                        400,
                },
            );
        }


        const workModes =
            cleanStrings(
                body.workModes,
            ).filter(
                (
                    value,
                ) =>
                    ALLOWED_WORK_MODES.has(
                        value,
                    ),
            );


        const jobTypes =
            cleanStrings(
                body.jobTypes,
            ).filter(
                (
                    value,
                ) =>
                    ALLOWED_JOB_TYPES.has(
                        value,
                    ),
            );


        const countries =
            cleanStrings(
                body.countries,
            );


        const states =
            cleanStrings(
                body.states,
            );


        const cities =
            cleanStrings(
                body.cities,
            );


        const keywords =
            cleanStrings(
                body.keywords,

                10,
            );


        let minSalary:
            number | null =
            null;


        if (
            body.minSalary !==
            null &&
            body.minSalary !==
            undefined &&
            body.minSalary !==
            ""
        ) {
            const parsed =
                Number(
                    body.minSalary,
                );


            if (
                Number.isFinite(
                    parsed,
                ) &&
                parsed >=
                0
            ) {
                minSalary =
                    parsed;
            }
        }


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        const updated =
            (
                await PushSubscriptionModel.findOneAndUpdate(
                    {
                        endpoint:
                            body.endpoint,
                    },

                    {
                        $set: {
                            "preferences.newJobs":
                                body.newJobs !==
                                false,

                            "preferences.specialAnnouncements":
                                body.specialAnnouncements !==
                                false,

                            "preferences.careerReminders":
                                body.careerReminders !==
                                false,

                            "preferences.workModes":
                                workModes,

                            "preferences.jobTypes":
                                jobTypes,

                            "preferences.countries":
                                countries,

                            "preferences.states":
                                states,

                            "preferences.cities":
                                cities,

                            "preferences.keywords":
                                keywords,

                            "preferences.minSalary":
                                minSalary,
                        },
                    },

                    {
                        new:
                            true,

                        runValidators:
                            true,
                    },
                )
                    .select(
                        "preferences",
                    )
                    .lean()
                    .exec()
            ) as unknown as
            PushPreferencesLeanDocument |
            null;


        if (
            !updated
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push subscription was not found.",
                },

                {
                    status:
                        404,
                },
            );
        }


        return NextResponse.json({
            success:
                true,

            preferences:
                normalizePreferences(
                    updated
                        .preferences,
                ),
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to update push preferences:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to save notification preferences.",
            },

            {
                status:
                    500,
            },
        );
    }
}