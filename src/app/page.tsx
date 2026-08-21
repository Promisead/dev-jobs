// import Hero from "@/app/components/Hero";
// import Jobs from "@/app/components/Jobs";
// import { addOrgAndUserData, JobModel } from "@/models/Job";
// import { getUser } from "@workos-inc/authkit-nextjs";
// import mongoose from "mongoose";

// export default async function Home() {
//   const { user } = await getUser();

//   // Explicitly cast the user to the correct type
//   const typedUser = user as unknown as import("@workos-inc/node").User;

//   await mongoose.connect(process.env.MONGO_URI as string);
//   const latestJobs = await addOrgAndUserData(
//     await JobModel.find({}, {}, { limit: 5, sort: "-createdAt" }),
//     typedUser
//   );

//   return (
//     <>
//       <Hero />
//       <Jobs header={""} jobs={latestJobs} />
//     </>
//   );
// }

import Hero from "@/app/components/Hero";
import Jobs from "@/app/components/Jobs";

import { addOrgAndUserData, Job, JobModel } from "@/models/Job";

import { getUser } from "@workos-inc/authkit-nextjs";

import type { FilterQuery } from "mongoose";

import mongoose from "mongoose";

const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

type HomeProps = {
  searchParams?: SearchParams;
};

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function Home({ searchParams = {} }: HomeProps) {
  const { user } = await getUser();

  const typedUser = user as unknown as import("@workos-inc/node").User;

  await mongoose.connect(process.env.MONGO_URI as string);

  /*
   * URL FILTER VALUES
   */
  const q = getParam(searchParams, "q").trim();

  const remote = getParam(searchParams, "remote");

  const type = getParam(searchParams, "type");

  const country = getParam(searchParams, "country");

  const minSalary = getParam(searchParams, "minSalary");

  const maxSalary = getParam(searchParams, "maxSalary");

  const sortParam = getParam(searchParams, "sort") || "newest";

  const requestedPage = Math.max(
    1,
    Number.parseInt(getParam(searchParams, "page"), 10) || 1,
  );

  /*
   * MONGODB QUERY
   */
  const query: FilterQuery<Job> = {};

  /*
   * GLOBAL JOB SEARCH
   *
   * Searches all meaningful searchable
   * metadata rather than only job title.
   */
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");

    const searchConditions: FilterQuery<Job>[] = [
      { title: regex },
      { description: regex },

      { orgName: regex },

      { country: regex },
      { state: regex },
      { city: regex },

      { remote: regex },
      { type: regex },

      { contactName: regex },
      { contactEmail: regex },
      { contactPhone: regex },
    ];

    /*
     * If the complete search phrase is
     * numeric, also allow salary matches.
     */
    if (/^\d+(?:\.\d+)?$/.test(q)) {
      searchConditions.push({
        salary: Number(q),
      });
    }

    query.$or = searchConditions;
  }

  /*
   * WORK MODE
   */
  const allowedRemoteValues = ["onsite", "hybrid", "remote"];

  if (remote && allowedRemoteValues.includes(remote)) {
    query.remote = remote;
  }

  /*
   * EMPLOYMENT TYPE
   */
  const allowedTypes = ["full", "part", "project"];

  if (type && allowedTypes.includes(type)) {
    query.type = type;
  }

  /*
   * COUNTRY
   */
  if (country) {
    query.country = new RegExp(`^${escapeRegex(country)}$`, "i");
  }

  /*
   * SALARY RANGE
   */
  const salaryRange: {
    $gte?: number;
    $lte?: number;
  } = {};

  const parsedMinSalary = Number(minSalary);

  if (minSalary && Number.isFinite(parsedMinSalary) && parsedMinSalary >= 0) {
    salaryRange.$gte = parsedMinSalary;
  }

  const parsedMaxSalary = Number(maxSalary);

  if (maxSalary && Number.isFinite(parsedMaxSalary) && parsedMaxSalary >= 0) {
    salaryRange.$lte = parsedMaxSalary;
  }

  if (Object.keys(salaryRange).length) {
    query.salary = salaryRange;
  }

  /*
   * SORTING
   */
  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    "salary-high": {
      salary: -1,
      createdAt: -1,
    },

    "salary-low": {
      salary: 1,
      createdAt: -1,
    },
  };

  const sort = sortOptions[sortParam] ?? sortOptions.newest;

  /*
   * TOTAL COUNT + FILTER OPTIONS
   */
  const [totalJobs, rawCountries] = await Promise.all([
    JobModel.countDocuments(query),

    JobModel.distinct("country"),
  ]);

  const countries = rawCountries
    .filter(
      (value): value is string =>
        typeof value === "string" && Boolean(value.trim()),
    )
    .sort((a, b) => a.localeCompare(b));

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const skip = (currentPage - 1) * PAGE_SIZE;

  /*
   * ONLY FETCH THE JOBS NEEDED FOR
   * THE CURRENT PAGE.
   */
  const jobDocs = await JobModel.find(query)
    .sort(sort)
    .skip(skip)
    .limit(PAGE_SIZE);

  const jobs = await addOrgAndUserData(jobDocs, typedUser);

  const filterParams = {
    q,
    remote,
    type,
    country,
    minSalary,
    maxSalary,
    sort: sortParam,
  };

  const hasSearch = Boolean(
    q ||
    remote ||
    type ||
    country ||
    minSalary ||
    maxSalary ||
    sortParam !== "newest",
  );

  return (
    <>
      <Hero filters={filterParams} countries={countries} total={totalJobs} />

      <Jobs
        header={hasSearch ? "Job results" : "Recent jobs"}
        jobs={jobs}
        total={totalJobs}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        searchParams={filterParams}
      />
    </>
  );
}
