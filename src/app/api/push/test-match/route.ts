import {
    matchesJobPreferences,
    normalizePushPreferences,
} from "@/lib/pushMatching";

import {
    PushSubscriptionModel,
} from "@/models/PushSubscription";

import type {
    Job,
} from "@/models/Job";

import mongoose from "mongoose";

import {
    NextRequest,
    NextResponse,
} from "next/server";


/*
 * ========================================
 * LOCAL STAGE-7 TEST ONLY
 * ========================================
 *
 * This endpoint must never be usable on
 * the public production website.
 */

function isLocalRequest(
    request:
        NextRequest,
) {
    const host =
        request.headers.get(
            "host",
        ) || "";


    return (
        host.startsWith(
            "localhost:",
        ) ||
        host.startsWith(
            "127.0.0.1:",
        )
    );
}


export async function POST(
    request:
        NextRequest,
) {
    try {
        if (
            !isLocalRequest(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "This test endpoint is available only on localhost.",
                },

                {
                    status:
                        404,
                },
            );
        }


        const body =
            await request.json();


        if (
            typeof body.endpoint !==
            "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push subscription endpoint is required.",
                },

                {
                    status:
                        400,
                },
            );
        }


        await mongoose.connect(
            process.env
                .MONGO_URI as string,
        );


        const subscription =
            (
                await PushSubscriptionModel.findOne({
                    endpoint:
                        body.endpoint,
                })
                    .select(
                        "preferences enabled",
                    )
                    .lean()
                    .exec()
            ) as unknown as
            {
                enabled?:
                boolean;

                preferences?:
                unknown;
            } |
            null;


        if (
            !subscription
        ) {
            return NextResponse.json(
                {
                    error:
                        "Subscription not found.",
                },

                {
                    status:
                        404,
                },
            );
        }


        /*
         * Synthetic job.
         *
         * Nothing is written to the Job collection.
         */
        const mockJob:
            Job = {
            _id:
                "stage7-test-job",

            title:
                typeof body.title ===
                    "string"
                    ? body.title
                    : "React Frontend Engineer",

            description:
                typeof body.description ===
                    "string"
                    ? body.description
                    : "<p>React, Next.js and frontend development.</p>",

            orgName:
                "Stage 7 Test Company",

            orgId:
                "stage7-test-org",

            remote:
                typeof body.remote ===
                    "string"
                    ? body.remote
                    : "remote",

            type:
                typeof body.type ===
                    "string"
                    ? body.type
                    : "full",

            salary:
                typeof body.salary ===
                    "number"
                    ? body.salary
                    : 700000,

            country:
                typeof body.country ===
                    "string"
                    ? body.country
                    : "Nigeria",

            state:
                typeof body.state ===
                    "string"
                    ? body.state
                    : "Lagos",

            city:
                typeof body.city ===
                    "string"
                    ? body.city
                    : "Lagos",

            countryId:
                "test-country",

            stateId:
                "test-state",

            cityId:
                "test-city",

            jobIcon:
                "",

            contactPhoto:
                "",

            contactName:
                "Stage 7 Test",

            contactPhone:
                "00000000000",

            contactEmail:
                "test@example.com",

            createdAt:
                new Date()
                    .toISOString(),

            updatedAt:
                new Date()
                    .toISOString(),
        };


        const normalizedPreferences =
            normalizePushPreferences(
                subscription
                    .preferences,
            );


        const matched =
            Boolean(
                subscription
                    .enabled !==
                false &&
                matchesJobPreferences(
                    subscription
                        .preferences,

                    mockJob,
                ),
            );


        return NextResponse.json({
            success:
                true,

            matched,

            enabled:
                subscription
                    .enabled !==
                false,

            preferences:
                normalizedPreferences,

            mockJob: {
                title:
                    mockJob.title,

                remote:
                    mockJob.remote,

                type:
                    mockJob.type,

                salary:
                    mockJob.salary,

                country:
                    mockJob.country,

                state:
                    mockJob.state,

                city:
                    mockJob.city,
            },
        });
    } catch (
    error
    ) {
        console.error(
            "Stage 7 match test failed:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to test push matching.",
            },

            {
                status:
                    500,
            },
        );
    }
}