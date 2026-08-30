"use client";

import { useEffect, useState } from "react";

export type AlertPreferences = {
  newJobs: boolean;

  specialAnnouncements: boolean;

  careerReminders: boolean;

  workModes: string[];

  jobTypes: string[];

  countries: string[];

  states: string[];

  cities: string[];

  keywords: string[];

  minSalary: number | null;
};

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  newJobs: true,

  specialAnnouncements: true,

  careerReminders: true,

  workModes: [],

  jobTypes: [],

  countries: [],

  states: [],

  cities: [],

  keywords: [],

  minSalary: null,
};

type Props = {
  endpoint: string;

  initialPreferences: AlertPreferences;

  onClose: () => void;

  onSaved: (preferences: AlertPreferences) => void;
};

function toggleValue(
  values: string[],

  value: string,
) {
  if (values.includes(value)) {
    return values.filter((currentValue) => currentValue !== value);
  }

  return values.concat(value);
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((currentValue) => currentValue.trim())
    .filter(Boolean);
}

function CheckboxOption({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;

  label: string;

  description?: string;

  onChange: () => void;
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-start
        gap-3
        rounded-xl
        border
        border-gray-200
        bg-white
        p-3
        transition

        hover:border-[#077998]/40
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          mt-1
          h-4
          w-4
          accent-[#077998]
        "
      />

      <span>
        <span
          className="
            block
            text-sm
            font-semibold
            text-gray-900
          "
        >
          {label}
        </span>

        {description && (
          <span
            className="
              mt-0.5
              block
              text-xs
              leading-5
              text-gray-500
            "
          >
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export default function JobAlertPreferences({
  endpoint,
  initialPreferences,
  onClose,
  onSaved,
}: Props) {
  const [preferences, setPreferences] =
    useState<AlertPreferences>(initialPreferences);

  const [countries, setCountries] = useState(
    initialPreferences.countries.join(", "),
  );

  const [states, setStates] = useState(initialPreferences.states.join(", "));

  const [cities, setCities] = useState(initialPreferences.cities.join(", "));

  const [keywords, setKeywords] = useState(
    initialPreferences.keywords.join(", "),
  );

  const [minSalary, setMinSalary] = useState(
    initialPreferences.minSalary === null
      ? ""
      : String(initialPreferences.minSalary),
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function savePreferences() {
    setSaving(true);

    setError("");

    try {
      const response = await fetch(
        "/api/push/preferences",

        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            endpoint,

            newJobs: preferences.newJobs,

            specialAnnouncements: preferences.specialAnnouncements,

            careerReminders: preferences.careerReminders,

            workModes: preferences.workModes,

            jobTypes: preferences.jobTypes,

            countries: parseCommaList(countries),

            states: parseCommaList(states),

            cities: parseCommaList(cities),

            keywords: parseCommaList(keywords),

            minSalary: minSalary.trim() ? Number(minSalary) : null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save preferences.");
      }

      onSaved(data.preferences as AlertPreferences);

      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-end
        justify-center
        bg-black/45
        backdrop-blur-sm

        sm:items-center
        sm:p-5
      "
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-alert-preferences-title"
        className="
    job-alert-scrollbar
    max-h-[92dvh]
    w-full
    overflow-y-auto
    rounded-t-3xl
    bg-[#fafafa]
    shadow-2xl

    sm:max-w-2xl
    sm:rounded-3xl
  "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header
          className="
            sticky
            top-0
            z-10
            flex
            items-start
            justify-between
            border-b
            border-gray-200
            bg-white/95
            px-5
            py-4
            backdrop-blur

            sm:px-7
          "
        >
          <div>
            <h2
              id="job-alert-preferences-title"
              className="
                text-xl
                font-bold
                text-gray-950
              "
            >
              Personalize your job alerts
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Choose which opportunities and reminders should matter most to
              you.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close preferences"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              text-xl
              text-gray-500
              transition

              hover:bg-gray-100
            "
          >
            ×
          </button>
        </header>

        <div
          className="
            space-y-7
            px-5
            py-6

            sm:px-7
          "
        >
          <section>
            <h3
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#077998]
              "
            >
              Notifications
            </h3>

            <div
              className="
                mt-3
                grid
                gap-3

                sm:grid-cols-3
              "
            >
              <CheckboxOption
                checked={preferences.newJobs}
                label="New job opportunities"
                description="Receive newly published job alerts."
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,

                    newJobs: !current.newJobs,
                  }))
                }
              />

              <CheckboxOption
                checked={preferences.specialAnnouncements}
                label="Special announcements"
                description="Receive important D•C Jobs updates."
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,

                    specialAnnouncements: !current.specialAnnouncements,
                  }))
                }
              />

              <CheckboxOption
                checked={preferences.careerReminders}
                label="Career reminders"
                description="Occasional reminders when you haven't checked new opportunities for a while."
                onChange={() =>
                  setPreferences((current) => ({
                    ...current,

                    careerReminders: !current.careerReminders,
                  }))
                }
              />
            </div>
          </section>

          <section>
            <h3
              className="
                text-sm
                font-bold
                text-gray-950
              "
            >
              Work preference
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Leave all unchecked to mean any work mode.
            </p>

            <div
              className="
                mt-3
                grid
                gap-3

                sm:grid-cols-3
              "
            >
              {[
                ["remote", "Remote"],

                ["hybrid", "Hybrid"],

                ["onsite", "Onsite"],
              ].map((option) => (
                <CheckboxOption
                  key={option[0]}
                  checked={preferences.workModes.includes(option[0])}
                  label={option[1]}
                  onChange={() =>
                    setPreferences((current) => ({
                      ...current,

                      workModes: toggleValue(
                        current.workModes,

                        option[0],
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h3
              className="
                text-sm
                font-bold
                text-gray-950
              "
            >
              Employment type
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Leave all unchecked to mean any employment type.
            </p>

            <div
              className="
                mt-3
                grid
                gap-3

                sm:grid-cols-3
              "
            >
              {[
                ["full", "Full-time"],

                ["part", "Part-time"],

                ["project", "Project / Contract"],
              ].map((option) => (
                <CheckboxOption
                  key={option[0]}
                  checked={preferences.jobTypes.includes(option[0])}
                  label={option[1]}
                  onChange={() =>
                    setPreferences((current) => ({
                      ...current,

                      jobTypes: toggleValue(
                        current.jobTypes,

                        option[0],
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h3
              className="
                text-sm
                font-bold
                text-gray-950
              "
            >
              Locations
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
              "
            >
              Separate multiple values with commas. Leave blank to accept any.
            </p>

            <div
              className="
                mt-4
                grid
                gap-4

                sm:grid-cols-3
              "
            >
              <label>
                <span
                  className="
                    text-xs
                    font-semibold
                    text-gray-700
                  "
                >
                  Countries
                </span>

                <input
                  value={countries}
                  onChange={(event) => setCountries(event.target.value)}
                  placeholder="Nigeria"
                  className="
                    mt-1.5
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none

                    focus:border-[#077998]
                  "
                />
              </label>

              <label>
                <span
                  className="
                    text-xs
                    font-semibold
                    text-gray-700
                  "
                >
                  States
                </span>

                <input
                  value={states}
                  onChange={(event) => setStates(event.target.value)}
                  placeholder="Lagos, Ogun"
                  className="
                    mt-1.5
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none

                    focus:border-[#077998]
                  "
                />
              </label>

              <label>
                <span
                  className="
                    text-xs
                    font-semibold
                    text-gray-700
                  "
                >
                  Cities
                </span>

                <input
                  value={cities}
                  onChange={(event) => setCities(event.target.value)}
                  placeholder="Ikeja"
                  className="
                    mt-1.5
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none

                    focus:border-[#077998]
                  "
                />
              </label>
            </div>
          </section>

          <section>
            <h3
              className="
                text-sm
                font-bold
                text-gray-950
              "
            >
              Skills and keywords
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Example: React, Next.js, Python, Data, AI.
            </p>

            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="React, Next.js, Node.js"
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-gray-200
                bg-white
                px-3
                py-2.5
                text-sm
                outline-none

                focus:border-[#077998]
              "
            />
          </section>

          <section>
            <h3
              className="
                text-sm
                font-bold
                text-gray-950
              "
            >
              Minimum salary
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Optional. Leave blank if salary should not affect future matching.
            </p>

            <input
              type="number"
              min="0"
              value={minSalary}
              onChange={(event) => setMinSalary(event.target.value)}
              placeholder="500000"
              className="
                mt-3
                w-full
                rounded-xl
                border
                border-gray-200
                bg-white
                px-3
                py-2.5
                text-sm
                outline-none

                focus:border-[#077998]

                sm:max-w-xs
              "
            />
          </section>

          {error && (
            <p
              role="alert"
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
              "
            >
              {error}
            </p>
          )}
        </div>

        <footer
          className="
            sticky
            bottom-0
            flex
            flex-col-reverse
            gap-3
            border-t
            border-gray-200
            bg-white/95
            px-5
            py-4
            backdrop-blur

            sm:flex-row
            sm:justify-end
            sm:px-7
          "
        >
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              border
              border-gray-300
              bg-white
              px-5
              text-sm
              font-semibold
              text-gray-700

              hover:bg-gray-50

              disabled:opacity-60
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={savePreferences}
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              bg-[#077998]
              px-5
              text-sm
              font-semibold
              text-white

              hover:bg-[#066982]

              disabled:opacity-60
            "
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </footer>
      </section>
    </div>
  );
}
