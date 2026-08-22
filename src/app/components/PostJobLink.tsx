"use client";

import { trackPostJobClick } from "@/lib/analytics";

import Link from "next/link";

type PostJobLinkProps = {
  isAuthenticated: boolean;
};

export default function PostJobLink({ isAuthenticated }: PostJobLinkProps) {
  function handleClick() {
    trackPostJobClick({
      source: "header",

      authenticationState: isAuthenticated ? "authenticated" : "anonymous",
    });
  }

  return (
    <Link
      href="/new-listing"
      aria-label="Post a Job"
      onClick={handleClick}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#077998] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#066982] sm:px-5 sm:text-sm"
    >
      <span className="sm:hidden">Post</span>

      <span className="hidden sm:inline">Post a Job</span>
    </Link>
  );
}
