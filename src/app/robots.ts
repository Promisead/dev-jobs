import {
    SITE,
} from "@/lib/site";

import type {
    MetadataRoute,
} from "next";

export default function robots():
    MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent:
                    "*",

                allow:
                    "/",

                disallow: [
                    "/api/",
                    "/sign-out",
                ],
            },
        ],

        sitemap:
            `${SITE.url}/sitemap.xml`,

        host:
            SITE.url,
    };
}