import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "p",
    "br",

    "h1",
    "h2",
    "h3",
    "h4",

    "strong",
    "b",

    "em",
    "i",

    "u",

    "s",
    "strike",

    "sub",
    "sup",

    "blockquote",

    "pre",
    "code",

    "ol",
    "ul",
    "li",

    "a",

    "img",

    "span",
];

const ALLOWED_CLASSES = [
    "ql-align-center",
    "ql-align-right",
    "ql-align-justify",

    "ql-indent-1",
    "ql-indent-2",
    "ql-indent-3",
    "ql-indent-4",
    "ql-indent-5",
    "ql-indent-6",
    "ql-indent-7",
    "ql-indent-8",

    "ql-size-small",
    "ql-size-large",
    "ql-size-huge",

    "ql-direction-rtl",
];

const COLOR_PATTERNS = [
    /^#[0-9a-fA-F]{3,8}$/,

    /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,

    /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/,
];

export function sanitizeJobDescription(
    html: string
) {
    if (!html) {
        return "";
    }

    return sanitizeHtml(
        html,
        {
            allowedTags:
                ALLOWED_TAGS,

            allowedAttributes: {
                "*": [
                    "class",
                    "style",
                ],

                a: [
                    "href",
                    "target",
                    "rel",
                    "title",
                ],

                img: [
                    "src",
                    "alt",
                    "title",
                    "width",
                    "height",
                    "loading",
                ],
            },

            allowedClasses: {
                "*":
                    ALLOWED_CLASSES,
            },

            allowedStyles: {
                "*": {
                    color:
                        COLOR_PATTERNS,

                    "background-color":
                        COLOR_PATTERNS,

                    "text-align": [
                        /^(left|right|center|justify)$/,
                    ],
                },
            },

            allowedSchemes: [
                "http",
                "https",
                "mailto",
                "tel",
            ],

            allowProtocolRelative:
                false,

            transformTags: {
                /*
                 * Employer-provided links are
                 * user-generated content.
                 *
                 * Do not automatically transfer
                 * ChampHire/Dev Champions SEO
                 * authority to arbitrary links.
                 */
                a: (
                    tagName,
                    attribs
                ) => ({
                    tagName,

                    attribs: {
                        ...attribs,

                        target:
                            "_blank",

                        rel:
                            "ugc nofollow noopener noreferrer",
                    },
                }),

                img: (
                    tagName,
                    attribs
                ) => ({
                    tagName,

                    attribs: {
                        ...attribs,

                        loading:
                            "lazy",
                    },
                }),
            },
        }
    );
}

export function normalizeJobDescription(
    value: string
) {
    const trimmed =
        value?.trim();

    if (!trimmed) {
        return "";
    }

    const containsHtml =
        /<\/?[a-z][\s\S]*>/i.test(
            trimmed
        );

    if (
        containsHtml
    ) {
        return sanitizeJobDescription(
            trimmed
        );
    }

    const escaped =
        escapeHtml(
            trimmed
        );

    const paragraphs =
        escaped
            .split(
                /\r?\n\s*\r?\n/
            )
            .map(
                (
                    paragraph
                ) => {
                    const withBreaks =
                        paragraph.replace(
                            /\r?\n/g,
                            "<br />"
                        );

                    return `<p>${withBreaks}</p>`;
                }
            )
            .join("");

    return sanitizeJobDescription(
        paragraphs
    );
}

export function descriptionToPlainText(
    html: string
) {
    const normalized =
        normalizeJobDescription(
            html
        );

    return sanitizeHtml(
        normalized,
        {
            allowedTags:
                [],

            allowedAttributes:
                {},
        }
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

function escapeHtml(
    value: string
) {
    const characters:
        Record<
            string,
            string
        > = {
        "&":
            "&amp;",

        "<":
            "&lt;",

        ">":
            "&gt;",

        '"':
            "&quot;",

        "'":
            "&#039;",
    };

    return value.replace(
        /[&<>"']/g,

        (
            character
        ) =>
            characters[
            character
            ]
    );
}