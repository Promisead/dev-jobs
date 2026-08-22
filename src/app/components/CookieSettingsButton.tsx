"use client";

import { openCookieSettings } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="transition-colors hover:text-white"
    >
      Cookie settings
    </button>
  );
}
