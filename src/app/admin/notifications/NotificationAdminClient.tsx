"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AudienceKind =
  | "all"
  | "workMode"
  | "jobType"
  | "country"
  | "state"
  | "city";

type Campaign = {
  id: string;

  title: string;

  body: string;

  url: string;

  audience: {
    kind: AudienceKind;

    value?: string | null;
  };

  status: "sending" | "sent" | "failed";

  attempted: number;

  delivered: number;

  failed: number;

  removed: number;

  createdByEmail?: string | null;

  sentAt?: string | null;

  createdAt?: string | null;

  failureReason?: string | null;
};

type DeliverySummary = {
  attempted: number;

  delivered: number;

  failed: number;

  removed: number;
};

type Props = {
  adminEmail: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function audienceLabel(audience: Campaign["audience"]) {
  if (audience.kind === "all") {
    return "All announcement subscribers";
  }

  const labels = {
    workMode: "Work mode",

    jobType: "Employment type",

    country: "Country",

    state: "State",

    city: "City",
  };

  return `${labels[audience.kind]}: ${audience.value || "—"}`;
}

function DeliveryBox({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-gray-950">{value}</p>
    </div>
  );
}

export default function NotificationAdminClient({ adminEmail }: Props) {
  const [title, setTitle] = useState("");

  const [message, setMessage] = useState("");

  const [destination, setDestination] = useState("/");

  const [audienceKind, setAudienceKind] = useState<AudienceKind>("all");

  const [audienceValue, setAudienceValue] = useState("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [delivery, setDelivery] = useState<DeliverySummary | null>(null);

  const requiresAudienceValue = audienceKind !== "all";

  const canSend = useMemo(() => {
    if (!title.trim() || !message.trim()) {
      return false;
    }

    if (requiresAudienceValue && !audienceValue.trim()) {
      return false;
    }

    return true;
  }, [title, message, audienceValue, requiresAudienceValue]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        "/api/push/admin/history",

        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load notification history.");
      }

      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    } catch (error) {
      console.error("Unable to load notification history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  function clearForm() {
    setTitle("");

    setMessage("");

    setDestination("/");

    setAudienceKind("all");

    setAudienceValue("");
  }

  function updateAudience(value: AudienceKind) {
    setAudienceKind(value);

    setAudienceValue("");
  }

  async function sendNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    setSuccess("");

    setDelivery(null);

    if (!canSend) {
      setError("Complete all required notification fields.");

      return;
    }

    const confirmed = window.confirm(
      "Send this notification now? Matching subscribers may receive it immediately.",
    );

    if (!confirmed) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        "/api/push/admin/send",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),

            body: message.trim(),

            url: destination.trim() || "/",

            audience: {
              kind: audienceKind,

              value: audienceKind === "all" ? null : audienceValue.trim(),
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send notification.");
      }

      const deliveryResult = data.delivery as DeliverySummary;

      setDelivery(deliveryResult);

      if (deliveryResult.attempted === 0) {
        setSuccess(
          "Campaign completed, but no subscribers matched this audience.",
        );
      } else {
        setSuccess(
          `Delivered to ${deliveryResult.delivered} of ${deliveryResult.attempted} matching subscription${deliveryResult.attempted === 1 ? "" : "s"}.`,
        );
      }

      clearForm();

      await loadHistory();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to send notification.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ================================
            COMPOSER
        ================================= */}

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-950">
              Create notification
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Send an announcement independently of job publishing.
            </p>

            {adminEmail && (
              <p className="mt-2 text-xs text-gray-400">
                Signed in as{" "}
                <span className="font-semibold text-gray-600">
                  {adminEmail}
                </span>
              </p>
            )}
          </div>

          <form onSubmit={sendNotification} className="space-y-5">
            {/* TITLE */}

            <label className="block">
              <div className="flex justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">
                  Title
                </span>

                <span className="text-xs text-gray-400">{title.length}/80</span>
              </div>

              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Fresh remote opportunities"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/10"
              />
            </label>

            {/* MESSAGE */}

            <label className="block">
              <div className="flex justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">
                  Message
                </span>

                <span className="text-xs text-gray-400">
                  {message.length}/240
                </span>
              </div>

              <textarea
                required
                rows={5}
                maxLength={240}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Fresh technology opportunities are now available..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/10"
              />
            </label>

            {/* DESTINATION */}

            <label className="block">
              <span className="text-sm font-semibold text-gray-800">
                Destination
              </span>

              <input
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="/remote-jobs"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/10"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Use a D•C Jobs path such as /, /remote-jobs or a specific job
                page.
              </p>
            </label>

            {/* AUDIENCE */}

            <div>
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">
                  Audience
                </span>

                <select
                  value={audienceKind}
                  onChange={(event) =>
                    updateAudience(event.target.value as AudienceKind)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#077998]"
                >
                  <option value="all">
                    All special-announcement subscribers
                  </option>

                  <option value="workMode">Work mode preference</option>

                  <option value="jobType">Employment type preference</option>

                  <option value="country">Country preference</option>

                  <option value="state">State preference</option>

                  <option value="city">City preference</option>
                </select>
              </label>

              {audienceKind === "workMode" && (
                <select
                  value={audienceValue}
                  onChange={(event) => setAudienceValue(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Select work mode</option>

                  <option value="remote">Remote</option>

                  <option value="hybrid">Hybrid</option>

                  <option value="onsite">Onsite</option>
                </select>
              )}

              {audienceKind === "jobType" && (
                <select
                  value={audienceValue}
                  onChange={(event) => setAudienceValue(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">Select employment type</option>

                  <option value="full">Full-time</option>

                  <option value="part">Part-time</option>

                  <option value="project">Project / Contract</option>
                </select>
              )}

              {(audienceKind === "country" ||
                audienceKind === "state" ||
                audienceKind === "city") && (
                <input
                  type="text"
                  value={audienceValue}
                  onChange={(event) => setAudienceValue(event.target.value)}
                  placeholder={
                    audienceKind === "country"
                      ? "Nigeria"
                      : audienceKind === "state"
                        ? "Lagos"
                        : "Ikeja"
                  }
                  className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none"
                />
              )}

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Users who disabled Special announcements are excluded
                automatically.
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-[#077998]/20 bg-[#f3fbfc] px-4 py-3 text-sm font-medium text-[#056777]">
                {success}
              </p>
            )}

            {delivery && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <DeliveryBox label="Matched" value={delivery.attempted} />

                <DeliveryBox label="Delivered" value={delivery.delivered} />

                <DeliveryBox label="Failed" value={delivery.failed} />

                <DeliveryBox label="Removed" value={delivery.removed} />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={sending}
                onClick={clearForm}
                className="min-h-12 rounded-xl border border-gray-300 px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={sending || !canSend}
                className="min-h-12 rounded-xl bg-[#077998] px-6 text-sm font-bold text-white transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </section>

        {/* ================================
            PREVIEW
        ================================= */}

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-gray-950 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Live Preview
              </p>

              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-gray-300">
                Web Push
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#077998] text-xs font-bold text-white">
                  DC
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400">
                    D•C Jobs
                  </p>

                  <p className="mt-0.5 break-words text-sm font-bold text-gray-950">
                    {title.trim() || "Your notification title"}
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-gray-600">
                    {message.trim() ||
                      "Your notification message will appear here."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wide text-gray-500">
                  Destination
                </p>

                <p className="mt-1 break-all text-gray-200">
                  {destination || "/"}
                </p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wide text-gray-500">
                  Audience
                </p>

                <p className="mt-1 text-gray-200">
                  {audienceKind === "all"
                    ? "All special-announcement subscribers"
                    : `${audienceKind}: ${audienceValue || "Not selected"}`}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ================================
          HISTORY
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Notification history
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent special-notification campaigns.
            </p>
          </div>

          <button
            type="button"
            disabled={historyLoading}
            onClick={() => void loadHistory()}
            className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {historyLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {historyLoading && campaigns.length === 0 && (
            <p className="text-sm text-gray-500">
              Loading notification history...
            </p>
          )}

          {!historyLoading && campaigns.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center">
              <p className="font-semibold text-gray-800">
                No notifications yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your first special campaign will appear here.
              </p>
            </div>
          )}

          {campaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="rounded-2xl border border-gray-200 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-950">
                      {campaign.title}
                    </h3>

                    <span
                      className={
                        campaign.status === "sent"
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"
                          : campaign.status === "failed"
                            ? "rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase text-red-700"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700"
                      }
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {campaign.body}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                    <span>
                      Audience:{" "}
                      <strong>{audienceLabel(campaign.audience)}</strong>
                    </span>

                    <span>
                      {formatDate(campaign.sentAt || campaign.createdAt)}
                    </span>

                    {campaign.createdByEmail && (
                      <span>Admin: {campaign.createdByEmail}</span>
                    )}
                  </div>

                  {campaign.failureReason && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {campaign.failureReason}
                    </p>
                  )}
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[360px]">
                  <DeliveryBox label="Matched" value={campaign.attempted} />

                  <DeliveryBox label="Delivered" value={campaign.delivered} />

                  <DeliveryBox label="Failed" value={campaign.failed} />

                  <DeliveryBox label="Removed" value={campaign.removed} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
