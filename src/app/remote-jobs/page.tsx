import SeoJobLanding from "@/app/components/SeoJobLanding";

import { SITE } from "@/lib/site";

import type { Job } from "@/models/Job";

import type { FilterQuery } from "mongoose";

import type { Metadata } from "next";

type SearchParams = {
  page?: string | string[];
};

type RemoteJobsPageProps = {
  searchParams?: SearchParams;
};

function getPageNumber(searchParams: SearchParams = {}) {
  const value = searchParams.page;

  const raw = Array.isArray(value) ? value[0] : value;

  return Math.max(
    1,

    Number.parseInt(raw || "1", 10) || 1,
  );
}

export async function generateMetadata({
  searchParams = {},
}: RemoteJobsPageProps): Promise<Metadata> {
  const page = getPageNumber(searchParams);

  const basePath = "/remote-jobs";

  const canonical =
    page > 1 ? `${SITE.url}${basePath}?page=${page}` : `${SITE.url}${basePath}`;

  const baseTitle = "Remote Tech Jobs in Nigeria & Africa";

  const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle;

  const description =
    "Find remote software, engineering, AI, data, product, design and digital jobs available to professionals in Nigeria and across Africa.";

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,

      follow: true,
    },

    openGraph: {
      type: "website",

      url: canonical,

      siteName: SITE.name,

      title: `${title} | ${SITE.name}`,

      description,
    },

    twitter: {
      card: "summary",

      title: `${title} | ${SITE.name}`,

      description,
    },
  };
}

export default async function RemoteJobsPage({
  searchParams = {},
}: RemoteJobsPageProps) {
  const page = getPageNumber(searchParams);

  const query: FilterQuery<Job> = {
    remote: {
      $in: [/^remote$/i, /^fully remote$/i],
    },
  };

  return (
    <SeoJobLanding
      eyebrow="Remote Technology Careers"
      title="Remote Tech Jobs in Nigeria & Across Africa"
      intro="Discover remote software, engineering, AI, data, product, design and digital opportunities that can be performed from Nigeria or elsewhere across Africa."
      content={[
        "Remote work gives technology professionals access to opportunities beyond their immediate city while allowing companies to reach skilled candidates across a wider talent market. Dev Champions Jobs brings remote technology opportunities into a dedicated, searchable career page.",

        "Browse remote software development, frontend, backend, full-stack, cloud, data, artificial intelligence, cybersecurity, product, design and other digital roles. Individual listings provide the employer's location, work mode and application information so you can evaluate each opportunity before applying.",
      ]}
      jobsHeader="Latest remote technology jobs"
      basePath="/remote-jobs"
      breadcrumbLabel="Remote Jobs"
      query={query}
      page={page}
    />
  );
}
