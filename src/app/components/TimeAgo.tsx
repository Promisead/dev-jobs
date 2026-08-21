// 'use client';
// import ReactTimeAgo from 'react-timeago';

// export default function TimeAgo({createdAt}:{createdAt:string}) {
//   return (
//     <>
//       <ReactTimeAgo date={createdAt}/>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import ReactTimeAgo from "react-timeago";

export default function TimeAgo({ createdAt }: { createdAt: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Important:
   * Server render -> null
   * First client render -> null
   *
   * This guarantees both HTML trees match.
   * Relative time is rendered only after hydration.
   */
  if (!mounted) {
    return null;
  }

  return <ReactTimeAgo date={createdAt} />;
}
