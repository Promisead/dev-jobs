"use client";

import {
    readConsent,
    setNotificationPreference,
} from "@/lib/consent";


export type PushClientState =
    | "ready"
    | "subscribed"
    | "denied"
    | "unsupported"
    | "install-required"
    | "error";


export type PushActionResult = {
    state: PushClientState;

    subscription?: PushSubscription | null;

    message?: string;
};


/*
 * ========================================
 * VAPID KEY CONVERSION
 * ========================================
 */

function urlBase64ToUint8Array(
    base64String: string,
) {
    const padding =
        "=".repeat(
            (
                4 -
                (
                    base64String.length %
                    4
                )
            ) %
            4,
        );


    const base64 =
        (
            base64String +
            padding
        )
            .replace(
                /-/g,
                "+",
            )
            .replace(
                /_/g,
                "/",
            );


    const rawData =
        window.atob(
            base64,
        );


    const outputArray =
        new Uint8Array(
            rawData.length,
        );


    for (
        let index = 0;
        index <
        rawData.length;
        index +=
        1
    ) {
        outputArray[
            index
        ] =
            rawData.charCodeAt(
                index,
            );
    }


    return outputArray;
}


/*
 * ========================================
 * DEVICE / PLATFORM HELPERS
 * ========================================
 */

export function isIOSDevice() {
    if (
        typeof navigator ===
        "undefined"
    ) {
        return false;
    }


    return /iPad|iPhone|iPod/i.test(
        navigator.userAgent,
    );
}


export function isStandalonePwa() {
    if (
        typeof window ===
        "undefined" ||
        typeof navigator ===
        "undefined"
    ) {
        return false;
    }


    const navigatorWithStandalone =
        navigator as Navigator & {
            standalone?: boolean;
        };


    return (
        window.matchMedia(
            "(display-mode: standalone)",
        ).matches ||
        navigatorWithStandalone
            .standalone ===
        true
    );
}


export function supportsPushNotifications() {
    if (
        typeof window ===
        "undefined" ||
        typeof navigator ===
        "undefined"
    ) {
        return false;
    }


    return (
        "serviceWorker" in
        navigator &&
        "PushManager" in
        window &&
        "Notification" in
        window
    );
}


/*
 * ========================================
 * SERVER SYNCHRONIZATION
 * ========================================
 */

export async function syncPushSubscriptionWithServer(
    subscription:
        PushSubscription,
) {
    const response =
        await fetch(
            "/api/push/subscribe",

            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(
                        subscription.toJSON(),
                    ),
            },
        );


    const data =
        await response
            .json()
            .catch(
                () =>
                    null,
            );


    if (
        !response.ok
    ) {
        throw new Error(
            data?.error ||
            "Unable to synchronize push subscription.",
        );
    }


    return true;
}


/*
 * ========================================
 * CURRENT PUSH STATE
 * ========================================
 */

export async function getCurrentPushState():
    Promise<PushActionResult> {
    if (
        !supportsPushNotifications()
    ) {
        return {
            state:
                "unsupported",
        };
    }


    if (
        isIOSDevice() &&
        !isStandalonePwa()
    ) {
        return {
            state:
                "install-required",

            message:
                "Install D•C Jobs to your Home Screen before enabling notifications.",
        };
    }


    /*
     * Chrome Incognito and normal browser
     * sessions where the visitor has blocked
     * notification permission can both reach
     * this state.
     */
    if (
        Notification.permission ===
        "denied"
    ) {
        if (
            readConsent()
        ) {
            setNotificationPreference(
                "disabled",
            );
        }


        return {
            state:
                "denied",

            message:
                "Notifications are unavailable in this browser session.",
        };
    }


    try {
        const registration =
            await navigator
                .serviceWorker
                .ready;


        const subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            !subscription
        ) {
            const consent =
                readConsent();


            if (
                consent &&
                consent.notifications ===
                "enabled"
            ) {
                setNotificationPreference(
                    "pending",
                );
            }


            return {
                state:
                    "ready",

                subscription:
                    null,
            };
        }


        /*
         * Browser subscription exists.
         * Ensure MongoDB still knows about it.
         */
        await syncPushSubscriptionWithServer(
            subscription,
        );


        if (
            readConsent()
        ) {
            setNotificationPreference(
                "enabled",
            );
        }


        return {
            state:
                "subscribed",

            subscription,
        };
    } catch (
    error
    ) {
        console.error(
            "Unable to inspect Push subscription:",
            error,
        );


        return {
            state:
                "error",

            message:
                error instanceof
                    Error
                    ? error.message
                    : "Unable to inspect notification settings.",
        };
    }
}


/*
 * ========================================
 * ENABLE JOB ALERTS
 * ========================================
 *
 * Call this directly from a user-generated
 * click.
 *
 * Do not automatically invoke it from
 * useEffect or cookie acceptance.
 */

export async function enableJobAlerts():
    Promise<PushActionResult> {
    if (
        !supportsPushNotifications()
    ) {
        return {
            state:
                "unsupported",

            message:
                "This browser does not support Web Push notifications.",
        };
    }


    if (
        isIOSDevice() &&
        !isStandalonePwa()
    ) {
        return {
            state:
                "install-required",

            message:
                "Install D•C Jobs to your Home Screen first, then enable alerts from the installed app.",
        };
    }


    const publicKey =
        process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


    if (
        !publicKey
    ) {
        return {
            state:
                "error",

            message:
                "VAPID public key is not configured.",
        };
    }


    try {
        /*
         * Keep requestPermission close to the
         * user's click.
         */
        let permission =
            Notification.permission;


        if (
            permission ===
            "default"
        ) {
            permission =
                await Notification
                    .requestPermission();
        }


        if (
            permission !==
            "granted"
        ) {
            if (
                readConsent()
            ) {
                setNotificationPreference(
                    "disabled",
                );
            }


            return {
                state:
                    "denied",

                message:
                    "Notifications were not enabled. You can allow them later from your browser settings.",
            };
        }


        const registration =
            await navigator
                .serviceWorker
                .ready;


        let subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            !subscription
        ) {
            subscription =
                await registration
                    .pushManager
                    .subscribe({
                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                publicKey,
                            ),
                    });
        }


        await syncPushSubscriptionWithServer(
            subscription,
        );


        if (
            readConsent()
        ) {
            setNotificationPreference(
                "enabled",
            );
        }


        return {
            state:
                "subscribed",

            subscription,

            message:
                "Job alerts are enabled on this device.",
        };
    } catch (
    error
    ) {
        console.error(
            "Unable to enable job alerts:",
            error,
        );


        return {
            state:
                "error",

            message:
                error instanceof
                    Error
                    ? error.message
                    : "Unable to enable job alerts.",
        };
    }
}


/*
 * ========================================
 * DISABLE JOB ALERTS
 * ========================================
 */

export async function disableJobAlerts():
    Promise<PushActionResult> {
    if (
        !supportsPushNotifications()
    ) {
        return {
            state:
                "unsupported",
        };
    }


    try {
        const registration =
            await navigator
                .serviceWorker
                .ready;


        const subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            subscription
        ) {
            const response =
                await fetch(
                    "/api/push/subscribe",

                    {
                        method:
                            "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                endpoint:
                                    subscription.endpoint,
                            }),
                    },
                );


            if (
                !response.ok
            ) {
                throw new Error(
                    "Unable to remove the server subscription.",
                );
            }


            await subscription
                .unsubscribe();
        }


        if (
            readConsent()
        ) {
            setNotificationPreference(
                "disabled",
            );
        }


        return {
            state:
                "ready",

            subscription:
                null,

            message:
                "Job alerts have been turned off.",
        };
    } catch (
    error
    ) {
        console.error(
            "Unable to disable job alerts:",
            error,
        );


        return {
            state:
                "error",

            message:
                error instanceof
                    Error
                    ? error.message
                    : "Unable to turn off notifications.",
        };
    }
}