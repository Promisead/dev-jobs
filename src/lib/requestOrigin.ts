import {
    NextRequest,
} from "next/server";

import {
    SITE,
} from "@/lib/site";


function cleanHeaderValue(
    value: string | null,
) {
    if (!value) {
        return null;
    }

    return (
        value
            .split(",")[0]
            ?.trim() || null
    );
}


export function isAllowedAppOrigin(
    request: NextRequest,
) {
    const origin =
        request.headers.get(
            "origin",
        );


    if (!origin) {
        return false;
    }


    const allowedOrigins =
        new Set<string>([
            new URL(
                SITE.url,
            ).origin,

            "http://localhost:3000",
        ]);


    /*
     * ========================================
     * CURRENT REQUEST ORIGIN
     * ========================================
     *
     * This is important for Vercel Preview
     * deployments.
     *
     * We are NOT allowing arbitrary
     * *.vercel.app domains.
     *
     * We only allow the exact host handling
     * the current request.
     */

    try {
        allowedOrigins.add(
            request.nextUrl.origin,
        );
    } catch {
        // Ignore malformed URL.
    }


    /*
     * ========================================
     * REVERSE PROXY / VERCEL HOST
     * ========================================
     */

    const forwardedHost =
        cleanHeaderValue(
            request.headers.get(
                "x-forwarded-host",
            ),
        );


    const host =
        forwardedHost ||
        cleanHeaderValue(
            request.headers.get(
                "host",
            ),
        );


    const forwardedProtocol =
        cleanHeaderValue(
            request.headers.get(
                "x-forwarded-proto",
            ),
        );


    const protocol =
        forwardedProtocol ||
        request.nextUrl.protocol.replace(
            ":",
            "",
        );


    if (
        host &&
        protocol
    ) {
        allowedOrigins.add(
            `${protocol}://${host}`,
        );
    }


    return allowedOrigins.has(
        origin,
    );
}