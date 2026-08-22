"use client";

import InlineLoader from "@/app/components/InlineLoader";
import TimeAgo from "@/app/components/TimeAgo";

import { trackJobLike, trackJobSelect } from "@/lib/analytics";

import { Job } from "@/models/Job";

import { faHeart } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import axios from "axios";

import Image from "next/image";
import Link from "next/link";

import { useRef, useState } from "react";

export default function JobRow({ jobDoc }: { jobDoc: Job }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLiking, setIsLiking] = useState(false);

  const [isLiked, setIsLiked] = useState(Boolean(jobDoc.isLiked));

  const [likesCount, setLikesCount] = useState(jobDoc.likesCount ?? 0);

  const [likeMessage, setLikeMessage] = useState("");

  const likeMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jobId = String(jobDoc._id);

  const companyName = jobDoc.orgName || "Company";

  const hasCloudinaryImage =
    Boolean(jobDoc.jobIcon) && jobDoc.jobIcon.includes("res.cloudinary.com");

  /*
   * ----------------------------------------
   * JOB DETAIL CLICK
   * ----------------------------------------
   */
  function handleJobOpen() {
    trackJobSelect({
      jobId,

      jobTitle: jobDoc.title,

      companyName,
    });
  }

  /*
   * ----------------------------------------
   * LIKE / UNLIKE
   * ----------------------------------------
   */
  async function handleLikeJob() {
    if (isLiking) {
      return;
    }

    setIsLiking(true);

    try {
      const response = await axios.post(`/api/jobs/${jobId}/like`);

      const liked = Boolean(response.data.liked);

      const newLikesCount = Number(response.data.likesCount ?? 0);

      setIsLiked(liked);

      setLikesCount(newLikesCount);

      setLikeMessage(liked ? "You liked this post." : "Like removed.");

      /*
       * GA EVENT FIRES ONLY AFTER
       * THE SERVER CONFIRMS SUCCESS.
       */
      trackJobLike({
        jobId,

        jobTitle: jobDoc.title,

        companyName,

        liked,

        likesCount: newLikesCount,
      });

      if (likeMessageTimer.current) {
        clearTimeout(likeMessageTimer.current);
      }

      likeMessageTimer.current = setTimeout(
        () => {
          setLikeMessage("");
        },

        2500,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setLikeMessage("Sign in to like this post.");
      } else {
        console.error(
          "Failed to like job:",

          error,
        );

        setLikeMessage("Unable to update your like.");
      }

      if (likeMessageTimer.current) {
        clearTimeout(likeMessageTimer.current);
      }

      likeMessageTimer.current = setTimeout(
        () => {
          setLikeMessage("");
        },

        3000,
      );
    } finally {
      setIsLiking(false);
    }
  }

  /*
   * ----------------------------------------
   * DELETE
   * ----------------------------------------
   */
  async function handleDeleteJob() {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobDoc.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`/api/jobs?id=${jobId}`);

      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to delete job:",

        error,
      );

      setIsDeleting(false);

      alert("Unable to delete this job. Please try again.");
    }
  }

  return (
    <article className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:border-gray-300 hover:shadow-md">
      {/* LIKE AREA */}
      <div className="absolute right-4 top-3 flex flex-col items-end">
        <button
          type="button"
          onClick={handleLikeJob}
          disabled={isLiking}
          aria-busy={isLiking}
          aria-pressed={isLiked}
          aria-label={
            isLiked ? `Unlike ${jobDoc.title}` : `Like ${jobDoc.title}`
          }
          className="group inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        >
          {isLiking ? (
            <InlineLoader className="text-gray-400" />
          ) : (
            <FontAwesomeIcon
              icon={faHeart}
              className={`h-4 w-4 transition ${
                isLiked
                  ? "text-red-500"
                  : "text-gray-300 group-hover:text-red-400"
              }`}
            />
          )}

          <span
            className={`min-w-[12px] text-xs font-semibold ${
              isLiked ? "text-red-500" : "text-gray-400"
            }`}
          >
            {likesCount}
          </span>
        </button>

        {likeMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium shadow-sm ${
              isLiked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
            }`}
          >
            {likeMessage}
          </div>
        )}
      </div>

      <div className="flex gap-4 pr-24">
        {/* COMPANY LOGO */}
        <div className="w-12 shrink-0">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-xl"
            >
              💼
            </span>

            {hasCloudinaryImage && (
              <Image
                src={jobDoc.jobIcon}
                alt={`${companyName} logo`}
                width={48}
                height={48}
                className="relative z-10 h-12 w-12 bg-white object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        </div>

        {/* JOB CONTENT */}
        <div className="min-w-0 grow sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 grow">
            {/* COMPANY */}
            <div className="mb-1">
              <Link
                href={`/jobs/${jobDoc.orgId}`}
                className="text-sm font-medium text-gray-500 transition hover:text-[#077998] hover:underline"
              >
                {companyName}
              </Link>
            </div>

            {/* TITLE */}
            <h2 className="mb-2 pr-2 text-lg font-bold leading-snug text-gray-900">
              <Link
                href={`/show/${jobId}`}
                onClick={handleJobOpen}
                className="transition hover:text-[#077998] hover:underline"
              >
                {jobDoc.title}
              </Link>
            </h2>

            {/* META */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
              {jobDoc.remote && (
                <>
                  <span>{formatRemote(jobDoc.remote)}</span>

                  <span aria-hidden="true" className="text-gray-300">
                    •
                  </span>
                </>
              )}

              {(jobDoc.city || jobDoc.state || jobDoc.country) && (
                <>
                  <span>
                    {[jobDoc.city, jobDoc.state, jobDoc.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>

                  <span aria-hidden="true" className="text-gray-300">
                    •
                  </span>
                </>
              )}

              {jobDoc.type && <span>{formatJobType(jobDoc.type)}</span>}
            </div>

            {/* ADMIN ACTIONS */}
            {jobDoc.isAdmin && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <Link
                  href={`/jobs/edit/${jobId}`}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteJob}
                  aria-busy={isDeleting}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting && <InlineLoader />}

                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* DATE */}
          {jobDoc.createdAt && (
            <div className="mt-3 shrink-0 text-sm text-gray-400 sm:mt-0 sm:text-right">
              <TimeAgo createdAt={jobDoc.createdAt} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/*
 * ========================================
 * UI FORMATTERS
 * ========================================
 */

function formatRemote(remote: string) {
  const value = remote.toLowerCase();

  const labels: Record<string, string> = {
    remote: "Remote",

    onsite: "On-site",

    "on-site": "On-site",

    hybrid: "Hybrid",
  };

  return labels[value] || remote;
}

function formatJobType(type: string) {
  const value = type.toLowerCase();

  const labels: Record<string, string> = {
    full: "Full-time",

    "full-time": "Full-time",

    part: "Part-time",

    "part-time": "Part-time",

    project: "Project",

    contract: "Contract",

    internship: "Internship",

    temporary: "Temporary",
  };

  return labels[value] || type;
}
