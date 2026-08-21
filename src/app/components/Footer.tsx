import Image from "next/image";
import Link from "next/link";

type FooterLink = {
  name: string;
  href: string;
};

const ecosystemLinks: FooterLink[] = [
  {
    name: "Our Digital Solutions",
    href: "https://www.dev-champions.tech",
  },
  {
    name: "Browse Jobs",
    href: "/",
  },
  {
    name: "Tech  Insights",
    href: "https://path.dev-champions.tech",
  },
  {
    name: "Tech Learning",
    href: "https://core.dev-champions.tech",
  },
];

const jobLinks: FooterLink[] = [
  {
    name: "Browse Jobs",
    href: "/",
  },
  {
    name: "Post a Job",
    href: "/new-listing",
  },
  {
    name: "Career Insights",
    href: "https://path.dev-champions.tech",
  },
  {
    name: "Technical Learning",
    href: "https://core.dev-champions.tech",
  },
];

const companyLinks: FooterLink[] = [
  {
    name: "About Dev Champions",
    href: "https://www.dev-champions.tech/#aboutus-section",
  },
  {
    name: "Our Services",
    href: "https://www.dev-champions.tech/#services-section",
  },
  {
    name: "Our Process",
    href: "https://www.dev-champions.tech/#process",
  },
  {
    name: "Book a Meeting",
    href: "https://calendly.com/dev-champions-info/30min",
  },
];

function isExternalLink(href: string) {
  return href.startsWith("http");
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>

      <ul className="mt-6 space-y-4">
        {links.map((link) => {
          const external = isExternalLink(link.href);

          return (
            <li key={`${title}-${link.name}`}>
              <Link
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="text-sm leading-6 text-white/65 transition-colors duration-200 hover:text-white"
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-black text-white">
      {/* MAIN FOOTER CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* KNOWLEDGE CTA */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Knowledge &amp; Insights
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Grow your career beyond the job search.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Explore career guidance, software engineering insights, tutorials,
              AI, data, and practical technology resources across the Dev
              Champions ecosystem.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0 lg:justify-end">
            <Link
              href="https://path.dev-champions.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore Tech Path career and technology insights"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Explore Career Insights
            </Link>

            <Link
              href="https://core.dev-champions.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore Tech Core developer tutorials and technical learning"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Tech Learning
            </Link>
          </div>
        </div>

        {/* FOOTER COLUMNS */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="ChampHire Jobs home"
            >
              <Image
                src="/images/logo/logo_web_white.png"
                alt="Dev Champions logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                unoptimized
              />

              <span className="text-2xl font-semibold tracking-tight text-white">
                ChampHire
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
              Connecting ambitious professionals with meaningful opportunities
              while supporting career growth through the wider Dev Champions
              technology ecosystem.
            </p>

            {/* SOCIAL LINKS */}
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="https://web.facebook.com/DevChampions"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dev Champions on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                <Image
                  src="/images/footer/vec.svg"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                />
              </Link>

              <Link
                href="https://wa.me/2349115034504"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Dev Champions on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                <Image
                  src="/images/footer/whatsapp.svg"
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </Link>

              <Link
                href="https://www.linkedin.com/company/dev-champions/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Dev Champions on LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                <Image
                  src="/images/footer/linkedin.svg"
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </Link>
            </div>
          </div>

          {/* ECOSYSTEM */}
          <FooterColumn title="Explore Dev Champions" links={ecosystemLinks} />

          {/* JOBS */}
          <FooterColumn title="Jobs" links={jobLinks} />

          {/* COMPANY */}
          <FooterColumn title="Company" links={companyLinks} />

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>

            <div className="mt-6 space-y-4 text-sm text-white/65">
              <a
                href="mailto:info@dev-champions.tech"
                className="block transition-colors hover:text-white"
              >
                info@dev-champions.tech
              </a>

              <a
                href="tel:+2349115034504"
                className="block transition-colors hover:text-white"
              >
                +234 911 503 4504
              </a>

              <Link
                href="https://calendly.com/dev-champions-info/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-colors hover:text-white"
              >
                Book a meeting →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {currentYear} Dev Champions IT. All rights reserved.</p>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
            aria-label="Dev Champions ecosystem footer navigation"
          >
            <Link
              href="https://www.dev-champions.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Digital Solutions
            </Link>

            <Link
              href="https://path.dev-champions.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Career Insights
            </Link>

            <Link
              href="https://core.dev-champions.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              Tech Learning
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
