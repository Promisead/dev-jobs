import {
    isApprovedJobPoster,
} from "@/lib/jobAuthorization";



import {
    PostingAccessRequestModel,
} from "@/models/PostingAccessRequest";

import {
    getUser,
} from "@workos-inc/authkit-nextjs";

import mongoose from "mongoose";

import {
    NextRequest,
    NextResponse,
} from "next/server";

export const runtime = "nodejs";

export const dynamic =
    "force-dynamic";

type RequestBody = {
    name?: unknown;

    workEmail?: unknown;

    companyName?: unknown;

    companyWebsite?: unknown;

    role?: unknown;

    message?: unknown;
};

function cleanString(
    value: unknown,
    maxLength: number,
) {
    if (
        typeof value !==
        "string"
    ) {
        return "";
    }

    return value
        .trim()
        .slice(
            0,
            maxLength,
        );
}

function isValidEmail(
    value: string,
) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value,
    );
}

function normalizeWebsite(
    value: string,
) {
    if (!value) {
        return null;
    }

    try {
        const url =
            new URL(value);

        if (
            url.protocol !==
            "https:" &&
            url.protocol !==
            "http:"
        ) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}

async function connectMongo() {
    const mongoUri =
        process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error(
            "MONGO_URI is not configured.",
        );
    }

    if (
        mongoose.connection
            .readyState === 1
    ) {
        return;
    }

    await mongoose.connect(
        mongoUri,
    );
}

/*
 * ========================================
 * GET CURRENT REQUEST
 * ========================================
 *
 * Lets the form detect that this user
 * already has a request under review.
 */
export async function GET() {
    try {
        const {
            user,
        } = await getUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Authentication is required.",
                },
                {
                    status: 401,
                },
            );
        }

        if (
            isApprovedJobPoster(
                user,
            )
        ) {
            return NextResponse.json(
                {
                    success: true,
                    approved: true,
                    pending: null,
                },
                {
                    headers: {
                        "Cache-Control":
                            "no-store",
                    },
                },
            );
        }

        await connectMongo();

        const pending =
            await PostingAccessRequestModel
                .findOne({
                    userId:
                        user.id,

                    status:
                        "pending",
                })
                .select(
                    "_id companyName status createdAt emailNotificationStatus",
                )
                .lean();

        return NextResponse.json(
            {
                success: true,

                approved: false,

                pending:
                    pending
                        ? {
                            id:
                                pending._id
                                    .toString(),

                            companyName:
                                pending.companyName,

                            status:
                                pending.status,

                            createdAt:
                                pending.createdAt,

                            emailNotificationStatus:
                                pending.emailNotificationStatus,
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
    } catch (error) {
        console.error(
            "Unable to load posting access request:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Unable to load your request.",
            },
            {
                status: 500,
            },
        );
    }
}

/*
 * ========================================
 * CREATE ACCESS REQUEST
 * ========================================
 */
export async function POST(
    request: NextRequest,
) {
    try {
        const {
            user,
        } = await getUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Please sign in before requesting posting access.",
                },
                {
                    status: 401,
                },
            );
        }

        if (
            isApprovedJobPoster(
                user,
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Your account already has job posting access.",
                },
                {
                    status: 409,
                },
            );
        }

        const body =
            (
                await request.json()
            ) as RequestBody;

        const name =
            cleanString(
                body.name,
                120,
            );

        const workEmail =
            cleanString(
                body.workEmail,
                254,
            ).toLowerCase();

        const companyName =
            cleanString(
                body.companyName,
                160,
            );

        const rawCompanyWebsite =
            cleanString(
                body.companyWebsite,
                500,
            );

        const role =
            cleanString(
                body.role,
                120,
            );

        const message =
            cleanString(
                body.message,
                3000,
            );

        if (
            !name ||
            !workEmail ||
            !companyName ||
            !role ||
            !message
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Please complete all required fields.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !isValidEmail(
                workEmail,
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Please enter a valid work email address.",
                },
                {
                    status: 400,
                },
            );
        }

        const companyWebsite =
            rawCompanyWebsite
                ? normalizeWebsite(
                    rawCompanyWebsite,
                )
                : null;

        if (
            rawCompanyWebsite &&
            !companyWebsite
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Please enter a valid company website beginning with http:// or https://.",
                },
                {
                    status: 400,
                },
            );
        }

        const accountEmail =
            user.email
                ?.trim()
                .toLowerCase();

        if (!accountEmail) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Your signed-in account does not have an email address.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectMongo();

        /*
         * Check first for a nicer response.
         * The unique partial MongoDB index is still
         * the final race-condition protection.
         */
        const existing =
            await PostingAccessRequestModel
                .findOne({
                    userId:
                        user.id,

                    status:
                        "pending",
                })
                .select(
                    "_id companyName createdAt",
                )
                .lean();

        if (existing) {
            return NextResponse.json(
                {
                    success: false,

                    error:
                        "You already have a posting access request under review.",

                    pending: {
                        id:
                            existing._id
                                .toString(),

                        companyName:
                            existing.companyName,

                        createdAt:
                            existing.createdAt,
                    },
                },
                {
                    status: 409,
                },
            );
        }

        /*
         * ========================================
         * SAVE FIRST
         * ========================================
         *
         * This is intentionally BEFORE EmailJS.
         *
         * The request must never disappear simply
         * because email delivery failed.
         */
        const accessRequest =
            await PostingAccessRequestModel.create({
                userId:
                    user.id,

                accountEmail,

                name,

                workEmail,

                companyName,

                companyWebsite,

                role,

                message,

                status:
                    "pending",

                emailNotificationStatus:
                    "pending",
            });

        /*
         * ========================================
         * EMAIL SECOND
         * ========================================
         */


        return NextResponse.json(
            {
                success: true,

                message:
                    "Your posting access request has been received and is now under review.",

                request: {
                    id:
                        accessRequest._id
                            .toString(),

                    companyName,

                    status:
                        "pending",

                    createdAt:
                        accessRequest.createdAt,
                },
            },
            {
                status: 201,

                headers: {
                    "Cache-Control":
                        "no-store",
                },
            },
        );
    } catch (error) {
        /*
         * Mongo duplicate-key race condition.
         */
        if (
            typeof error ===
            "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "You already have a posting access request under review.",
                },
                {
                    status: 409,
                },
            );
        }

        console.error(
            "Posting access request failed:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Unable to submit your request right now. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}

/*
 * ========================================
 * UPDATE EMAIL DELIVERY STATUS
 * ========================================
 *
 * The browser sends through EmailJS and
 * reports the result here.
 *
 * A user can only update their own request.
 */
export async function PATCH(
    request: NextRequest,
) {
    try {
        const {
            user,
        } = await getUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Authentication is required.",
                },
                {
                    status: 401,
                },
            );
        }

        const body =
            await request.json();

        const requestId =
            typeof body.requestId ===
                "string"
                ? body.requestId.trim()
                : "";

        const status =
            body.status;

        if (
            !requestId ||
            ![
                "sent",
                "failed",
            ].includes(status)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid email status update.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                requestId,
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Invalid request ID.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectMongo();

        const emailError =
            typeof body.error ===
                "string"
                ? body.error
                    .trim()
                    .slice(
                        0,
                        1000,
                    )
                : null;

        const result =
            await PostingAccessRequestModel.updateOne(
                {
                    _id:
                        requestId,

                    userId:
                        user.id,
                },
                {
                    $set: {
                        emailNotificationStatus:
                            status,

                        emailSentAt:
                            status ===
                                "sent"
                                ? new Date()
                                : null,

                        emailError:
                            status ===
                                "failed"
                                ? emailError ||
                                "Browser EmailJS delivery failed."
                                : null,
                    },
                },
            );

        if (
            result.matchedCount ===
            0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Posting access request not found.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                headers: {
                    "Cache-Control":
                        "no-store",
                },
            },
        );
    } catch (error) {
        console.error(
            "Unable to update posting access email status:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Unable to update email status.",
            },
            {
                status: 500,
            },
        );
    }
}