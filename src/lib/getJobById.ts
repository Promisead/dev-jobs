import {
    addOrgAndUserData,
    Job,
    JobModel,
} from "@/models/Job";

import mongoose from "mongoose";

export async function getJobById(
    jobId: string
): Promise<Job | null> {
    /*
     * Never send malformed IDs into Mongo.
     */
    if (
        !mongoose.isValidObjectId(
            jobId
        )
    ) {
        return null;
    }

    await mongoose.connect(
        process.env
            .MONGO_URI as string
    );

    const rawJobDoc =
        await JobModel.findById(
            jobId
        )
            .lean()
            .exec();

    if (!rawJobDoc) {
        return null;
    }

    /*
     * Reuse the existing enrichment logic.
     *
     * This also backfills orgName for old
     * jobs that were created before the
     * company name was persisted locally.
     *
     * null means there is no authenticated
     * user required for this public query.
     */
    const jobs =
        await addOrgAndUserData(
            [
                rawJobDoc as unknown as Job,
            ],

            null
        );

    return (
        jobs[0] ??
        null
    );
}