export const CONSENT_VERSION =
    "1.0";

export const CONSENT_STORAGE_KEY =
    "dc_jobs_consent_v1";

export const CONSENT_UPDATED_EVENT =
    "dc-consent-updated";

export const OPEN_COOKIE_SETTINGS_EVENT =
    "dc-open-cookie-settings";

export type ConsentPreferences = {
    version: string;

    necessary: true;

    analytics: boolean;

    updatedAt: string;
};

export function readConsent():
    ConsentPreferences | null {
    if (
        typeof window ===
        "undefined"
    ) {
        return null;
    }

    try {
        const raw =
            window.localStorage.getItem(
                CONSENT_STORAGE_KEY
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(
                raw
            ) as Partial<ConsentPreferences>;

        if (
            parsed.version !==
            CONSENT_VERSION ||
            parsed.necessary !==
            true ||
            typeof parsed.analytics !==
            "boolean"
        ) {
            return null;
        }

        return {
            version:
                CONSENT_VERSION,

            necessary:
                true,

            analytics:
                parsed.analytics,

            updatedAt:
                typeof parsed.updatedAt ===
                    "string"
                    ? parsed.updatedAt
                    : new Date().toISOString(),
        };
    } catch {
        return null;
    }
}

export function saveConsent(
    analytics: boolean
) {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    const consent:
        ConsentPreferences =
    {
        version:
            CONSENT_VERSION,

        necessary:
            true,

        analytics,

        updatedAt:
            new Date().toISOString(),
    };

    window.localStorage.setItem(
        CONSENT_STORAGE_KEY,

        JSON.stringify(
            consent
        )
    );

    window.dispatchEvent(
        new CustomEvent(
            CONSENT_UPDATED_EVENT,

            {
                detail:
                    consent,
            }
        )
    );
}

export function hasAnalyticsConsent() {
    return (
        readConsent()
            ?.analytics ===
        true
    );
}

export function openCookieSettings() {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    window.dispatchEvent(
        new Event(
            OPEN_COOKIE_SETTINGS_EVENT
        )
    );
}