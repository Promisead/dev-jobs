import {
  AutoPaginatable,
  OrganizationMembership,
  User,
  WorkOS,
} from "@workos-inc/node";

import mongoose, {
  model,
  models,
  Schema,
} from "mongoose";

export type Job = {
  _id: string;

  title: string;
  description: string;

  orgName?: string;
  orgId: string;

  remote: string;
  type: string;
  salary: number;

  country: string;
  state: string;
  city: string;

  countryId: string;
  stateId: string;
  cityId: string;

  jobIcon: string;
  contactPhoto: string;

  contactName: string;
  contactPhone: string;
  contactEmail: string;

  createdAt: string;
  updatedAt: string;

  /*
   * Stored only in MongoDB/server-side.
   * We remove this before returning jobs to the UI.
   */
  likedBy?: string[];

  /*
   * Computed fields for the UI.
   */
  likesCount?: number;
  isLiked?: boolean;

  isAdmin?: boolean;
};

const JobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    orgName: {
      type: String,
      trim: true,
    },

    orgId: {
      type: String,
      required: true,
      index: true,
    },

    remote: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    countryId: {
      type: String,
      required: true,
    },

    stateId: {
      type: String,
      required: true,
    },

    cityId: {
      type: String,
      required: true,
    },

    jobIcon: {
      type: String,
    },

    contactPhoto: {
      type: String,
    },

    contactName: {
      type: String,
      required: true,
    },

    contactPhone: {
      type: String,
      required: true,
    },

    contactEmail: {
      type: String,
      required: true,
    },

    /*
     * WorkOS user IDs that liked this job.
     *
     * $addToSet will ensure the same user
     * cannot be counted twice.
     */
    likedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Useful indexes for filtering,
 * sorting and pagination.
 */
JobSchema.index({
  remote: 1,
  type: 1,
  country: 1,
  createdAt: -1,
});

JobSchema.index({
  salary: 1,
});

JobSchema.index({
  createdAt: -1,
});

export const JobModel =
  models?.Job ||
  model("Job", JobSchema);

/**
 * Attach organisation, membership and
 * like information required by the UI.
 */
export async function addOrgAndUserData(
  jobsDocs: Job[],
  user: User | null
) {
  const jobs: Job[] =
    JSON.parse(
      JSON.stringify(jobsDocs)
    );

  await mongoose.connect(
    process.env.MONGO_URI as string
  );

  const workos =
    new WorkOS(
      process.env.WORKOS_API_KEY
    );

  let memberships:
    | AutoPaginatable<OrganizationMembership>
    | null = null;

  if (user) {
    memberships =
      await workos.userManagement.listOrganizationMemberships({
        userId: user.id,
      });
  }

  for (const job of jobs) {
    /*
     * Backfill old jobs that don't yet
     * have a stored organisation name.
     */
    if (!job.orgName) {
      const organization =
        await workos.organizations.getOrganization(
          job.orgId
        );

      job.orgName =
        organization.name;

      await JobModel.updateOne(
        {
          _id: job._id,
        },
        {
          $set: {
            orgName:
              organization.name,
          },
        }
      );
    }

    /*
     * Organisation permissions.
     */
    if (
      memberships &&
      memberships.data.length > 0
    ) {
      job.isAdmin =
        Boolean(
          memberships.data.find(
            (membership) =>
              membership.organizationId ===
              job.orgId
          )
        );
    }

    /*
     * Like information.
     */
    const likedBy =
      Array.isArray(
        job.likedBy
      )
        ? job.likedBy
        : [];

    job.likesCount =
      likedBy.length;

    job.isLiked =
      Boolean(
        user &&
        likedBy.includes(
          user.id
        )
      );

    /*
     * Do not expose everyone's
     * WorkOS IDs to the client.
     */
    delete job.likedBy;
  }

  return jobs;
}