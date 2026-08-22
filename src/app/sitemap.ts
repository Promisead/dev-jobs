import {
    SEO_LOCATION_LIST,
} from "@/lib/seoLocations";

import {
    SITE,
} from "@/lib/site";

import {
    JobModel,
} from "@/models/Job";

import mongoose from "mongoose";

import type {
    MetadataRoute,
} from "next";

/*
 * Generate on request rather than during
 * next build, so production compilation
 * is not dependent on MongoDB availability.
 */
export const dynamic =
    "force-dynamic";

type SitemapJob = {
    _id: unknown;

    updatedAt?:
    | string
    | Date;

    createdAt?:
    | string
    | Date;
};

export default async function sitemap():
    Promise<MetadataRoute.Sitemap> {
    await mongoose.connect(
        process.env
            .MONGO_URI as string
    );

    const rawJobs =
        await JobModel.find({})
            .select(
                "_id createdAt updatedAt"
            )
            .sort({
                updatedAt:
                    -1,
            })
            .lean()
            .exec();

    const jobs =
        rawJobs as unknown as
        SitemapJob[];

    /*
     * Strategic permanent landing pages.
     *
     * We deliberately do not put filtered
     * query-string URLs into the sitemap.
     */
    const strategicPages:
        MetadataRoute.Sitemap =
        [
            {
                url:
                    SITE.url,

                changeFrequency:
                    "daily",

                priority:
                    1,
            },

            {
                url:
                    `${SITE.url}/remote-jobs`,

                changeFrequency:
                    "daily",

                priority:
                    0.9,
            },

            ...SEO_LOCATION_LIST.map(
                (
                    location
                ) => ({
                    url:
                        `${SITE.url}/locations/${location.slug}`,

                    changeFrequency:
                        "daily" as const,

                    priority:
                        location.slug ===
                            "nigeria"
                            ? 0.95
                            : 0.9,
                })
            ),
        ];

    const jobPages:
        MetadataRoute.Sitemap =
        jobs.map(
            (job) => {
                const lastModified =
                    job.updatedAt ||
                    job.createdAt;

                return {
                    url:
                        `${SITE.url}/show/${String(
                            job._id
                        )}`,

                    /*
                     * Only send lastModified when
                     * Mongo actually has a meaningful
                     * content timestamp.
                     */
                    ...(lastModified
                        ? {
                            lastModified:
                                new Date(
                                    lastModified
                                ),
                        }
                        : {}),

                    changeFrequency:
                        "daily",

                    priority:
                        0.9,
                };
            }
        );

    return [
        ...strategicPages,

        ...jobPages,
    ];
}