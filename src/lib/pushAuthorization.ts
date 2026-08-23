import {
    getUser,
} from "@workos-inc/authkit-nextjs";


/*
 * ========================================
 * PUSH AUTHORIZATION ERROR
 * ========================================
 */

export class PushAuthorizationError
    extends Error {
    status:
        number;


    constructor(
        message:
            string,

        status:
            number,
    ) {
        super(
            message,
        );


        this.name =
            "PushAuthorizationError";


        this.status =
            status;
    }
}


/*
 * ========================================
 * ADMIN IDENTITY
 * ========================================
 */

type PushAdminIdentity = {
    id:
    string;

    email?:
    string |
    null;
};


/*
 * ========================================
 * READ ADMIN ALLOWLIST
 * ========================================
 *
 * Supports:
 *
 * PUSH_NOTIFICATION_ADMINS=
 * user_123,
 * admin@example.com;
 * second@example.com
 *
 * Commas, semicolons and newlines work.
 */

function getPushAdminIdentifiers() {
    const configured =
        process.env
            .PUSH_NOTIFICATION_ADMINS ??
        "";


    return new Set(
        configured
            .split(
                /[,;\n]+/,
            )
            .map(
                (
                    value,
                ) =>
                    value
                        .trim()
                        .toLowerCase(),
            )
            .filter(
                Boolean,
            ),
    );
}


/*
 * ========================================
 * CHECK AN IDENTITY
 * ========================================
 *
 * Pure function.
 *
 * No WorkOS request occurs here.
 */

export function isPushAdmin(
    user:
        PushAdminIdentity |
        null |
        undefined,
) {
    if (
        !user
    ) {
        return false;
    }


    const approved =
        getPushAdminIdentifiers();


    /*
     * Fail closed.
     *
     * Empty environment variable does NOT
     * grant access to everybody.
     */
    if (
        approved.size ===
        0
    ) {
        return false;
    }


    const userId =
        user.id
            .trim()
            .toLowerCase();


    const email =
        user.email
            ?.trim()
            .toLowerCase();


    return (
        approved.has(
            userId,
        ) ||
        Boolean(
            email &&
            approved.has(
                email,
            )
        )
    );
}


/*
 * ========================================
 * READ ADMIN ACCESS
 * ========================================
 *
 * Useful for server-rendered admin pages.
 *
 * Does not throw merely because the user
 * isn't a Push Admin.
 */

export async function getPushAdminAccess() {
    try {
        const {
            user,
        } =
            await getUser();


        return {
            user,

            authenticated:
                Boolean(
                    user,
                ),

            authorized:
                isPushAdmin(
                    user,
                ),
        };
    } catch (
    error
    ) {
        /*
         * Authentication infrastructure errors
         * must never accidentally authorize.
         */
        console.error(
            "Unable to determine Push Admin access:",
            error,
        );


        return {
            user:
                null,

            authenticated:
                false,

            authorized:
                false,
        };
    }
}


/*
 * ========================================
 * REQUIRE PUSH ADMIN
 * ========================================
 *
 * This is the guard our future special
 * notification routes will use.
 */

export async function requirePushAdmin() {
    let user:
        PushAdminIdentity |
        null =
        null;


    try {
        const result =
            await getUser();


        user =
            result.user;
    } catch (
    error
    ) {
        console.error(
            "Unable to verify Push Admin session:",
            error,
        );


        throw new PushAuthorizationError(
            "Unable to verify your administrator session.",

            401,
        );
    }


    if (
        !user
    ) {
        throw new PushAuthorizationError(
            "Authentication is required.",

            401,
        );
    }


    if (
        !isPushAdmin(
            user,
        )
    ) {
        throw new PushAuthorizationError(
            "You are not authorized to send D•C Jobs notifications.",

            403,
        );
    }


    return user;
}