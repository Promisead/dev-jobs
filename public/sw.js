const APP_NAME = "Dev Champions Jobs";

/*
 * ========================================
 * INSTALL
 * ========================================
 *
 * No aggressive precaching.
 *
 * Job pages, authentication, Mongo data,
 * searches and Next navigation stay live.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

/*
 * ========================================
 * ACTIVATE
 * ========================================
 */

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/*
 * ========================================
 * FUTURE WEB PUSH FOUNDATION
 * ========================================
 *
 * This listener does nothing until we
 * later create actual PushSubscriptions
 * and send messages from the server.
 */

self.addEventListener("push", (event) => {
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
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/*
 * ========================================
 * NOTIFICATION CLICK
 * ========================================
 */

self.addEventListener(
  "notificationclick",

  (event) => {
    event.notification.close();

    let targetUrl;

    try {
      targetUrl = new URL(
        event.notification.data?.url || "/",

        self.location.origin,
      );

      /*
       * Notifications may only navigate
       * inside Dev Champions Jobs.
       */
      if (targetUrl.origin !== self.location.origin) {
        targetUrl = new URL("/", self.location.origin);
      }
    } catch {
      targetUrl = new URL("/", self.location.origin);
    }

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",

          includeUncontrolled: true,
        })
        .then(async (clientList) => {
          /*
           * Reuse an existing D•C Jobs
           * window when possible.
           */
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

          /*
           * Otherwise launch the PWA/site.
           */
          if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl.href);
          }

          return undefined;
        }),
    );
  },
);
