import {getSignInUrl, getUser, signOut} from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import Image from "next/image";


export default async function Header() {
  const { user } = await getUser();
  const signInUrl = await getSignInUrl();
  return (
    <header>
      <div className="container flex items-center justify-between mx-auto my-4">
     {/*    <Link href={'/'} className="font-bold text-xl">Job Board</Link> */}
     <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo/logo_web.png"
                    alt="Logo"
                    width={30} // Adjust width as needed for responsive sizing
                    height={30}
                    className="w-10 h-10" // Tailwind sizing for better control on smaller screens
                    unoptimized
                  />
                  <span className="ml-3 text-2xl sm:text-3xl font-semibold text-[#077998]">
                    DC
                  </span>
                  <span className="ml-3 text-2xl sm:text-3xl font-semibold text-[#8A1D4F]">
                    Jobs
                  </span>
                </Link>
              </div>
        <nav className="flex gap-2">
          {!user && (
            <Link className="rounded-md bg-gray-200 py-1 px-2 sm:py-2 sm:px-4" href={signInUrl}>
              Login
            </Link>
          )}
          {user && (
            <form action={async () => {
              'use server';
              await signOut();
            }}>
              <button type="submit" className="rounded-md bg-gray-200 py-1 px-2 sm:py-2 sm:px-4">
                Logout
              </button>
            </form>
          )}
          <Link className="rounded-md py-1 px-2 sm:py-2 sm:px-4 bg-blue-600 text-white" href={'/new-listing'}>
            Post a job
          </Link>
        </nav>
      </div>
    </header>
  );
}