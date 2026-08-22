import {
    descriptionToPlainText,
    normalizeJobDescription,
} from "@/lib/jobDescription";

import {
    SITE,
} from "@/lib/site";

import type {
    Job,
} from "@/models/Job";

/*
 * ------------------------------------------------
 * BASIC JOB SEO HELPERS
 * ------------------------------------------------
 */

export function getJobCanonicalUrl(
    jobId: string
) {
    return `${SITE.url}/show/${jobId}`;
}

export function isFullyRemote(
    value: string
) {
    const normalized =
        value
            ?.trim()
            .toLowerCase();

    return (
        normalized ===
        "remote" ||
        normalized ===
        "fully remote"
    );
}

export function formatWorkMode(
    value: string
) {
    const normalized =
        value
            ?.trim()
            .toLowerCase();

    const labels:
        Record<
            string,
            string
        > = {
        remote:
            "Fully remote",

        "fully remote":
            "Fully remote",

        onsite:
            "On-site",

        "on-site":
            "On-site",

        hybrid:
            "Hybrid",
    };

    return (
        labels[
        normalized
        ] ||
        value ||
        "Not specified"
    );
}

export function formatJobType(
    value: string
) {
    const normalized =
        value
            ?.trim()
            .toLowerCase();

    const labels:
        Record<
            string,
            string
        > = {
        full:
            "Full-time",

        "full-time":
            "Full-time",

        part:
            "Part-time",

        "part-time":
            "Part-time",

        project:
            "Project",

        contract:
            "Contract",

        contractor:
            "Contract",

        internship:
            "Internship",

        intern:
            "Internship",

        temporary:
            "Temporary",
    };

    return (
        labels[
        normalized
        ] ||
        value ||
        "Not specified"
    );
}

/*
 * Google only accepts specific,
 * case-sensitive employmentType values.
 */
export function getSchemaEmploymentType(
    value: string
) {
    const normalized =
        value
            ?.trim()
            .toLowerCase();

    const types:
        Record<
            string,
            string
        > = {
        full:
            "FULL_TIME",

        "full-time":
            "FULL_TIME",

        part:
            "PART_TIME",

        "part-time":
            "PART_TIME",

        project:
            "CONTRACTOR",

        contract:
            "CONTRACTOR",

        contractor:
            "CONTRACTOR",

        temporary:
            "TEMPORARY",

        internship:
            "INTERN",

        intern:
            "INTERN",
    };

    return (
        types[
        normalized
        ] ||
        "OTHER"
    );
}

/*
 * ------------------------------------------------
 * LOCATION
 * ------------------------------------------------
 */

export function getJobLocationText(
    job: Job
) {
    if (
        isFullyRemote(
            job.remote
        )
    ) {
        return job.country
            ? `Remote — ${job.country}`
            : "Remote";
    }

    return [
        job.city,
        job.state,
        job.country,
    ]
        .filter(Boolean)
        .join(", ");
}

/*
 * ------------------------------------------------
 * SALARY
 * ------------------------------------------------
 *
 * Your current form stores salary in
 * thousands of naira:
 *
 * 700 = ₦700,000/month
 *
 * Therefore Google must receive 700000,
 * not 700.
 */

export function getMonthlySalaryNaira(
    salary: number
) {
    const value =
        Number(
            salary
        );

    if (
        !Number.isFinite(
            value
        ) ||
        value <= 0
    ) {
        return null;
    }

    return (
        value *
        1000
    );
}

export function formatJobSalary(
    salary: number
) {
    const amount =
        getMonthlySalaryNaira(
            salary
        );

    if (!amount) {
        return "Not specified";
    }

    return `${new Intl.NumberFormat(
        "en-NG",
        {
            style:
                "currency",

            currency:
                "NGN",

            maximumFractionDigits:
                0,
        }
    ).format(amount)} / month`;
}

/*
 * ------------------------------------------------
 * DATES
 * ------------------------------------------------
 */

function toIsoDate(
    value:
        | string
        | Date
        | undefined
) {
    if (!value) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(
                value
            );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toISOString();
}

export function formatJobPostedDate(
    value:
        | string
        | Date
        | undefined
) {
    if (!value) {
        return "Not specified";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(
                value
            );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Not specified";
    }

    return new Intl.DateTimeFormat(
        "en-NG",
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric",
        }
    ).format(
        date
    );
}

/*
 * ------------------------------------------------
 * META TITLE + DESCRIPTION
 * ------------------------------------------------
 */

export function getJobMetaTitle(
    job: Job
) {
    const companyName =
        job.orgName?.trim() ||
        "Hiring Company";

    return `${job.title} at ${companyName}`;
}

function truncateMetaDescription(
    value: string,
    maxLength = 160
) {
    const normalized =
        value.replace(
            /\s+/g,
            " "
        ).trim();

    if (
        normalized.length <=
        maxLength
    ) {
        return normalized;
    }

    const shortened =
        normalized
            .slice(
                0,
                maxLength - 1
            )
            .replace(
                /\s+\S*$/,
                ""
            )
            .trim();

    return `${shortened}…`;
}

export function getJobMetaDescription(
    job: Job
) {
    const companyName =
        job.orgName?.trim() ||
        "Hiring Company";

    const location =
        getJobLocationText(
            job
        );

    const description =
        descriptionToPlainText(
            job.description
        );

    const lead =
        `Apply for ${job.title} at ${companyName}.` +
        (
            location
                ? ` ${location}.`
                : ""
        );

    return truncateMetaDescription(
        `${lead} ${description}`
    );
}

/*
 * ------------------------------------------------
 * JSON-LD HELPERS
 * ------------------------------------------------
 */

function escapeHtml(
    value: string
) {
    const characters:
        Record<
            string,
            string
        > = {
        "&":
            "&amp;",

        "<":
            "&lt;",

        ">":
            "&gt;",

        '"':
            "&quot;",

        "'":
            "&#039;",
    };

    return value.replace(
        /[&<>"']/g,
        (
            character
        ) =>
            characters[
            character
            ]
    );
}

export function safeJsonLd(
    value: unknown
) {
    return JSON.stringify(
        value
    ).replace(
        /</g,
        "\\u003c"
    );
}

/*
 * ------------------------------------------------
 * GOOGLE JOBPOSTING SCHEMA
 * ------------------------------------------------
 */

export function buildJobPostingSchema(
    job: Job
):
    Record<
        string,
        unknown
    > | null {
    const jobId =
        String(
            job._id
        );

    const title =
        job.title?.trim();

    const companyName =
        job.orgName?.trim();

    const datePosted =
        toIsoDate(
            job.createdAt
        );

    const safeDescription =
        normalizeJobDescription(
            job.description
        );

    /*
     * Don't emit incomplete JobPosting markup.
     *
     * Invalid structured data is worse than
     * simply having no JobPosting schema.
     */
    if (
        !title ||
        !companyName ||
        !datePosted ||
        !safeDescription ||
        !job.country
    ) {
        return null;
    }

    const remote =
        isFullyRemote(
            job.remote
        );

    /*
     * Google requires remote status to be
     * clear in the job description.
     *
     * This text corresponds directly with
     * the visible remote notice on the page.
     */
    const schemaDescription =
        remote
            ? `<p>Work mode: Fully remote. Applicant location: ${escapeHtml(
                job.country
            )}.</p>${safeDescription}`
            : safeDescription;

    const schema:
        Record<
            string,
            unknown
        > = {
        "@context":
            "https://schema.org",

        "@type":
            "JobPosting",

        title,

        description:
            schemaDescription,

        identifier: {
            "@type":
                "PropertyValue",

            name:
                companyName,

            value:
                jobId,
        },

        datePosted,

        employmentType:
            getSchemaEmploymentType(
                job.type
            ),

        hiringOrganization: {
            "@type":
                "Organization",

            name:
                companyName,
        },

        url:
            getJobCanonicalUrl(
                jobId
            ),

        /*
         * Email/phone instructions on the
         * page take the user directly to the
         * hiring representative.
         */
        directApply:
            Boolean(
                job.contactEmail ||
                job.contactPhone
            ),
    };

    /*
     * FULLY REMOTE
     */
    if (remote) {
        schema.jobLocationType =
            "TELECOMMUTE";

        schema.applicantLocationRequirements =
        {
            "@type":
                "Country",

            name:
                job.country,
        };
    } else {
        /*
         * PHYSICAL / HYBRID JOB
         */
        schema.jobLocation =
        {
            "@type":
                "Place",

            address: {
                "@type":
                    "PostalAddress",

                ...(job.city
                    ? {
                        addressLocality:
                            job.city,
                    }
                    : {}),

                ...(job.state
                    ? {
                        addressRegion:
                            job.state,
                    }
                    : {}),

                addressCountry:
                    job.country,
            },
        };
    }

    /*
     * SALARY
     */
    const salary =
        getMonthlySalaryNaira(
            job.salary
        );

    if (salary) {
        schema.baseSalary =
        {
            "@type":
                "MonetaryAmount",

            currency:
                "NGN",

            value: {
                "@type":
                    "QuantitativeValue",

                value:
                    salary,

                unitText:
                    "MONTH",
            },
        };
    }

    /*
     * Do NOT invent validThrough here.
     *
     * When employers start supplying actual
     * application deadlines, we'll include it.
     */

    return schema;
}