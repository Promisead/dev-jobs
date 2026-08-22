"use client";

import { trackJobView } from "@/lib/analytics";

import { useEffect } from "react";

type JobViewTrackerProps = {
  jobId: string;

  jobTitle: string;

  companyName: string;

  location: string;

  employmentType: string;

  workMode: string;
};

export default function JobViewTracker({
  jobId,

  jobTitle,

  companyName,

  location,

  employmentType,

  workMode,
}: JobViewTrackerProps) {
  useEffect(() => {
    trackJobView({
      jobId,

      jobTitle,

      companyName,

      location,

      employmentType,

      workMode,
    });
  }, [jobId, jobTitle, companyName, location, employmentType, workMode]);

  return null;
}
