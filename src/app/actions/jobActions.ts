"use server";

import {
  JobAuthorizationError,
  requireOrganizationMembership,
} from "@/lib/jobAuthorization";

import {
  descriptionToPlainText,
  normalizeJobDescription,
} from "@/lib/jobDescription";

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

import {
  WorkOS,
} from "@workos-inc/node";

import mongoose from "mongoose";

function getString(
  formData:
    FormData,

  field: string
) {
  const value =
    formData.get(
      field
    );

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

const ALLOWED_WORK_MODES =
  new Set([
    "onsite",
    "hybrid",
    "remote",
  ]);

const ALLOWED_JOB_TYPES =
  new Set([
    "full",
    "part",
    "project",
  ]);

export async function saveJobAction(
  formData: FormData
) {
  await mongoose.connect(
    process.env
      .MONGO_URI as string
  );

  const id =
    getString(
      formData,
      "id"
    );

  const orgId =
    getString(
      formData,
      "orgId"
    );

  const title =
    getString(
      formData,
      "title"
    );

  const rawDescription =
    getString(
      formData,
      "description"
    );

  const remote =
    getString(
      formData,
      "remote"
    );

  const type =
    getString(
      formData,
      "type"
    );

  const salaryRaw =
    getString(
      formData,
      "salary"
    );

  const country =
    getString(
      formData,
      "country"
    );

  const state =
    getString(
      formData,
      "state"
    );

  const city =
    getString(
      formData,
      "city"
    );

  const countryId =
    getString(
      formData,
      "countryId"
    );

  const stateId =
    getString(
      formData,
      "stateId"
    );

  const cityId =
    getString(
      formData,
      "cityId"
    );

  const jobIcon =
    getString(
      formData,
      "jobIcon"
    );

  const contactPhoto =
    getString(
      formData,
      "contactPhoto"
    );

  const contactName =
    getString(
      formData,
      "contactName"
    );

  const contactPhone =
    getString(
      formData,
      "contactPhone"
    );

  const contactEmail =
    getString(
      formData,
      "contactEmail"
    );

  /*
   * ========================================
   * VALIDATION
   * ========================================
   */

  if (!orgId) {
    throw new Error(
      "Organisation ID is required."
    );
  }

  if (!title) {
    throw new Error(
      "Job title is required."
    );
  }

  if (!rawDescription) {
    throw new Error(
      "Job description is required."
    );
  }

  if (
    !ALLOWED_WORK_MODES.has(
      remote
    )
  ) {
    throw new Error(
      "Invalid work mode."
    );
  }

  if (
    !ALLOWED_JOB_TYPES.has(
      type
    )
  ) {
    throw new Error(
      "Invalid employment type."
    );
  }

  const salary =
    Number(
      salaryRaw
    );

  if (
    !Number.isFinite(
      salary
    ) ||
    salary <= 0
  ) {
    throw new Error(
      "A valid salary is required."
    );
  }

  if (
    !country ||
    !state ||
    !city
  ) {
    throw new Error(
      "Complete job location is required."
    );
  }

  if (
    !contactName ||
    !contactPhone ||
    !contactEmail
  ) {
    throw new Error(
      "Complete application contact information is required."
    );
  }

  /*
   * ========================================
   * RICH-TEXT SECURITY
   * ========================================
   */

  const safeDescription =
    normalizeJobDescription(
      rawDescription
    );

  const plainDescription =
    descriptionToPlainText(
      safeDescription
    );

  if (!plainDescription) {
    throw new Error(
      "Job description is required."
    );
  }

  /*
   * ========================================
   * AUTHORIZATION
   * ========================================
   */

  let existingJob:
    Job | null =
    null;

  if (id) {
    if (
      !mongoose.isValidObjectId(
        id
      )
    ) {
      throw new Error(
        "Invalid job ID."
      );
    }

    const existing =
      await JobModel.findById(
        id
      )
        .lean()
        .exec();

    existingJob =
      existing as unknown as
      Job | null;

    if (!existingJob) {
      throw new Error(
        "Job not found."
      );
    }

    /*
     * Prevent an editor from moving another
     * organisation's job into an organisation
     * they happen to control.
     */
    if (
      existingJob.orgId !==
      orgId
    ) {
      throw new JobAuthorizationError(
        "The organisation for an existing job cannot be changed.",
        403
      );
    }

    await requireOrganizationMembership(
      existingJob.orgId
    );
  } else {
    await requireOrganizationMembership(
      orgId
    );
  }

  /*
   * ========================================
   * CANONICAL ORGANISATION NAME
   * ========================================
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

  /*
   * Explicit field allowlist.
   *
   * This prevents arbitrary FormData fields
   * from being written into MongoDB.
   */
  const jobData = {
    title,

    description:
      safeDescription,

    orgId,

    orgName:
      organization.name,

    remote,

    type,

    salary,

    country,

    state,

    city,

    countryId,

    stateId,

    cityId,

    jobIcon,

    contactPhoto,

    contactName,

    contactPhone,

    contactEmail,
  };

  /*
   * ========================================
   * SAVE
   * ========================================
   */

  const jobDoc =
    id
      ? await JobModel.findByIdAndUpdate(
        id,

        jobData,

        {
          new:
            true,

          runValidators:
            true,
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

  const savedJob =
    JSON.parse(
      JSON.stringify(
        jobDoc
      )
    ) as Job;

  /*
   * ========================================
   * CACHE / SEO REFRESH
   * ========================================
   */

  if (existingJob) {
    /*
     * Revalidate the OLD location as well,
     * because an edited job may move from
     * Lagos -> Abuja, onsite -> remote, etc.
     */
    revalidateJobSeoPaths(
      existingJob
    );
  }

  revalidateJobSeoPaths(
    savedJob
  );

  /*
   * ========================================
   * GOOGLE INDEXING
   * ========================================
   *
   * New job -> URL_UPDATED
   * Edited job -> URL_UPDATED
   *
   * The helper catches Google errors so an
   * indexing outage does not undo the job.
   */

  await notifyGoogleIndexing(
    getJobCanonicalUrl(
      String(
        savedJob._id
      )
    ),

    "URL_UPDATED"
  );

  return savedJob;
}