import {
    runWinBackNotifications,
} from "@/lib/winBackNotifications";

import {
    NextRequest,
    NextResponse,
} from "next/server";


export const runtime =
    "nodejs";


export const dynamic =
    "force-dynamic";


export const maxDuration =
    60;


function isAuthorized(
    request:
        NextRequest,
) {
    const secret =
        process.env
            .CRON_SECRET;


    if (
        !secret
    ) {
        return false;
    }


    const authorization =
        request.headers.get(
            "authorization",
        );


    return (
        authorization ===
        `Bearer ${secret}`
    );
}


export async function GET(
    request:
        NextRequest,
) {
    try {
        if (
            !process.env
                .CRON_SECRET
        ) {
            console.error(
                "Win-back cron unavailable: CRON_SECRET is not configured.",
            );


            return NextResponse.json(
                {
                    error:
                        "Cron service is not configured.",
                },

                {
                    status:
                        503,
                },
            );
        }


        if (
            !isAuthorized(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized.",
                },

                {
                    status:
                        401,
                },
            );
        }


        const dryRun =
            request.nextUrl
                .searchParams
                .get(
                    "dryRun",
                ) ===
            "1";


        const summary =
            await runWinBackNotifications({
                dryRun,

                limit:
                    20,
            });


        const response =
            NextResponse.json({
                success:
                    true,

                executedAt:
                    new Date()
                        .toISOString(),

                summary,
            });


        response.headers.set(
            "Cache-Control",
            "no-store",
        );


        return response;
    } catch (
    error
    ) {
        console.error(
            "Win-back cron execution failed:",
            error,
        );


        return NextResponse.json(
            {
                success:
                    false,

                error:
                    "Unable to run win-back notifications.",
            },

            {
                status:
                    500,
            },
        );
    }
}