// import {AutoPaginatable, OrganizationMembership, User, WorkOS} from "@workos-inc/node";
// import mongoose, {model, models, Schema} from 'mongoose';

// export type Job = {
//   _id: string;
//   title: string;
//   description: string;
//   orgName?: string;
//   remote: string;
//   type: string;
//   salary: number;
//   country: string;
//   state: string;
//   city: string;
//   countryId: string;
//   stateId: string;
//   cityId: string;
//   jobIcon: string;
//   contactPhoto: string;
//   contactName: string;
//   contactPhone: string;
//   contactEmail: string;
//   orgId: string;
//   createdAt: string;
//   updatedAt: string;
//   isAdmin?: boolean;
// };

// const JobSchema = new Schema({
//   title: {type: String, required: true},
//   description: {type: String, required: true},
//   remote: {type: String, required: true},
//   type: {type: String, required: true},
//   salary: {type: Number, required: true},
//   country: {type: String, required: true},
//   state: {type: String, required: true},
//   city: {type: String, required: true},
//   countryId: {type: String, required: true},
//   stateId: {type: String, required: true},
//   cityId: {type: String, required: true},
//   jobIcon: {type: String},
//   contactPhoto: {type: String},
//   contactName: {type: String, required: true},
//   contactPhone: {type: String, required: true},
//   contactEmail: {type: String, required: true},
//   orgId: {type: String, required: true},
// }, {
//   timestamps: true,
// });

// export async function addOrgAndUserData(jobsDocs:Job[], user:User|null) {
//   jobsDocs = JSON.parse(JSON.stringify(jobsDocs));
//   await mongoose.connect(process.env.MONGO_URI as string);
//   const workos = new WorkOS(process.env.WORKOS_API_KEY);
//   let oms:AutoPaginatable<OrganizationMembership>|null = null;
//   if (user) {
//     oms = await workos.userManagement.listOrganizationMemberships({
//       userId: user?.id,
//     });
//   }
//   for (const job of jobsDocs) {
//     const org = await workos.organizations.getOrganization(job.orgId);
//     job.orgName = org.name;
//     if (oms && oms.data.length > 0) {
//       job.isAdmin = !!oms.data.find(om => om.organizationId === job.orgId);
//     }
//   }
//   return jobsDocs;
// }

// export const JobModel = models?.Job || model('Job', JobSchema);

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
  },
  {
    timestamps: true,
  }
);

/*
 * Useful indexes for filtering, sorting and pagination.
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
  models?.Job || model("Job", JobSchema);

/**
 * Attach organisation/member data required by the UI.
 *
 * orgName is now persisted, which avoids making a WorkOS
 * organisation request every single time a job is displayed.
 */
export async function addOrgAndUserData(
  jobsDocs: Job[],
  user: User | null
) {
  const jobs: Job[] = JSON.parse(
    JSON.stringify(jobsDocs)
  );

  await mongoose.connect(
    process.env.MONGO_URI as string
  );

  const workos = new WorkOS(
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
     * Old documents may not yet contain orgName.
     * Fetch it once and persist it.
     */
    if (!job.orgName) {
      const organization =
        await workos.organizations.getOrganization(
          job.orgId
        );

      job.orgName = organization.name;

      await JobModel.updateOne(
        {
          _id: job._id,
        },
        {
          $set: {
            orgName: organization.name,
          },
        }
      );
    }

    if (
      memberships &&
      memberships.data.length > 0
    ) {
      job.isAdmin = Boolean(
        memberships.data.find(
          (membership) =>
            membership.organizationId === job.orgId
        )
      );
    }
  }

  return jobs;
}