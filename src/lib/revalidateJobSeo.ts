import {
    revalidatePath,
} from "next/cache";

import type {
    Job,
} from "@/models/Job";

function normalize(
    value:
        string | undefined
) {
    return (
        value
            ?.trim()
            .toLowerCase() ||
        ""
    );
}

function isRemoteJob(
    value:
        string | undefined
) {
    const normalized =
        normalize(
            value
        );

    return (
        normalized ===
        "remote" ||
        normalized ===
        "fully remote"
    );
}

export function revalidateJobSeoPaths(
    job:
        Partial<Job> & {
            _id?: unknown;
        }
) {
    /*
     * Main discovery page.
     */
    revalidatePath(
        "/"
    );

    /*
     * Dynamic XML sitemap.
     */
    revalidatePath(
        "/sitemap.xml"
    );

    /*
     * Company page.
     */
    if (job.orgId) {
        revalidatePath(
            `/jobs/${job.orgId}`
        );
    }

    /*
     * Individual canonical job page.
     */
    if (job._id) {
        revalidatePath(
            `/show/${String(
                job._id
            )}`
        );
    }

    /*
     * Country landing page.
     */
    const country =
        normalize(
            job.country
        );

    if (
        country ===
        "nigeria"
    ) {
        revalidatePath(
            "/locations/nigeria"
        );
    }

    /*
     * Local SEO landing pages.
     */
    const state =
        normalize(
            job.state
        );

    const city =
        normalize(
            job.city
        );

    if (
        state ===
        "lagos" ||
        state ===
        "lagos state" ||
        city ===
        "lagos"
    ) {
        revalidatePath(
            "/locations/lagos"
        );
    }

    if (
        city ===
        "abuja" ||
        state ===
        "abuja" ||
        state ===
        "fct" ||
        state ===
        "federal capital territory" ||
        state ===
        "abuja federal capital territory"
    ) {
        revalidatePath(
            "/locations/abuja"
        );
    }

    if (
        city ===
        "ibadan"
    ) {
        revalidatePath(
            "/locations/ibadan"
        );
    }

    if (
        state ===
        "ogun" ||
        state ===
        "ogun state"
    ) {
        revalidatePath(
            "/locations/ogun"
        );
    }

    if (
        isRemoteJob(
            job.remote
        )
    ) {
        revalidatePath(
            "/remote-jobs"
        );
    }
}