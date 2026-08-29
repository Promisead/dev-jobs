import {
  authkitMiddleware,
} from "@workos-inc/authkit-nextjs";


export default authkitMiddleware();


export const config = {
  matcher: [
    /*
     * AuthKit runs for normal application
     * and API routes.
     *
     * PWA/service-worker/static files must
     * never pass through authentication
     * middleware.
     */

    "/((?!_next/static|_next/image|favicon.ico|favicon.jpg|sw.js|manifest.webmanifest|icons/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};