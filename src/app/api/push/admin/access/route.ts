import {
    getPushAdminAccess,
} from "@/lib/pushAuthorization";

import {
    NextResponse,
} from "next/server";


export const dynamic =
    "force-dynamic";


export async function GET() {
    const access =
        await getPushAdminAccess();


    /*
     * Do not expose the configured allowlist.
     *
     * Only report the current caller's state.
     */

    return NextResponse.json(
        {
            authenticated:
                access
                    .authenticated,

            authorized:
                access
                    .authorized,

            user: access.user
                ? {
                    id:
                        access.user.id,

                    email:
                        access.user.email ||
                        null,
                }
                : null,
        },

        {
            headers: {
                "Cache-Control":
                    "no-store",
            },
        },
    );
}