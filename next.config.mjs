/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",

        hostname: "res.cloudinary.com",
      },
    ],
  },

  async headers() {
    return [
      /*
       * Service workers must be checked
       * for updates instead of becoming
       * stuck in a long browser cache.
       */
      {
        source: "/sw.js",

        headers: [
          {
            key: "Cache-Control",

            value: "public, max-age=0, must-revalidate",
          },

          {
            key: "Service-Worker-Allowed",

            value: "/",
          },
        ],
      },

      /*
       * Manifest changes should also be
       * discovered quickly after deployment.
       */
      {
        source: "/manifest.webmanifest",

        headers: [
          {
            key: "Cache-Control",

            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
