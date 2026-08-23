import {
    Job,
} from "@/models/Job";

import type {
    PushPreferences,
} from "@/models/PushSubscription";


function normalize(
    value:
        string,
) {
    return value
        .trim()
        .toLowerCase();
}


function matchesList(
    selected:
        string[],

    actual:
        string,
) {
    /*
     * Empty preference means:
     * "I don't care about this field."
     */
    if (
        selected.length ===
        0
    ) {
        return true;
    }


    const normalizedActual =
        normalize(
            actual,
        );


    return selected.some(
        (
            item,
        ) =>
            normalize(
                item,
            ) ===
            normalizedActual,
    );
}


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


    const haystack =
        [
            job.title,

            job.orgName,

            job.city,

            job.state,

            job.country,

            /*
             * Description contains sanitized HTML,
             * but keyword inclusion is still useful.
             */
            job.description,
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
            ) =>
                haystack.includes(
                    normalize(
                        keyword,
                    ),
                ),
        );
}


export function matchesJobPreferences(
    preferences:
        PushPreferences,

    job:
        Job,
) {
    if (
        !preferences
            .newJobs
    ) {
        return false;
    }


    if (
        !matchesList(
            preferences
                .workModes,

            job.remote,
        )
    ) {
        return false;
    }


    if (
        !matchesList(
            preferences
                .jobTypes,

            job.type,
        )
    ) {
        return false;
    }


    if (
        !matchesList(
            preferences
                .countries,

            job.country,
        )
    ) {
        return false;
    }


    if (
        !matchesList(
            preferences
                .states,

            job.state,
        )
    ) {
        return false;
    }


    if (
        !matchesList(
            preferences
                .cities,

            job.city,
        )
    ) {
        return false;
    }


    const minimumSalary =
        preferences
            .minSalary;


    if (
        typeof minimumSalary ===
        "number" &&
        job.salary <
        minimumSalary
    ) {
        return false;
    }


    return matchesKeywords(
        preferences,
        job,
    );
}