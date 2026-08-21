// import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// export default authkitMiddleware();

// // Match against pages that require authentication
// // Leave this out if you want authentication on every page in your application
// export const config = {
//   matcher: [
//     '/',
//     '/new-listing',
//     '/new-listing/:orgId*',
//     '/new-company',
//     '/jobs/:orgId*',
//     '/jobs/edit/:jobId*',
//     '/show/:jobId*',
//   ]
// };

import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware();

export const config = {
  matcher: [
    /*
     * Run AuthKit on application routes while skipping
     * Next.js internal assets and common static images.
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};