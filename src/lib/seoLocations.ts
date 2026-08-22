export type SeoLocationMatch = {
    country?: string[];
    state?: string[];
    city?: string[];
};

export type SeoLocation = {
    slug: string;

    name: string;

    shortName: string;

    metaTitle: string;

    metaDescription: string;

    eyebrow: string;

    heading: string;

    intro: string;

    content: string[];

    match: SeoLocationMatch;
};

export const SEO_LOCATIONS: Record<
    string,
    SeoLocation
> = {
    nigeria: {
        slug: "nigeria",

        name: "Nigeria",

        shortName: "Nigeria",

        metaTitle:
            "Tech Jobs in Nigeria",

        metaDescription:
            "Find software, engineering, AI, data, product, design and digital jobs across Nigeria, including Lagos, Abuja, Ibadan, Ogun and remote roles.",

        eyebrow:
            "Technology Careers in Nigeria",

        heading:
            "Tech Jobs in Nigeria",

        intro:
            "Discover technology and digital career opportunities across Nigeria, from software engineering and data roles to AI, product, design and other technology-focused positions.",

        content: [
            "Dev Champions Jobs brings technology opportunities across Nigeria into one focused career platform. Browse positions from companies hiring in major commercial and technology centres, as well as remote roles available to professionals based in Nigeria.",

            "Whether you are searching for software development, frontend, backend, full-stack, data, artificial intelligence, cloud, cybersecurity, product, design or related digital roles, this page gives you a continuously updated view of relevant opportunities across the country.",
        ],

        match: {
            country: [
                "Nigeria",
            ],
        },
    },

    lagos: {
        slug: "lagos",

        name:
            "Lagos, Nigeria",

        shortName:
            "Lagos",

        metaTitle:
            "Tech Jobs in Lagos, Nigeria",

        metaDescription:
            "Browse software, engineering, AI, data, product, design and digital jobs in Lagos, Nigeria, including on-site, hybrid and remote opportunities.",

        eyebrow:
            "Technology Careers in Lagos",

        heading:
            "Tech Jobs in Lagos, Nigeria",

        intro:
            "Explore software, engineering, AI, data, product, design and other technology opportunities from employers hiring across Lagos.",

        content: [
            "Lagos has one of the largest concentrations of technology companies, startups, digital businesses and professional services employers in Nigeria. Dev Champions Jobs helps professionals discover opportunities across Lagos without relying on broad, unstructured job searches.",

            "Use this page to explore technology roles based in Lagos as well as hybrid opportunities connected to Lagos employers. New positions are surfaced from the same live job database used throughout the Dev Champions Jobs platform.",
        ],

        match: {
            city: [
                "Lagos",
            ],

            state: [
                "Lagos",
                "Lagos State",
            ],
        },
    },

    abuja: {
        slug: "abuja",

        name:
            "Abuja, Nigeria",

        shortName:
            "Abuja",

        metaTitle:
            "Tech Jobs in Abuja, Nigeria",

        metaDescription:
            "Find software, IT, engineering, AI, data, product and digital jobs in Abuja, Nigeria, including on-site, hybrid and remote opportunities.",

        eyebrow:
            "Technology Careers in Abuja",

        heading:
            "Tech Jobs in Abuja, Nigeria",

        intro:
            "Find technology and digital opportunities from companies and organisations hiring professionals in Abuja and the Federal Capital Territory.",

        content: [
            "Abuja supports a diverse employment market spanning technology companies, professional services, public-sector technology, consulting, digital transformation and growing startup activity.",

            "This landing page brings together relevant software, engineering, data, AI, product and digital opportunities associated with Abuja and the Federal Capital Territory, helping candidates reach active listings more directly.",
        ],

        match: {
            city: [
                "Abuja",
            ],

            state: [
                "Abuja",
                "FCT",
                "Federal Capital Territory",
                "Abuja Federal Capital Territory",
            ],
        },
    },

    ibadan: {
        slug: "ibadan",

        name:
            "Ibadan, Nigeria",

        shortName:
            "Ibadan",

        metaTitle:
            "Tech Jobs in Ibadan, Nigeria",

        metaDescription:
            "Discover software, IT, engineering, data, AI, product and digital jobs in Ibadan, Nigeria, with local, hybrid and remote opportunities.",

        eyebrow:
            "Technology Careers in Ibadan",

        heading:
            "Tech Jobs in Ibadan, Nigeria",

        intro:
            "Browse technology, software and digital career opportunities available to professionals in Ibadan and surrounding areas.",

        content: [
            "Ibadan continues to support a growing community of technology professionals, digital businesses, educational organisations and companies adopting modern software and data-driven operations.",

            "Dev Champions Jobs provides a focused place to discover opportunities specifically associated with Ibadan while also connecting professionals with wider career and technical resources throughout the Dev Champions ecosystem.",
        ],

        match: {
            city: [
                "Ibadan",
            ],
        },
    },

    ogun: {
        slug: "ogun",

        name:
            "Ogun State, Nigeria",

        shortName:
            "Ogun State",

        metaTitle:
            "Tech Jobs in Ogun State, Nigeria",

        metaDescription:
            "Find software, IT, engineering, data and digital jobs across Ogun State, including Abeokuta, Ota, Sagamu and remote opportunities.",

        eyebrow:
            "Technology Careers in Ogun State",

        heading:
            "Tech Jobs in Ogun State, Nigeria",

        intro:
            "Explore software, technology, engineering, data and digital career opportunities available across Ogun State.",

        content: [
            "Ogun State includes important commercial, industrial and educational centres such as Abeokuta, Ota and Sagamu, creating opportunities across technology, digital operations, software, data and technical services.",

            "This page aggregates jobs associated with Ogun State from the live Dev Champions Jobs database so professionals can discover relevant opportunities without depending entirely on general job search pages.",
        ],

        match: {
            state: [
                "Ogun",
                "Ogun State",
            ],
        },
    },
};

export const SEO_LOCATION_LIST =
    Object.values(
        SEO_LOCATIONS
    );

export function getSeoLocation(
    slug: string
) {
    return SEO_LOCATIONS[
        slug.toLowerCase()
    ];
}