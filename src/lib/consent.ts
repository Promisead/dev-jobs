export const CONSENT_VERSION =
    "1.1";


/*
 * Keep the existing storage key so existing
 * visitor preferences can be migrated.
 */
export const CONSENT_STORAGE_KEY =
    "dc_jobs_consent_v1";


export const CONSENT_UPDATED_EVENT =
    "dc-consent-updated";


export const OPEN_COOKIE_SETTINGS_EVENT =
    "dc-open-cookie-settings";


export type NotificationPreference =
    | "pending"
    | "enabled"
    | "disabled";


export type ConsentPreferences = {
    version: string;

    necessary: true;

    analytics: boolean;

    notifications:
    NotificationPreference;

    updatedAt: string;
};


function isNotificationPreference(
    value: unknown,
): value is NotificationPreference {
    return (
        value === "pending" ||
        value === "enabled" ||
        value === "disabled"
    );
}


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
                CONSENT_STORAGE_KEY,
            );


        if (!raw) {
            return null;
        }


        const parsed =
            JSON.parse(
                raw,
            ) as Partial<ConsentPreferences>;


        /*
         * Existing v1 consent is accepted and
         * migrated in memory.
         */
        const supportedVersion =
            parsed.version === "1.0" ||
            parsed.version ===
            CONSENT_VERSION;


        if (
            !supportedVersion ||
            parsed.necessary !==
            true ||
            typeof parsed.analytics !==
            "boolean"
        ) {
            return null;
        }


        let notifications:
            NotificationPreference;


        if (
            isNotificationPreference(
                parsed.notifications,
            )
        ) {
            notifications =
                parsed.notifications;
        } else {
            /*
             * Existing visitors who already accepted
             * analytics enter the notification
             * onboarding funnel as "pending".
             *
             * Nothing is subscribed automatically.
             */
            notifications =
                parsed.analytics
                    ? "pending"
                    : "disabled";
        }


        return {
            version:
                CONSENT_VERSION,

            necessary:
                true,

            analytics:
                parsed.analytics,

            notifications,

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
    input:
        | boolean
        | {
            analytics:
            boolean;

            notifications?:
            NotificationPreference;
        },
) {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }


    const current =
        readConsent();


    const analytics =
        typeof input ===
            "boolean"
            ? input
            : input.analytics;


    const requestedNotifications =
        typeof input ===
            "boolean"
            ? undefined
            : input.notifications;


    const notifications =
        requestedNotifications ??
        current?.notifications ??
        (analytics
            ? "pending"
            : "disabled");


    const consent:
        ConsentPreferences = {
        version:
            CONSENT_VERSION,

        necessary:
            true,

        analytics,

        notifications,

        updatedAt:
            new Date().toISOString(),
    };


    window.localStorage.setItem(
        CONSENT_STORAGE_KEY,

        JSON.stringify(
            consent,
        ),
    );


    window.dispatchEvent(
        new CustomEvent(
            CONSENT_UPDATED_EVENT,

            {
                detail:
                    consent,
            },
        ),
    );
}


/*
 * Used by the Web Push UI.
 *
 * Important:
 * Do not create cookie/analytics consent
 * just because Push was changed.
 */
export function setNotificationPreference(
    notifications:
        NotificationPreference,
) {
    const current =
        readConsent();


    if (!current) {
        return;
    }


    saveConsent({
        analytics:
            current.analytics,

        notifications,
    });
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
            OPEN_COOKIE_SETTINGS_EVENT,
        ),
    );
}