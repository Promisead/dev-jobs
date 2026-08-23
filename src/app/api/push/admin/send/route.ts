import {
    PushAuthorizationError,
    requirePushAdmin,
} from "@/lib/pushAuthorization";

import {
    sendSpecialPushNotification,
} from "@/lib/pushNotifications";

import type {
    SpecialPushAudience,
    SpecialPushAudienceKind,
} from "@/lib/pushNotifications";

import {
    SITE,
} from "@/lib/site";

import {
    PushCampaignModel,
} from "@/models/PushCampaign";

import mongoose from "mongoose";

import {
    NextRequest,
    NextResponse,
} from "next/server";


const ALLOWED_AUDIENCE_KINDS =
    new Set([
        "all",
        "workMode",
        "jobType",
        "country",
        "state",
        "city",
    ]);


const ALLOWED_WORK_MODES =
    new Set([
        "remote",
        "hybrid",
        "onsite",
    ]);


const ALLOWED_JOB_TYPES =
    new Set([
        "full",
        "part",
        "project",
    ]);


class PushRequestError
    extends Error {
    status:
        number;


    constructor(
        message:
            string,

        status =
            400,
    ) {
        super(
            message,
        );


        this.name =
            "PushRequestError";


        this.status =
            status;
    }
}


/*
 * ========================================
 * CSRF / SAME-ORIGIN CHECK
 * ========================================
 */

function isAllowedOrigin(
    request:
        NextRequest,
) {
    const origin =
        request.headers.get(
            "origin",
        );


    if (
        !origin
    ) {
        return false;
    }


    return new Set([
        new URL(
            SITE.url,
        ).origin,

        "http://localhost:3000",
    ]).has(
        origin,
    );
}


function getString(
    value:
        unknown,
) {
    return typeof value ===
        "string"
        ? value.trim()
        : "";
}


/*
 * ========================================
 * DESTINATION
 * ========================================
 *
 * Notifications may only open URLs that
 * belong to D•C Jobs.
 */

function parseDestination(
    value:
        unknown,
) {
    const supplied =
        getString(
            value,
        ) ||
        "/";


    const site =
        new URL(
            SITE.url,
        );


    let target:
        URL;


    try {
        target =
            new URL(
                supplied,

                site,
            );
    } catch {
        throw new PushRequestError(
            "Invalid notification destination.",
        );
    }


    if (
        target.origin !==
        site.origin
    ) {
        throw new PushRequestError(
            "Notification destination must belong to D•C Jobs.",
        );
    }


    return target.href;
}


/*
 * ========================================
 * AUDIENCE
 * ========================================
 */

function parseAudience(
    value:
        unknown,
):
    SpecialPushAudience {
    const raw =
        typeof value ===
            "object" &&
            value !==
            null
            ? value as
            Record<
                string,
                unknown
            >
            : {};


    const kind =
        getString(
            raw.kind,
        ) ||
        "all";


    if (
        !ALLOWED_AUDIENCE_KINDS.has(
            kind,
        )
    ) {
        throw new PushRequestError(
            "Invalid notification audience.",
        );
    }


    if (
        kind ===
        "all"
    ) {
        return {
            kind:
                "all",
        };
    }


    const audienceValue =
        getString(
            raw.value,
        );


    if (
        !audienceValue
    ) {
        throw new PushRequestError(
            "Audience value is required.",
        );
    }


    if (
        audienceValue.length >
        120
    ) {
        throw new PushRequestError(
            "Audience value is too long.",
        );
    }


    if (
        kind ===
        "workMode" &&
        !ALLOWED_WORK_MODES.has(
            audienceValue,
        )
    ) {
        throw new PushRequestError(
            "Invalid work-mode audience.",
        );
    }


    if (
        kind ===
        "jobType" &&
        !ALLOWED_JOB_TYPES.has(
            audienceValue,
        )
    ) {
        throw new PushRequestError(
            "Invalid employment-type audience.",
        );
    }


    return {
        kind:
            kind as
            SpecialPushAudienceKind,

        value:
            audienceValue,
    };
}


/*
 * ========================================
 * SEND SPECIAL NOTIFICATION
 * ========================================
 */

export async function POST(
    request:
        NextRequest,
) {
    let campaignId:
        string |
        null =
        null;


    try {
        if (
            !isAllowedOrigin(
                request,
            )
        ) {
            throw new PushRequestError(
                "Invalid request origin.",

                403,
            );
        }


        /*
         * Authentication + Push Admin allowlist.
         */
        const user =
            await requirePushAdmin();


        const body =
            await request.json();


        const title =
            getString(
                body.title,
            );


        const message =
            getString(
                body.body,
            );


        if (
            !title
        ) {
            throw new PushRequestError(
                "Notification title is required.",
            );
        }


        if (
            title.length >
            80
        ) {
            throw new PushRequestError(
                "Notification title must be 80 characters or fewer.",
            );
        }


        if (
            !message
        ) {
            throw new PushRequestError(
                "Notification message is required.",
            );
        }


        if (
            message.length >
            240
        ) {
            throw new PushRequestError(
                "Notification message must be 240 characters or fewer.",
            );
        }


        const url =
            parseDestination(
                body.url,
            );


        const audience =
            parseAudience(
                body.audience,
            );


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        /*
         * Record the campaign BEFORE sending.
         *
         * This gives us an audit record even
         * if Web Push later fails.
         */
        const campaign =
            await PushCampaignModel.create({
                title,

                body:
                    message,

                url,

                audience,

                status:
                    "sending",

                createdByUserId:
                    user.id,

                createdByEmail:
                    user.email ||
                    null,
            });


        campaignId =
            String(
                campaign._id,
            );


        /*
         * ========================================
         * ACTUAL WEB PUSH DELIVERY
         * ========================================
         */

        const delivery =
            await sendSpecialPushNotification(
                {
                    title,

                    body:
                        message,

                    url,

                    tag:
                        `special-${campaignId}`,

                    icon:
                        "/icons/icon-192.png",

                    badge:
                        "/icons/icon-192.png",

                    renotify:
                        true,

                    type:
                        "special",
                },

                audience,
            );


        /*
         * "sent" means the campaign execution
         * completed.
         *
         * Individual provider failures remain
         * visible through the delivery counters.
         */
        await PushCampaignModel.findByIdAndUpdate(
            campaignId,

            {
                $set: {
                    status:
                        "sent",

                    attempted:
                        delivery.attempted,

                    delivered:
                        delivery.delivered,

                    failed:
                        delivery.failed,

                    removed:
                        delivery.removed,

                    sentAt:
                        new Date(),

                    failureReason:
                        null,
                },
            },
        );


        return NextResponse.json({
            success:
                true,

            campaignId,

            audience,

            delivery,
        });
    } catch (
    error
    ) {
        /*
         * If a campaign had already been
         * created, mark it failed.
         */
        if (
            campaignId
        ) {
            try {
                await PushCampaignModel.findByIdAndUpdate(
                    campaignId,

                    {
                        $set: {
                            status:
                                "failed",

                            failureReason:
                                error instanceof
                                    Error
                                    ? error.message.slice(
                                        0,

                                        500,
                                    )
                                    : "Notification delivery failed.",
                        },
                    },
                );
            } catch (
            updateError
            ) {
                console.error(
                    "Unable to mark Push campaign as failed:",
                    updateError,
                );
            }
        }


        if (
            error instanceof
            PushAuthorizationError
        ) {
            return NextResponse.json(
                {
                    error:
                        error.message,
                },

                {
                    status:
                        error.status,
                },
            );
        }


        if (
            error instanceof
            PushRequestError
        ) {
            return NextResponse.json(
                {
                    error:
                        error.message,
                },

                {
                    status:
                        error.status,
                },
            );
        }


        console.error(
            "Unable to send special notification:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to send notification.",
            },

            {
                status:
                    500,
            },
        );
    }
}