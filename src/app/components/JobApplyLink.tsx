"use client";

import { trackJobApplyClick } from "@/lib/analytics";

import type { ReactNode } from "react";

type JobApplyLinkProps = {
  href: string;

  method: "email" | "phone" | "external";

  jobId: string;

  jobTitle: string;

  companyName: string;

  className?: string;

  children: ReactNode;
};

export default function JobApplyLink({
  href,

  method,

  jobId,

  jobTitle,

  companyName,

  className = "",

  children,
}: JobApplyLinkProps) {
  function handleClick() {
    /*
     * IMPORTANT:
     *
     * We send only job/application metadata.
     *
     * We do NOT send the employer's:
     * - email address
     * - phone number
     * - contact person's name
     *
     * to Google Analytics.
     */
    trackJobApplyClick({
      jobId,

      jobTitle,

      companyName,

      method,
    });
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
