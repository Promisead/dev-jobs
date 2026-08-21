import {
    signOut,
} from "@workos-inc/authkit-nextjs";

export const dynamic =
    "force-dynamic";

export async function POST() {
    /*
     * REAL SERVER-SIDE LOGOUT.
     *
     * This file only runs on the Next.js server.
     *
     * WorkOS signOut() handles the authenticated
     * session and redirects through the WorkOS
     * logout flow.
     */
    return signOut();
}