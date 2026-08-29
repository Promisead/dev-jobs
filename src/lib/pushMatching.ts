import {
    descriptionToPlainText,
} from "@/lib/jobDescription";

import type {
    Job,
} from "@/models/Job";

import type {
    PushPreferences,
} from "@/models/PushSubscription";


/*
 * ========================================
 * NORMALIZATION
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


function normalizeStringArray(
    value:
        unknown,
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
            ):
                item is string =>
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
        );
}


/*
 * ========================================
 * LEGACY / DEFAULT PREFERENCES
 * ========================================
 *
 * This is extremely important.
 *
 * A subscriber who enabled notifications
 * before personalization existed may have
 * no `preferences` object in MongoDB.
 *
 * Missing preferences therefore mean:
 *
 * - new jobs ON
 * - announcements ON
 * - no filtering restrictions
 */

export function normalizePushPreferences(
    value:
        unknown,
):
    PushPreferences {
    const preferences =
        typeof value ===
            "object" &&
            value !==
            null
            ? value as
            Record<
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
        ) &&
        preferences
            .minSalary >=
        0
    ) {
        minSalary =
            preferences
                .minSalary;
    }


    return {
        /*
         * Only explicit false disables.
         *
         * Missing values stay enabled so older
         * subscriptions remain backwards compatible.
         */
        newJobs:
            preferences
                .newJobs !==
            false,

        specialAnnouncements:
            preferences
                .specialAnnouncements !==
            false,

        /*
         * Existing subscriptions were created before
         * career reminders existed, so a missing value
         * should behave as enabled.
         */
        careerReminders:
            preferences
                .careerReminders !==
            false,

        workModes:
            normalizeStringArray(
                preferences
                    .workModes,
            ),

        jobTypes:
            normalizeStringArray(
                preferences
                    .jobTypes,
            ),

        countries:
            normalizeStringArray(
                preferences
                    .countries,
            ),

        states:
            normalizeStringArray(
                preferences
                    .states,
            ),

        cities:
            normalizeStringArray(
                preferences
                    .cities,
            ),

        keywords:
            normalizeStringArray(
                preferences
                    .keywords,
            ),

        minSalary,
    };
}


/*
 * ========================================
 * LIST MATCHING
 * ========================================
 *
 * Empty selection means:
 *
 * ANY value is acceptable.
 */

function matchesSelectedValues(
    selectedValues:
        string[],

    actualValue:
        string,
) {
    if (
        selectedValues.length ===
        0
    ) {
        return true;
    }


    const normalizedActual =
        normalizeText(
            actualValue,
        );


    return selectedValues.some(
        (
            selectedValue,
        ) =>
            normalizeText(
                selectedValue,
            ) ===
            normalizedActual,
    );
}


/*
 * ========================================
 * KEYWORD MATCHING
 * ========================================
 *
 * Any matching keyword is enough.
 *
 * Example:
 *
 * preferences:
 * React, Node.js
 *
 * job:
 * Senior React Developer
 *
 * => match
 */

function matchesKeywords(
    preferences:
        PushPreferences,

    job:
        Job,
) {
    if (
        preferences
            .keywords
            .length ===
        0
    ) {
        return true;
    }


    const plainDescription =
        descriptionToPlainText(
            job.description ||
            "",
        );


    const searchableText =
        [
            job.title,

            job.orgName ||
            "",

            plainDescription,

            job.remote,

            job.type,

            job.country,

            job.state,

            job.city,
        ]
            .filter(
                Boolean,
            )
            .join(
                " ",
            )
            .toLowerCase();


    return preferences
        .keywords
        .some(
            (
                keyword,
            ) => {
                const normalizedKeyword =
                    normalizeText(
                        keyword,
                    );


                if (
                    !normalizedKeyword
                ) {
                    return false;
                }


                return searchableText.includes(
                    normalizedKeyword,
                );
            },
        );
}


/*
 * ========================================
 * SALARY MATCHING
 * ========================================
 */

function matchesMinimumSalary(
    preferences:
        PushPreferences,

    job:
        Job,
) {
    if (
        preferences
            .minSalary ===
        null
    ) {
        return true;
    }


    return (
        job.salary >=
        preferences
            .minSalary
    );
}


/*
 * ========================================
 * MAIN JOB MATCHER
 * ========================================
 */

export function matchesJobPreferences(
    rawPreferences:
        unknown,

    job:
        Job,
) {
    const preferences =
        normalizePushPreferences(
            rawPreferences,
        );


    /*
     * User explicitly disabled
     * automatic job notifications.
     */
    if (
        !preferences
            .newJobs
    ) {
        return false;
    }


    /*
     * Work mode.
     */
    if (
        !matchesSelectedValues(
            preferences
                .workModes,

            job.remote,
        )
    ) {
        return false;
    }


    /*
     * Employment type.
     */
    if (
        !matchesSelectedValues(
            preferences
                .jobTypes,

            job.type,
        )
    ) {
        return false;
    }


    /*
     * Country.
     */
    if (
        !matchesSelectedValues(
            preferences
                .countries,

            job.country,
        )
    ) {
        return false;
    }


    /*
     * State.
     */
    if (
        !matchesSelectedValues(
            preferences
                .states,

            job.state,
        )
    ) {
        return false;
    }


    /*
     * City.
     */
    if (
        !matchesSelectedValues(
            preferences
                .cities,

            job.city,
        )
    ) {
        return false;
    }


    /*
     * Salary threshold.
     */
    if (
        !matchesMinimumSalary(
            preferences,

            job,
        )
    ) {
        return false;
    }


    /*
     * Keyword match.
     */
    if (
        !matchesKeywords(
            preferences,

            job,
        )
    ) {
        return false;
    }


    return true;
}


/*
 * ========================================
 * SPECIAL ANNOUNCEMENT OPT-IN
 * ========================================
 *
 * Stage 8/9 will use this.
 */

export function wantsSpecialAnnouncements(
    rawPreferences:
        unknown,
) {
    return normalizePushPreferences(
        rawPreferences,
    )
        .specialAnnouncements;
}

/*
 * ========================================
 * CAREER REMINDER OPT-IN
 * ========================================
 *
 * Used by the win-back notification flow.
 *
 * Legacy subscriptions without the property
 * are treated as opted in because
 * normalizePushPreferences() defaults it to true.
 */

export function wantsCareerReminders(
    rawPreferences:
        unknown,
) {
    return normalizePushPreferences(
        rawPreferences,
    )
        .careerReminders;
}