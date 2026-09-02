import { handleAuth, getUser } from '@workos-inc/authkit-nextjs';
import { isApprovedJobPoster } from '@/lib/jobAuthorization';
import { NextRequest, NextResponse } from 'next/server';

// Redirect based on user approval status:
// - Approved job posters → /new-listing (posting flow)
// - All others → / (home/job browsing flow)
export const GET = async (req: NextRequest) => {
  // Process the auth callback first
  const authHandler = handleAuth();
  const authResponse = await authHandler(req);

  // Get the authenticated user
  const { user } = await getUser();

  // Determine redirect URL based on user approval status
  const redirectUrl = user && isApprovedJobPoster(user) ? '/new-listing' : '/';

  // Redirect to appropriate page
  return NextResponse.redirect(new URL(redirectUrl, req.url));
};