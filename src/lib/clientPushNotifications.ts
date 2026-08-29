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
    state:
    PushClientState;

    subscription?:
    PushSubscription | null;

    message?:
    string;
};


export type PushStateChangeDetail = {
    state:
    PushClientState;

    endpoint:
    string | null;

    message?:
    string;
};


export const PUSH_SUBSCRIPTION_CHANGED_EVENT =
    "dc-push-subscription-changed";


const SERVICE_WORKER_TIMEOUT =
    12_000;


const API_TIMEOUT =
    12_000;


const PUSH_SUBSCRIBE_TIMEOUT =
    12_000;


/*
 * ========================================
 * EVENTS
 * ========================================
 */

function dispatchPushStateChange(
    detail:
        PushStateChangeDetail,
) {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }


    window.dispatchEvent(
        new CustomEvent(
            PUSH_SUBSCRIPTION_CHANGED_EVENT,

            {
                detail,
            },
        ),
    );
}


/*
 * ========================================
 * TIMEOUT
 * ========================================
 */

function withTimeout<T>(
    promise:
        Promise<T>,

    timeout:
        number,

    message:
        string,
): Promise<T> {
    return new Promise(
        (
            resolve,
            reject,
        ) => {
            const timer =
                window.setTimeout(
                    () => {
                        reject(
                            new Error(
                                message,
                            ),
                        );
                    },

                    timeout,
                );


            promise.then(
                (
                    value,
                ) => {
                    window.clearTimeout(
                        timer,
                    );

                    resolve(
                        value,
                    );
                },

                (
                    error,
                ) => {
                    window.clearTimeout(
                        timer,
                    );

                    reject(
                        error,
                    );
                },
            );
        },
    );
}


/*
 * ========================================
 * VAPID
 * ========================================
 */

function urlBase64ToUint8Array(
    base64String:
        string,
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
        let index =
            0;
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
 * PLATFORM
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
            standalone?:
            boolean;
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
 * SERVICE WORKER
 * ========================================
 */

async function getReadyServiceWorker() {
    if (
        !(
            "serviceWorker" in
            navigator
        )
    ) {
        throw new Error(
            "Service workers are not supported by this browser.",
        );
    }


    /*
     * The normal PwaRegistrar should already
     * have registered this.
     *
     * This fallback protects the notification
     * button if registration was delayed.
     */

    let registration =
        await navigator
            .serviceWorker
            .getRegistration(
                "/",
            );


    if (
        !registration
    ) {
        registration =
            await navigator
                .serviceWorker
                .register(
                    "/sw.js",

                    {
                        scope:
                            "/",

                        updateViaCache:
                            "none",
                    },
                );
    }


    return withTimeout(
        navigator
            .serviceWorker
            .ready,

        SERVICE_WORKER_TIMEOUT,

        "The notification service worker did not become ready. Refresh the page and try again.",
    );
}


/*
 * ========================================
 * SERVER API
 * ========================================
 */

async function fetchPushApi(
    url:
        string,

    options:
        RequestInit,
) {
    const controller =
        new AbortController();


    const timer =
        window.setTimeout(
            () => {
                controller.abort();
            },

            API_TIMEOUT,
        );


    try {
        return await fetch(
            url,

            {
                ...options,

                signal:
                    controller.signal,
            },
        );
    } catch (
    error
    ) {
        if (
            error instanceof DOMException &&
            error.name ===
            "AbortError"
        ) {
            throw new Error(
                "The notification server took too long to respond. Please try again.",
            );
        }


        throw error;
    } finally {
        window.clearTimeout(
            timer,
        );
    }
}


export async function syncPushSubscriptionWithServer(
    subscription:
        PushSubscription,
) {
    const response =
        await fetchPushApi(
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
            `Unable to synchronize push subscription (${response.status}).`,
        );
    }


    return true;
}


/*
 * ========================================
 * CURRENT STATE
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
                "Notifications are blocked in this browser session.",
        };
    }


    try {
        const registration =
            await getReadyServiceWorker();


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
 * ENABLE
 * ========================================
 */

export async function enableJobAlerts():
    Promise<PushActionResult> {
    if (
        !supportsPushNotifications()
    ) {
        const result:
            PushActionResult = {
            state:
                "unsupported",

            message:
                "This browser does not support Web Push notifications.",
        };


        dispatchPushStateChange({
            state:
                result.state,

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    }


    if (
        isIOSDevice() &&
        !isStandalonePwa()
    ) {
        const result:
            PushActionResult = {
            state:
                "install-required",

            message:
                "Install D•C Jobs to your Home Screen first, then enable alerts from the installed app.",
        };


        dispatchPushStateChange({
            state:
                result.state,

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    }


    const publicKey =
        process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


    if (
        !publicKey
    ) {
        const result:
            PushActionResult = {
            state:
                "error",

            message:
                "VAPID public key is not configured for this deployment.",
        };


        dispatchPushStateChange({
            state:
                result.state,

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    }


    try {
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


            const result:
                PushActionResult = {
                state:
                    "denied",

                message:
                    "Notifications were not enabled. You can allow them later from your browser settings.",
            };


            dispatchPushStateChange({
                state:
                    result.state,

                endpoint:
                    null,

                message:
                    result.message,
            });


            return result;
        }


        const registration =
            await getReadyServiceWorker();


        let subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            !subscription
        ) {
            subscription =
                await withTimeout(
                    registration
                        .pushManager
                        .subscribe({
                            userVisibleOnly:
                                true,

                            applicationServerKey:
                                urlBase64ToUint8Array(
                                    publicKey,
                                ),
                        }),

                    PUSH_SUBSCRIBE_TIMEOUT,

                    "The browser took too long to create the notification subscription. Please try again.",
                );
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


        const result:
            PushActionResult = {
            state:
                "subscribed",

            subscription,

            message:
                "Job alerts are enabled on this device.",
        };


        dispatchPushStateChange({
            state:
                "subscribed",

            endpoint:
                subscription.endpoint,

            message:
                result.message,
        });


        return result;
    } catch (
    error
    ) {
        console.error(
            "Unable to enable job alerts:",
            error,
        );


        const result:
            PushActionResult = {
            state:
                "error",

            message:
                error instanceof
                    Error
                    ? error.message
                    : "Unable to enable job alerts.",
        };


        dispatchPushStateChange({
            state:
                "error",

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    }
}


/*
 * ========================================
 * DISABLE
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
            await getReadyServiceWorker();


        const subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            subscription
        ) {
            const response =
                await fetchPushApi(
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


        const result:
            PushActionResult = {
            state:
                "ready",

            subscription:
                null,

            message:
                "Job alerts have been turned off.",
        };


        dispatchPushStateChange({
            state:
                "ready",

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    } catch (
    error
    ) {
        console.error(
            "Unable to disable job alerts:",
            error,
        );


        const result:
            PushActionResult = {
            state:
                "error",

            message:
                error instanceof
                    Error
                    ? error.message
                    : "Unable to turn off notifications.",
        };


        dispatchPushStateChange({
            state:
                "error",

            endpoint:
                null,

            message:
                result.message,
        });


        return result;
    }
}