import { handleAuth } from '@workos-inc/authkit-nextjs';

// Redirect approved job posters to `/new-listing` after successful sign in
// The actual approval check happens in the page itself
export const GET = handleAuth({
    returnPathname: '/new-listing',
});