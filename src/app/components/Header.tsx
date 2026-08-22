import InstallAppButton from "@/app/components/InstallAppButton";
import SignOutButton from "@/app/components/SignOutButton";

import { getSignInUrl, getUser } from "@workos-inc/authkit-nextjs";

import Image from "next/image";
import Link from "next/link";
import PostJobLink from "@/app/components/PostJobLink";

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
  const { user } = await getUser();

  const signInUrl = await getSignInUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      {/* MAIN NAVBAR */}
      <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-2 px-3 sm:min-h-[72px] sm:px-5 lg:px-8">
        {/* BRAND */}
        <Link
          href="/"
          aria-label="Dev Champions Jobs home"
          className="flex min-w-0 shrink items-center gap-1.5 sm:gap-3"
        >
          <Image
            src="/images/logo/logo_web.png"
            alt="Dev Champions logo"
            width={48}
            height={48}
            priority
            unoptimized
            className="h-9 w-9 shrink-0 object-contain sm:h-12 sm:w-12"
          />

          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <span className="whitespace-nowrap text-[20px] font-bold tracking-tight text-[#077998] sm:text-3xl">
              D•C
            </span>

            <span className="whitespace-nowrap text-[20px] font-bold tracking-tight text-[#8A1D4F] sm:text-3xl">
              Jobs
            </span>
          </div>
        </Link>

        {/* DESKTOP ECOSYSTEM */}
        <nav
          className="hidden items-center gap-6 lg:flex xl:gap-7"
          aria-label="Dev Champions ecosystem"
        >
          {ecosystemLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="whitespace-nowrap text-sm font-semibold text-gray-600 transition hover:text-[#077998]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ACCOUNT + PWA ACTIONS */}
        <nav
          className="flex shrink-0 items-center gap-1.5 sm:gap-2.5"
          aria-label="Account and app actions"
        >
          {/* DOWNLOAD ICON ON MOBILE */}
          <InstallAppButton />

          {/* LOGIN / LOGOUT */}
          {!user ? (
            <Link
              href={signInUrl}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-100 sm:px-4 sm:text-sm"
            >
              Login
            </Link>
          ) : (
            <SignOutButton />
          )}

          {/* POST */}
          <PostJobLink isAuthenticated={Boolean(user)} />
        </nav>
      </div>

      {/* MOBILE ECOSYSTEM */}
      <div className="border-t border-gray-100 bg-white lg:hidden">
        <nav
          className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2.5 sm:justify-center sm:gap-7 sm:px-6"
          aria-label="Dev Champions network"
        >
          {ecosystemLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500 transition hover:text-[#077998] sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
