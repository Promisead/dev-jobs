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
        status: number
    ) {
        super(
            message
        );

        this.name =
            "JobAuthorizationError";

        this.status =
            status;
    }
}

export async function requireOrganizationMembership(
    orgId: string
) {
    const {
        user,
    } =
        await getUser();

    if (!user) {
        throw new JobAuthorizationError(
            "Authentication is required.",
            401
        );
    }

    const apiKey =
        process.env
            .WORKOS_API_KEY;

    if (!apiKey) {
        throw new Error(
            "WORKOS_API_KEY is not configured."
        );
    }

    const workos =
        new WorkOS(
            apiKey
        );

    const memberships =
        await workos.userManagement.listOrganizationMemberships({
            userId:
                user.id,
        });

    const membership =
        memberships.data.find(
            (
                currentMembership
            ) =>
                currentMembership.organizationId ===
                orgId
        );

    if (!membership) {
        throw new JobAuthorizationError(
            "You do not have permission to manage jobs for this organisation.",
            403
        );
    }

    return {
        user,

        membership,
    };
}