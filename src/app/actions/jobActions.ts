// 'use server';

// import {JobModel} from "@/models/Job";
// import mongoose from "mongoose";
// import {revalidatePath} from "next/cache";

// export async function saveJobAction(formData: FormData) {
//   await mongoose.connect(process.env.MONGO_URI as string);
//   const {id, ...jobData} = Object.fromEntries(formData);
//   const jobDoc = (id)
//     ? await JobModel.findByIdAndUpdate(id, jobData)
//     : await JobModel.create( jobData );
//   if ('orgId' in jobData) {
//     revalidatePath('/jobs/'+jobData?.orgId);
//   }
//   return JSON.parse( JSON.stringify(jobDoc) );
// }
"use server";

import { JobModel } from "@/models/Job";

import { WorkOS } from "@workos-inc/node";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function saveJobAction(
  formData: FormData
) {
  await mongoose.connect(
    process.env.MONGO_URI as string
  );

  const { id, ...jobData } =
    Object.fromEntries(formData);

  const orgId = jobData.orgId;

  if (
    typeof orgId !== "string" ||
    !orgId.trim()
  ) {
    throw new Error(
      "Organisation ID is required."
    );
  }

  /*
   * Resolve the canonical organisation name from WorkOS.
   * Do not trust a client-supplied company name.
   */
  const workos = new WorkOS(
    process.env.WORKOS_API_KEY
  );

  const organization =
    await workos.organizations.getOrganization(
      orgId
    );

  jobData.orgName = organization.name;

  const jobDoc = id
    ? await JobModel.findByIdAndUpdate(
      id,
      jobData,
      {
        new: true,
      }
    )
    : await JobModel.create(jobData);

  if (!jobDoc) {
    throw new Error(
      "Unable to save job."
    );
  }

  revalidatePath("/");
  revalidatePath(
    `/jobs/${jobDoc.orgId}`
  );
  revalidatePath(
    `/show/${jobDoc._id}`
  );

  return JSON.parse(
    JSON.stringify(jobDoc)
  );
}