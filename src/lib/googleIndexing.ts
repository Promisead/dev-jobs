import {
    GoogleAuth,
} from "google-auth-library";

import {
    SITE,
} from "@/lib/site";

export type GoogleIndexingNotificationType =
    | "URL_UPDATED"
    | "URL_DELETED";

type IndexingResult = {
    success: boolean;
    skipped: boolean;
    reason?: string;
};

const INDEXING_SCOPE =
    "https://www.googleapis.com/auth/indexing";

const INDEXING_ENDPOINT =
    "https://indexing.googleapis.com/v3/urlNotifications:publish";

function indexingEnabled() {
    return (
        process.env
            .GOOGLE_INDEXING_ENABLED ===
        "true"
    );
}

function getCredentials() {
    const clientEmail =
        process.env
            .GOOGLE_INDEXING_CLIENT_EMAIL;

    const rawPrivateKey =
        process.env
            .GOOGLE_INDEXING_PRIVATE_KEY;

    if (
        !clientEmail ||
        !rawPrivateKey
    ) {
        return null;
    }

    /*
     * Vercel environment variables normally
     * store line breaks as escaped \n.
     */
    const privateKey =
        rawPrivateKey.replace(
            /\\n/g,
            "\n"
        );

    return {
        client_email:
            clientEmail,

        private_key:
            privateKey,
    };
}

function validateJobUrl(
    url: string
) {
    const siteUrl =
        new URL(
            SITE.url
        );

    const targetUrl =
        new URL(
            url
        );

    /*
     * Never allow this service account to
     * submit arbitrary external URLs.
     */
    if (
        targetUrl.origin !==
        siteUrl.origin
    ) {
        throw new Error(
            "Google Indexing URL must belong to the Jobs website."
        );
    }

    /*
     * Google's Indexing API is being used
     * only for single JobPosting pages.
     */
    if (
        !targetUrl.pathname.startsWith(
            "/show/"
        )
    ) {
        throw new Error(
            "Google Indexing API may only be used for individual job URLs."
        );
    }

    return targetUrl.href;
}

export async function notifyGoogleIndexing(
    url: string,

    type:
        GoogleIndexingNotificationType
): Promise<IndexingResult> {
    /*
     * Never send indexing notifications
     * from local development unless you
     * deliberately override this design.
     */
    if (
        !indexingEnabled()
    ) {
        return {
            success:
                false,

            skipped:
                true,

            reason:
                "Google Indexing API is disabled.",
        };
    }

    /*
     * Production-only safeguard.
     */
    if (
        process.env.NODE_ENV !==
        "production"
    ) {
        return {
            success:
                false,

            skipped:
                true,

            reason:
                "Google Indexing notifications are production-only.",
        };
    }

    const credentials =
        getCredentials();

    if (!credentials) {
        console.warn(
            "Google Indexing API credentials are missing."
        );

        return {
            success:
                false,

            skipped:
                true,

            reason:
                "Missing Google Indexing credentials.",
        };
    }

    let validatedUrl:
        string;

    try {
        validatedUrl =
            validateJobUrl(
                url
            );
    } catch (error) {
        console.error(
            "Invalid Google Indexing URL:",

            error
        );

        return {
            success:
                false,

            skipped:
                true,

            reason:
                "Invalid job URL.",
        };
    }

    try {
        const auth =
            new GoogleAuth({
                credentials,

                scopes: [
                    INDEXING_SCOPE,
                ],
            });

        const client =
            await auth.getClient();

        await client.request({
            url:
                INDEXING_ENDPOINT,

            method:
                "POST",

            data: {
                url:
                    validatedUrl,

                type,
            },

            headers: {
                "Content-Type":
                    "application/json",
            },
        });

        console.info(
            `Google Indexing notification sent: ${type} ${validatedUrl}`
        );

        return {
            success:
                true,

            skipped:
                false,
        };
    } catch (error) {
        /*
         * Indexing failure MUST NOT undo a
         * successful job publication/update.
         *
         * Google indexing is secondary to
         * the application's core database.
         */
        console.error(
            `Google Indexing API ${type} failed for ${validatedUrl}:`,

            error
        );

        return {
            success:
                false,

            skipped:
                false,

            reason:
                "Google Indexing API request failed.",
        };
    }
}