"use client";

import {
    sendGAEvent,
} from "@next/third-parties/google";

type AnalyticsValue =
    | string
    | number
    | boolean
    | undefined;

type AnalyticsParams =
    Record<
        string,
        AnalyticsValue | object[]
    >;

export function trackEvent(
    eventName: string,
    params:
        AnalyticsParams = {}
) {
    sendGAEvent(
        "event",
        eventName,
        {
            platform:
                "dev_champions_jobs",

            site_section:
                "jobs",

            ...params,
        }
    );
}

/*
 * GA recommended search event.
 */
export function trackSearch(
    searchTerm: string
) {
    if (!searchTerm.trim()) {
        return;
    }

    trackEvent(
        "search",
        {
            search_term:
                searchTerm.trim(),
        }
    );
}

/*
 * GA recommended item-view event.
 *
 * A job behaves like the content/item
 * being viewed in this application.
 */
export function trackJobView({
    jobId,
    jobTitle,
    companyName,
    location,
    employmentType,
    workMode,
}: {
    jobId: string;

    jobTitle: string;

    companyName: string;

    location: string;

    employmentType:
    string;

    workMode: string;
}) {
    trackEvent(
        "view_item",
        {
            job_id:
                jobId,

            job_title:
                jobTitle,

            company_name:
                companyName,

            job_location:
                location,

            employment_type:
                employmentType,

            work_mode:
                workMode,

            items: [
                {
                    item_id:
                        jobId,

                    item_name:
                        jobTitle,

                    item_brand:
                        companyName,

                    item_category:
                        "Job",

                    item_category2:
                        location,

                    item_variant:
                        employmentType,
                },
            ],
        }
    );
}

/*
 * Job listing -> job detail interaction.
 */
export function trackJobSelect({
    jobId,
    jobTitle,
    companyName,
}: {
    jobId: string;

    jobTitle: string;

    companyName: string;
}) {
    trackEvent(
        "select_content",
        {
            content_type:
                "job",

            content_id:
                jobId,

            job_id:
                jobId,

            job_title:
                jobTitle,

            company_name:
                companyName,
        }
    );
}

/*
 * Custom engagement metric.
 *
 * Only fire this AFTER the server confirms
 * that the like/unlike operation succeeded.
 */
export function trackJobLike({
    jobId,
    jobTitle,
    companyName,
    liked,
    likesCount,
}: {
    jobId: string;

    jobTitle: string;

    companyName: string;

    liked: boolean;

    likesCount: number;
}) {
    trackEvent(
        liked
            ? "job_like"
            : "job_unlike",
        {
            job_id:
                jobId,

            job_title:
                jobTitle,

            company_name:
                companyName,

            likes_count:
                likesCount,
        }
    );
}

/*
 * Application intent.
 *
 * We deliberately do NOT call this
 * generate_lead because clicking an email
 * or phone link does not prove the person
 * completed an application.
 */
export function trackJobApplyClick({
    jobId,
    jobTitle,
    companyName,
    method,
}: {
    jobId: string;

    jobTitle: string;

    companyName: string;

    method:
    | "email"
    | "phone"
    | "external";
}) {
    trackEvent(
        "job_apply_click",
        {
            job_id:
                jobId,

            job_title:
                jobTitle,

            company_name:
                companyName,

            application_method:
                method,
        }
    );
}

/*
 * Employer-side success.
 */
export function trackJobPublished({
    jobId,
    jobTitle,
}: {
    jobId: string;

    jobTitle: string;
}) {
    trackEvent(
        "job_publish_success",
        {
            job_id:
                jobId,

            job_title:
                jobTitle,
        }
    );
}

/*
 * Dev Champions authority/referral funnel.
 */
export function trackEcosystemClick({
    destination,
    url,
    linkText,
}: {
    destination:
    | "dev_champions"
    | "tech_path"
    | "tech_core"
    | "calendly";

    url: string;

    linkText: string;
}) {
    trackEvent(
        "ecosystem_click",
        {
            destination_product:
                destination,

            link_url:
                url,

            link_text:
                linkText,
        }
    );
}