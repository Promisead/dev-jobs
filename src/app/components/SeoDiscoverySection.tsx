import { SEO_LOCATION_LIST } from "@/lib/seoLocations";

import { SITE } from "@/lib/site";

import Link from "next/link";

export default function SeoDiscoverySection() {
  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        {/* LOCATION DISCOVERY */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
            Explore opportunities
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Find tech jobs by location
          </h2>

          <p className="mt-4 text-base leading-8 text-gray-600">
            Explore dedicated technology career pages for Nigeria&apos;s key job
            markets, or discover remote opportunities available beyond your
            current city.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_LOCATION_LIST.map((location) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#077998]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#077998]">
                Local opportunities
              </p>

              <h3 className="mt-3 text-xl font-bold text-gray-950 transition group-hover:text-[#077998]">
                Tech Jobs in {location.shortName}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Browse current software, engineering, data, AI and digital
                opportunities.
              </p>

              <span className="mt-5 inline-flex text-sm font-bold text-[#077998]">
                Explore jobs →
              </span>
            </Link>
          ))}

          <Link
            href="/remote-jobs"
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#8A1D4F]/40 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A1D4F]">
              Work from anywhere
            </p>

            <h3 className="mt-3 text-xl font-bold text-gray-950 transition group-hover:text-[#8A1D4F]">
              Remote Tech Jobs
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Discover remote technology opportunities available across Nigeria
              and Africa.
            </p>

            <span className="mt-5 inline-flex text-sm font-bold text-[#8A1D4F]">
              Explore remote jobs →
            </span>
          </Link>
        </div>

        {/* ECOSYSTEM AUTHORITY */}
        <div className="mt-16 rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Dev Champions Ecosystem
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Build your career and your technical capability.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-white/65">
                Dev Champions connects digital solutions, technology careers,
                professional insights and practical technical learning across
                one ecosystem.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href={SITE.parent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <p className="text-sm font-bold text-white">
                  Digital Solutions
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Software, AI, data and digital services.
                </p>
              </Link>

              <Link
                href={SITE.path.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <p className="text-sm font-bold text-white">Career Insights</p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Career guidance and tech industry insights.
                </p>
              </Link>

              <Link
                href={SITE.core.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <p className="text-sm font-bold text-white">Tech Learning</p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Practical developer and technical learning.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
