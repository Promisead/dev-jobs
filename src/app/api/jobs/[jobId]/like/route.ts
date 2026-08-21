import {
    JobModel,
} from "@/models/Job";

import {
    getUser,
} from "@workos-inc/authkit-nextjs";

import mongoose from "mongoose";

type RouteContext = {
    params: {
        jobId: string;
    };
};

export async function POST(
    request: Request,
    {
        params,
    }: RouteContext
) {
    try {
        const { user } =
            await getUser();

        /*
         * Likes belong to real users,
         * so anonymous visitors cannot
         * create persistent likes.
         */
        if (!user) {
            return Response.json(
                {
                    error:
                        "Please sign in to like this job.",
                },
                {
                    status: 401,
                }
            );
        }

        await mongoose.connect(
            process.env
                .MONGO_URI as string
        );

        const job =
            await JobModel.findById(
                params.jobId
            ).select(
                "likedBy title"
            );

        if (!job) {
            return Response.json(
                {
                    error:
                        "Job not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const likedBy: string[] =
            Array.isArray(
                job.likedBy
            )
                ? job.likedBy
                : [];

        const alreadyLiked =
            likedBy.includes(
                user.id
            );

        /*
         * Standard toggle:
         *
         * not liked -> like
         * liked     -> unlike
         */
        const updatedJob =
            await JobModel.findByIdAndUpdate(
                params.jobId,
                alreadyLiked
                    ? {
                        $pull: {
                            likedBy:
                                user.id,
                        },
                    }
                    : {
                        $addToSet: {
                            likedBy:
                                user.id,
                        },
                    },
                {
                    new: true,
                }
            ).select("likedBy");

        if (!updatedJob) {
            return Response.json(
                {
                    error:
                        "Unable to update job.",
                },
                {
                    status: 404,
                }
            );
        }

        const updatedLikes =
            Array.isArray(
                updatedJob.likedBy
            )
                ? updatedJob.likedBy
                : [];

        return Response.json({
            liked:
                !alreadyLiked,

            likesCount:
                updatedLikes.length,

            message:
                alreadyLiked
                    ? "Like removed."
                    : "You liked this post.",
        });
    } catch (error) {
        console.error(
            "Like job error:",
            error
        );

        return Response.json(
            {
                error:
                    "Unable to update your like.",
            },
            {
                status: 500,
            }
        );
    }
}