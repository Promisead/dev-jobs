"use client";

import InlineLoader from "@/app/components/InlineLoader";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  idleText: string;
  pendingText?: string;
  className?: string;
};

export default function PendingSubmitButton({
  idleText,
  pendingText = "Please wait...",
  className = "",
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending && <InlineLoader />}

      <span>{pending ? pendingText : idleText}</span>
    </button>
  );
}
