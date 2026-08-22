import {
    getUser,
} from "@workos-inc/authkit-nextjs";

import {
    WorkOS,
} from "@workos-inc/node";


export class JobAuthorizationError extends Error {
    status: number;

    constructor(
        message: string,
        status: number,
    ) {
        super(message);

        this.name =
            "JobAuthorizationError";

        this.status =
            status;
    }
}


/*
 * ========================================
 * APPROVED D•C JOB PUBLISHERS
 * ========================================
 *
 * Supports:
 *
 * APPROVED_JOB_POSTERS=
 * user_01ABC123,
 * employer@example.com
 *
 * WorkOS remains responsible for identity.
 * This is our platform-level approval layer.
 */

function getApprovedPosterIdentifiers() {
    const configured =
        process.env
            .APPROVED_JOB_POSTERS ??
        "";

    return new Set(
        configured
            .split(",")
            .map(
                (value) =>
                    value
                        .trim()
                        .toLowerCase(),
            )
            .filter(Boolean),
    );
}


type PosterIdentity = {
    id: string;

    email?:
    | string
    | null;
};


/*
 * ========================================
 * CHECK PLATFORM APPROVAL
 * ========================================
 */

export function isApprovedJobPoster(
    user:
        | PosterIdentity
        | null
        | undefined,
) {
    if (!user) {
        return false;
    }

    const approved =
        getApprovedPosterIdentifiers();

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
            ),
        )
    );
}


/*
 * ========================================
 * READ ACCESS STATE FOR UI
 * ========================================
 *
 * This is useful for displaying the
 * professional "posting requires approval"
 * screen without throwing an exception.
 */

export async function getJobPosterAccess() {
    const {
        user,
    } =
        await getUser();

    return {
        user,

        approved:
            isApprovedJobPoster(
                user,
            ),
    };
}


/*
 * ========================================
 * REQUIRE PLATFORM APPROVAL
 * ========================================
 */

export async function requireApprovedJobPoster() {
    const {
        user,
    } =
        await getUser();

    if (!user) {
        throw new JobAuthorizationError(
            "Authentication is required.",
            401,
        );
    }

    if (
        !isApprovedJobPoster(
            user,
        )
    ) {
        throw new JobAuthorizationError(
            "Your account has not been approved to publish jobs on D•C Jobs.",
            403,
        );
    }

    return user;
}


/*
 * ========================================
 * REQUIRE ACTIVE WORKOS MEMBERSHIP
 * ========================================
 *
 * Two authorization layers:
 *
 * 1. D•C Jobs publisher approval
 * 2. Active WorkOS organization membership
 *
 * A platform-approved recruiter still cannot
 * publish for an organization they do not
 * belong to.
 */

export async function requireOrganizationMembership(
    orgId: string,
) {
    if (!orgId) {
        throw new JobAuthorizationError(
            "Organisation ID is required.",
            400,
        );
    }

    /*
     * First check D•C Jobs approval.
     */
    const user =
        await requireApprovedJobPoster();

    const apiKey =
        process.env
            .WORKOS_API_KEY;

    if (!apiKey) {
        throw new Error(
            "WORKOS_API_KEY is not configured.",
        );
    }

    const workos =
        new WorkOS(
            apiKey,
        );

    /*
     * Ask WorkOS only about the requested
     * organization instead of loading all
     * memberships and trusting browser data.
     */
    const memberships =
        await workos.userManagement.listOrganizationMemberships(
            {
                userId:
                    user.id,

                organizationId:
                    orgId,
            },
        );

    /*
     * WorkOS membership must actually be active.
     */
    const membership =
        memberships.data.find(
            (
                currentMembership,
            ) =>
                currentMembership.status ===
                "active",
        );

    if (!membership) {
        throw new JobAuthorizationError(
            "You do not have permission to manage jobs for this organisation.",
            403,
        );
    }

    return {
        user,

        membership,
    };
}