const APP_NAME = "D•C Jobs";

self.addEventListener(
  "install",

  () => {
    self.skipWaiting();
  },
);

self.addEventListener(
  "activate",

  (event) => {
    event.waitUntil(self.clients.claim());
  },
);

/*
 * ========================================
 * PUSH
 * ========================================
 */

self.addEventListener(
  "push",

  (event) => {
    let payload = {};

    if (event.data) {
      try {
        payload = event.data.json();
      } catch {
        payload = {
          body: event.data.text(),
        };
      }
    }

    const title = payload.title || APP_NAME;

    const options = {
      body: payload.body || "A new job opportunity is available.",

      icon: payload.icon || "/icons/icon-192.png",

      badge: payload.badge || "/icons/icon-192.png",

      tag: payload.tag || "dc-jobs-notification",

      renotify: Boolean(payload.renotify),

      data: {
        url: payload.url || "/",

        type: payload.type || "special",

        campaign: payload.campaign || null,

        pushId: payload.pushId || payload.tag || null,
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  },
);

/*
 * ========================================
 * NOTIFICATION CLICK
 * ========================================
 */

self.addEventListener(
  "notificationclick",

  (event) => {
    event.notification.close();

    const data = event.notification.data || {};

    let targetUrl;

    try {
      targetUrl = new URL(
        data.url || "/",

        self.location.origin,
      );

      if (targetUrl.origin !== self.location.origin) {
        targetUrl = new URL("/", self.location.origin);
      }
    } catch {
      targetUrl = new URL("/", self.location.origin);
    }

    const type = data.type || "special";

    const campaign =
      data.campaign ||
      (type === "job"
        ? "new_job_alert"
        : type === "winback"
          ? "win_back"
          : "special_announcement");

    const pushId = data.pushId || event.notification.tag || "unknown";

    /*
     * Standard GA attribution.
     */
    targetUrl.searchParams.set("utm_source", "dc_jobs");

    targetUrl.searchParams.set("utm_medium", "web_push");

    targetUrl.searchParams.set("utm_campaign", campaign);

    targetUrl.searchParams.set("utm_content", String(pushId));

    /*
     * Custom parameters used by
     * PushClickAnalytics.
     */
    targetUrl.searchParams.set("push_type", type);

    targetUrl.searchParams.set("push_campaign", campaign);

    targetUrl.searchParams.set("push_id", String(pushId));

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",

          includeUncontrolled: true,
        })
        .then(async (clientList) => {
          for (const client of clientList) {
            if (
              "focus" in client &&
              client.url.startsWith(self.location.origin)
            ) {
              await client.focus();

              if ("navigate" in client) {
                return client.navigate(targetUrl.href);
              }

              return client;
            }
          }

          if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl.href);
          }

          return undefined;
        }),
    );
  },
);
