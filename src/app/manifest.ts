import type {
    MetadataRoute,
} from "next";

export default function manifest():
    MetadataRoute.Manifest {
    return {
        name:
            "Dev Champions Jobs",

        short_name:
            "D•C Jobs",

        description:
            "Discover technology jobs across Nigeria and Africa, including software, engineering, AI, data, product, design and remote opportunities.",

        start_url:
            "/",

        scope:
            "/",

        display:
            "standalone",

        background_color:
            "#ffffff",

        theme_color:
            "#077998",

        icons: [
            {
                src:
                    "/icons/icon-192.png",

                sizes:
                    "192x192",

                type:
                    "image/png",

                purpose:
                    "any",
            },

            {
                src:
                    "/icons/icon-512.png",

                sizes:
                    "512x512",

                type:
                    "image/png",

                purpose:
                    "any",
            },

            {
                src:
                    "/icons/maskable-512.png",

                sizes:
                    "512x512",

                type:
                    "image/png",

                purpose:
                    "maskable",
            },
        ],
    };
}