"use client";

import InlineLoader from "@/app/components/InlineLoader";

import { FormEvent, useRef, useState } from "react";

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    /*
     * Stop React/browser from immediately
     * navigating before we can display
     * the loading state.
     */
    event.preventDefault();

    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    /*
     * Submit the real HTML form after
     * React has had an opportunity to
     * render "Signing out...".
     *
     * HTMLFormElement.submit() bypasses
     * this React onSubmit handler, so
     * there is no recursion.
     */
    window.setTimeout(() => {
      formRef.current?.submit();
    }, 50);
  }

  return (
    <form
      ref={formRef}
      action="/sign-out"
      method="POST"
      onSubmit={handleSubmit}
    >
      <button
        type="submit"
        disabled={isSigningOut}
        aria-disabled={isSigningOut}
        aria-busy={isSigningOut}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
      >
        {isSigningOut && <InlineLoader />}

        <span>{isSigningOut ? "Signing out..." : "Logout"}</span>
      </button>
    </form>
  );
}
