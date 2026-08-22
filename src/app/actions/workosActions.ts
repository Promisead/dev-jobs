"use server";

import {
  requireApprovedJobPoster,
} from "@/lib/jobAuthorization";

import {
  WorkOS,
} from "@workos-inc/node";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";


export async function createCompany(
  companyName: string,
) {
  /*
   * ========================================
   * SERVER-SIDE IDENTITY + APPROVAL
   * ========================================
   *
   * Never accept userId from the browser.
   *
   * WorkOS AuthKit supplies the actual
   * authenticated user.
   */

  const user =
    await requireApprovedJobPoster();


  /*
   * ========================================
   * VALIDATION
   * ========================================
   */

  const normalizedName =
    companyName
      .trim()
      .replace(
        /\s+/g,
        " ",
      );

  if (
    normalizedName.length <
    2
  ) {
    throw new Error(
      "Company name is required.",
    );
  }

  if (
    normalizedName.length >
    120
  ) {
    throw new Error(
      "Company name is too long.",
    );
  }


  const apiKey =
    process.env
      .WORKOS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "WORKOS_API_KEY is not configured.",
    );
  }


  const workos =
    new WorkOS(
      apiKey,
    );


  /*
   * ========================================
   * CREATE ORGANIZATION
   * ========================================
   */

  const organization =
    await workos.organizations.createOrganization(
      {
        name:
          normalizedName,
      },
    );


  /*
   * ========================================
   * CREATE WORKOS MEMBERSHIP
   * ========================================
   *
   * Organization creator becomes admin.
   *
   * This is the same role behavior already
   * used by the application.
   */

  await workos.userManagement.createOrganizationMembership(
    {
      userId:
        user.id,

      organizationId:
        organization.id,

      roleSlug:
        "admin",
    },
  );


  revalidatePath(
    "/new-listing",
  );


  redirect(
    "/new-listing",
  );
}