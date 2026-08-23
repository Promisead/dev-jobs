import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { getPushAdminAccess } from "@/lib/pushAuthorization";

import NotificationAdminClient from "./NotificationAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification Center",

  description: "Manage D•C Jobs push notifications.",

  robots: {
    index: false,

    follow: false,

    googleBot: {
      index: false,

      follow: false,
    },
  },
};

export default async function NotificationAdminPage() {
  const { user, authorized } = await getPushAdminAccess();

  /*
   * Do not reveal the admin interface
   * to unauthorized visitors.
   */
  if (!user || !authorized) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#077998]">
            D•C Jobs Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">
            Notification Center
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            Send special announcements, target subscribers and review recent Web
            Push delivery activity.
          </p>
        </div>

        <NotificationAdminClient adminEmail={user.email || ""} />
      </div>
    </main>
  );
}
