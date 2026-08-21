"use server";

import {
  JobModel,
} from "@/models/Job";

import {
  descriptionToPlainText,
  normalizeJobDescription,
} from "@/lib/jobDescription";

import {
  WorkOS,
} from "@workos-inc/node";

import mongoose from "mongoose";

import {
  revalidatePath,
} from "next/cache";

export async function saveJobAction(
  formData: FormData
) {
  await mongoose.connect(
    process.env
      .MONGO_URI as string
  );

  const {
    id,
    ...jobData
  } =
    Object.fromEntries(
      formData
    );

  const orgId =
    jobData.orgId;

  if (
    typeof orgId !==
    "string" ||
    !orgId.trim()
  ) {
    throw new Error(
      "Organisation ID is required."
    );
  }

  /*
   * Rich description MUST be
   * sanitised server-side.
   */
  const rawDescription =
    jobData.description;

  if (
    typeof rawDescription !==
    "string"
  ) {
    throw new Error(
      "Job description is required."
    );
  }

  const safeDescription =
    normalizeJobDescription(
      rawDescription
    );

  const plainDescription =
    descriptionToPlainText(
      safeDescription
    );

  if (
    !plainDescription
  ) {
    throw new Error(
      "Job description is required."
    );
  }

  jobData.description =
    safeDescription;

  /*
   * Resolve canonical company
   * information through WorkOS.
   */
  const workos =
    new WorkOS(
      process.env
        .WORKOS_API_KEY
    );

  const organization =
    await workos.organizations.getOrganization(
      orgId
    );

  jobData.orgName =
    organization.name;

  const jobDoc =
    id
      ? await JobModel.findByIdAndUpdate(
        id,
        jobData,
        {
          new: true,
        }
      )
      : await JobModel.create(
        jobData
      );

  if (!jobDoc) {
    throw new Error(
      "Unable to save job."
    );
  }

  revalidatePath(
    "/"
  );

  revalidatePath(
    `/jobs/${jobDoc.orgId}`
  );

  revalidatePath(
    `/show/${jobDoc._id}`
  );

  return JSON.parse(
    JSON.stringify(
      jobDoc
    )
  );
}