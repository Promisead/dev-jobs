export const SITE = {
    name: "Dev Champions Jobs",

    shortName: "D•C Jobs",

    url:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://jobs.dev-champions.tech",

    description:
        "Discover software, engineering, AI, data, product, design, digital and professional jobs across Lagos, Abuja, Ibadan, Ogun State, Nigeria and remote opportunities across Africa.",

    language: "en-NG",

    locale: "en_NG",

    country: "Nigeria",

    countryCode: "NG",

    gaId:
        process.env.NEXT_PUBLIC_GA_ID ||
        "",

    parent: {
        name: "Dev Champions IT",

        url:
            "https://www.dev-champions.tech",

        description:
            "Software development, AI, data, digital transformation and technology solutions.",
    },

    path: {
        name: "Tech Path",

        url:
            "https://path.dev-champions.tech",

        description:
            "Technology career guidance, industry insights and professional growth resources.",
    },

    core: {
        name: "Tech Core",

        url:
            "https://core.dev-champions.tech",

        description:
            "Developer tutorials, software engineering, AI, data and practical technical learning.",
    },

    contact: {
        email:
            "info@dev-champions.tech",

        phone:
            "+2349115034504",

        calendly:
            "https://calendly.com/dev-champions-info/30min",
    },

    social: {
        facebook:
            "https://web.facebook.com/DevChampions",

        instagram:
            "https://www.instagram.com/devchampionsit",

        linkedin:
            "https://www.linkedin.com/company/dev-champions/",

        x:
            "https://x.com/Promisedukeac",
    },
    legal: {
        controllerName:
            "Dev Champions IT",

        businessAddress:
            "Lagos Nigeria",

        privacyEmail:
            "info@dev-champions.tech",

        privacyPhone:
            "+2349115034504",

        lastUpdated:
            "10 August 2020",
    },
} as const;