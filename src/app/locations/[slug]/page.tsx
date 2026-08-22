import SeoJobLanding from "@/app/components/SeoJobLanding";

import {
  getSeoLocation,
  SEO_LOCATION_LIST,
  SeoLocationMatch,
} from "@/lib/seoLocations";

import { SITE } from "@/lib/site";

import type { Job } from "@/models/Job";

import type { FilterQuery } from "mongoose";

import type { Metadata } from "next";

import { notFound } from "next/navigation";

type SearchParams = {
  page?: string | string[];
};

type LocationPageProps = {
  params: {
    slug: string;
  };

  searchParams?: SearchParams;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactRegex(value: string) {
  return new RegExp(`^${escapeRegex(value)}$`, "i");
}

function getPageNumber(searchParams: SearchParams = {}) {
  const value = searchParams.page;

  const raw = Array.isArray(value) ? value[0] : value;

  return Math.max(
    1,

    Number.parseInt(raw || "1", 10) || 1,
  );
}

function buildLocationQuery(match: SeoLocationMatch): FilterQuery<Job> {
  const conditions: FilterQuery<Job>[] = [];

  if (match.country?.length) {
    conditions.push({
      country: {
        $in: match.country.map(exactRegex),
      },
    });
  }

  if (match.state?.length) {
    conditions.push({
      state: {
        $in: match.state.map(exactRegex),
      },
    });
  }

  if (match.city?.length) {
    conditions.push({
      city: {
        $in: match.city.map(exactRegex),
      },
    });
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return {
    $or: conditions,
  };
}

export function generateStaticParams() {
  return SEO_LOCATION_LIST.map((location) => ({
    slug: location.slug,
  }));
}

export async function generateMetadata({
  params,

  searchParams = {},
}: LocationPageProps): Promise<Metadata> {
  const location = getSeoLocation(params.slug);

  if (!location) {
    return {
      robots: {
        index: false,

        follow: false,
      },
    };
  }

  const page = getPageNumber(searchParams);

  const basePath = `/locations/${location.slug}`;

  const canonical =
    page > 1 ? `${SITE.url}${basePath}?page=${page}` : `${SITE.url}${basePath}`;

  const title =
    page > 1 ? `${location.metaTitle} - Page ${page}` : location.metaTitle;

  return {
    title,

    description: location.metaDescription,

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

      description: location.metaDescription,
    },

    twitter: {
      card: "summary",

      title: `${title} | ${SITE.name}`,

      description: location.metaDescription,
    },
  };
}

export default async function LocationPage({
  params,

  searchParams = {},
}: LocationPageProps) {
  const location = getSeoLocation(params.slug);

  if (!location) {
    notFound();
  }

  const page = getPageNumber(searchParams);

  const query = buildLocationQuery(location.match);

  return (
    <SeoJobLanding
      eyebrow={location.eyebrow}
      title={location.heading}
      intro={location.intro}
      content={location.content}
      jobsHeader={`Latest jobs in ${location.shortName}`}
      basePath={`/locations/${location.slug}`}
      breadcrumbLabel={location.name}
      query={query}
      page={page}
      currentLocationSlug={location.slug}
    />
  );
}
