import {
  authkitMiddleware,
} from "@workos-inc/authkit-nextjs";


export default authkitMiddleware();


export const config = {
  matcher: [
    /*
     * AuthKit continues protecting normal
     * application/API routes.
     *
     * /api/cron/* uses CRON_SECRET instead.
     *
     * PWA/static files must also bypass AuthKit.
     */

    "/((?!api/cron/|_next/static|_next/image|favicon.ico|favicon.jpg|sw.js|manifest.webmanifest|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};