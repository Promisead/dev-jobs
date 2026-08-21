import SignOutButton from "@/app/components/SignOutButton";

import { getSignInUrl, getUser } from "@workos-inc/authkit-nextjs";

import Image from "next/image";
import Link from "next/link";

const ecosystemLinks = [
  {
    label: "Digital Solutions",

    href: "https://www.dev-champions.tech",

    ariaLabel:
      "Explore Dev Champions software development, AI, data and digital solutions",
  },

  {
    label: "Career Insights",

    href: "https://path.dev-champions.tech",

    ariaLabel:
      "Explore Tech Path career guidance and technology industry insights",
  },

  {
    label: "Tech Learning",

    href: "https://core.dev-champions.tech",

    ariaLabel:
      "Explore Tech Core developer tutorials and technical learning resources",
  },
];

export default async function Header() {
  /*
   * Authentication state is resolved
   * server-side before Header renders.
   */
  const { user } = await getUser();

  /*
   * WorkOS generates the secure
   * authorization URL server-side.
   */
  const signInUrl = await getSignInUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* BRAND */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="Jobs home"
        >
          <Image
            src="/images/logo/logo_web.png"
            alt="Dev Champions logo"
            width={52}
            height={52}
            className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            priority
            unoptimized
          />

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#077998] sm:text-3xl">
              D•C
            </span>

            <span className="text-2xl font-bold tracking-tight text-[#8A1D4F] sm:text-3xl">
              Jobs
            </span>
          </div>
        </Link>

        {/* DESKTOP ECOSYSTEM */}
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Dev Champions ecosystem"
        >
          {ecosystemLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="text-sm font-semibold text-gray-600 transition hover:text-[#077998]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ACCOUNT ACTIONS */}
        <nav
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Account actions"
        >
          {!user ? (
            <Link
              href={signInUrl}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-100 sm:px-4"
            >
              Login
            </Link>
          ) : (
            /*
             * SignOutButton is a client UI
             * wrapper, but it submits to
             * POST /sign-out where the real
             * WorkOS logout happens.
             */
            <SignOutButton />
          )}

          <Link
            href="/new-listing"
            className="rounded-lg bg-[#077998] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066982] sm:px-5"
          >
            <span className="hidden sm:inline">Post a Job</span>

            <span className="sm:hidden">Post Job</span>
          </Link>
        </nav>
      </div>

      {/* MOBILE ECOSYSTEM */}
      <div className="border-t border-gray-100 bg-white lg:hidden">
        <nav
          className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-3 sm:px-6"
          aria-label="Dev Champions network"
        >
          {ecosystemLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="shrink-0 text-sm font-semibold text-gray-500 transition hover:text-[#077998]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
