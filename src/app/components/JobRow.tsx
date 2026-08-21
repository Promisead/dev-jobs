// "use client";
// import TimeAgo from "@/app/components/TimeAgo";
// import { Job, JobModel } from "@/models/Job";
// import { faHeart } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import axios from "axios";
// import Link from "next/link";

// export default function JobRow({ jobDoc }: { jobDoc: Job }) {
//   return (
//     <>
//       <div className="bg-white p-4 rounded-lg shadow-sm relative">
//         <div className="absolute cursor-pointer top-4 right-4">
//           <FontAwesomeIcon className="size-4 text-gray-300" icon={faHeart} />
//         </div>
//         <div className="flex grow gap-4">
//           <div className="content-center w-12 basis-12 shrink-0">
//             <div className="relative size-12 rounded-md bg-gray-100 overflow-hidden">
//               <div className="absolute inset-0 flex items-center justify-center text-xl">
//                 💼
//               </div>

//               {jobDoc?.jobIcon && (
//                 <img
//                   className="relative z-10 size-12 object-contain bg-white"
//                   src={jobDoc.jobIcon}
//                   alt={`${jobDoc.orgName || "Company"} logo`}
//                   onError={(event) => {
//                     event.currentTarget.style.display = "none";
//                   }}
//                 />
//               )}
//             </div>
//           </div>
//           <div className="grow sm:flex">
//             <div className="grow">
//               <div>
//                 <Link
//                   href={`/jobs/${jobDoc.orgId}`}
//                   className="hover:underline text-gray-500 text-sm"
//                 >
//                   {jobDoc.orgName || "?"}
//                 </Link>
//               </div>
//               <div className="font-bold text-lg mb-1">
//                 <Link className="hover:underline" href={"/show/" + jobDoc._id}>
//                   {jobDoc.title}
//                 </Link>
//               </div>
//               <div className="text-gray-400 text-sm capitalize">
//                 {jobDoc.remote} &middot; {jobDoc.city}, {jobDoc.country}{" "}
//                 &middot; {jobDoc.type}-time
//                 {jobDoc.isAdmin && (
//                   <>
//                     {" "}
//                     &middot; <Link href={"/jobs/edit/" + jobDoc._id}>
//                       Edit
//                     </Link>{" "}
//                     &middot;{" "}
//                     <button
//                       type="button"
//                       onClick={async () => {
//                         await axios.delete("/api/jobs?id=" + jobDoc._id);
//                         window.location.reload();
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//             {jobDoc.createdAt && (
//               <div className="content-end text-gray-500 text-sm">
//                 <TimeAgo createdAt={jobDoc.createdAt} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import TimeAgo from "@/app/components/TimeAgo";
import { Job } from "@/models/Job";

import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";

export default function JobRow({ jobDoc }: { jobDoc: Job }) {
  const hasCloudinaryImage =
    Boolean(jobDoc?.jobIcon) && jobDoc.jobIcon.includes("res.cloudinary.com");

  async function handleDeleteJob() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobDoc.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/jobs?id=${jobDoc._id}`);

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete job:", error);

      alert("Unable to delete this job. Please try again.");
    }
  }

  return (
    <article className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:border-gray-300 hover:shadow-md">
      {/* SAVE / HEART */}
      <button
        type="button"
        aria-label={`Save ${jobDoc.title}`}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-50 hover:text-[#8A1D4F]"
      >
        <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
      </button>

      <div className="flex gap-4 pr-10">
        {/* COMPANY LOGO */}
        <div className="w-12 shrink-0">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            {/* FALLBACK ICON */}
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-xl"
            >
              💼
            </span>

            {/* CLOUDINARY IMAGE */}
            {hasCloudinaryImage && (
              <Image
                src={jobDoc.jobIcon}
                alt={`${jobDoc.orgName || "Company"} logo`}
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

        {/* JOB INFORMATION */}
        <div className="min-w-0 grow sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 grow">
            {/* COMPANY */}
            <div className="mb-1">
              <Link
                href={`/jobs/${jobDoc.orgId}`}
                className="text-sm font-medium text-gray-500 transition hover:text-[#077998] hover:underline"
              >
                {jobDoc.orgName || "Company"}
              </Link>
            </div>

            {/* JOB TITLE */}
            <h2 className="mb-2 pr-2 text-lg font-bold leading-snug text-gray-900">
              <Link
                href={`/show/${jobDoc._id}`}
                className="transition hover:text-[#077998] hover:underline"
              >
                {jobDoc.title}
              </Link>
            </h2>

            {/* JOB META */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
              {jobDoc.remote && (
                <>
                  <span className="capitalize">
                    {formatRemote(jobDoc.remote)}
                  </span>

                  <span aria-hidden="true" className="text-gray-300">
                    •
                  </span>
                </>
              )}

              {(jobDoc.city || jobDoc.country) && (
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
                  href={`/jobs/edit/${jobDoc._id}`}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={handleDeleteJob}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
                >
                  Delete
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
