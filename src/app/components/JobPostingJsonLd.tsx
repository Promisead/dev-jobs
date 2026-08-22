import { buildJobPostingSchema, safeJsonLd } from "@/lib/jobSeo";

import type { Job } from "@/models/Job";

export default function JobPostingJsonLd({ job }: { job: Job }) {
  const schema = buildJobPostingSchema(job);

  /*
   * Never output partial / invalid
   * JobPosting schema.
   */
  if (!schema) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(schema),
      }}
    />
  );
}
