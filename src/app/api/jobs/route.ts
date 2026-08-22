import {
  JobAuthorizationError,
  requireOrganizationMembership,
} from "@/lib/jobAuthorization";

import {
  notifyGoogleIndexing,
} from "@/lib/googleIndexing";

import {
  getJobCanonicalUrl,
} from "@/lib/jobSeo";

import {
  revalidateJobSeoPaths,
} from "@/lib/revalidateJobSeo";

import {
  Job,
  JobModel,
} from "@/models/Job";

import mongoose from "mongoose";

import {
  NextRequest,
} from "next/server";

export const runtime =
  "nodejs";

export async function DELETE(
  request:
    NextRequest
) {
  try {
    const url =
      new URL(
        request.url
      );

    const id =
      url.searchParams.get(
        "id"
      );

    if (
      !id ||
      !mongoose.isValidObjectId(
        id
      )
    ) {
      return Response.json(
        {
          error:
            "A valid job ID is required.",
        },

        {
          status:
            400,
        }
      );
    }

    await mongoose.connect(
      process.env
        .MONGO_URI as string
    );

    /*
     * Read the job before deleting it.
     *
     * We need its organisation for permission
     * checking and its location for SEO cache
     * revalidation.
     */
    const rawJob =
      await JobModel.findById(
        id
      )
        .lean()
        .exec();

    const job =
      rawJob as unknown as
      Job | null;

    if (!job) {
      return Response.json(
        {
          error:
            "Job not found.",
        },

        {
          status:
            404,
        }
      );
    }

    /*
     * SERVER-SIDE AUTHORIZATION.
     */
    await requireOrganizationMembership(
      job.orgId
    );

    const result =
      await JobModel.deleteOne({
        _id:
          id,

        orgId:
          job.orgId,
      });

    if (
      result.deletedCount !==
      1
    ) {
      return Response.json(
        {
          error:
            "Unable to delete job.",
        },

        {
          status:
            409,
        }
      );
    }

    /*
     * The URL now returns 404 because the
     * Mongo record no longer exists.
     */
    revalidateJobSeoPaths(
      job
    );

    /*
     * Tell Google the former JobPosting URL
     * should be removed.
     */
    await notifyGoogleIndexing(
      getJobCanonicalUrl(
        id
      ),

      "URL_DELETED"
    );

    return Response.json({
      success:
        true,
    });
  } catch (error) {
    if (
      error instanceof
      JobAuthorizationError
    ) {
      return Response.json(
        {
          error:
            error.message,
        },

        {
          status:
            error.status,
        }
      );
    }

    console.error(
      "Delete job error:",

      error
    );

    return Response.json(
      {
        error:
          "Unable to delete job.",
      },

      {
        status:
          500,
      }
    );
  }
}