"use client";

import { useEffect, useState } from "react";

import ReactTimeAgo from "react-timeago";

export default function TimeAgo({ createdAt }: { createdAt: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="inline-block h-4 w-16" aria-hidden="true" />;
  }

  return <ReactTimeAgo date={createdAt} />;
}
