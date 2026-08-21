"use client";

import { saveJobAction } from "@/app/actions/jobActions";
import ImageUpload from "@/app/components/ImageUpload";
import InlineLoader from "@/app/components/InlineLoader";
import type { Job } from "@/models/Job";

import { faStar, faUser } from "@fortawesome/free-solid-svg-icons";

import { RadioGroup, TextArea, TextField, Theme } from "@radix-ui/themes";

import { useRouter } from "next/navigation";
import { useState } from "react";

import "react-country-state-city/dist/react-country-state-city.css";

import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";

export default function JobForm({
  orgId,
  jobDoc,
}: {
  orgId: string;
  jobDoc?: Job;
}) {
  const router = useRouter();

  const [countryId, setCountryId] = useState<number>(
    Number(jobDoc?.countryId ?? 0),
  );

  const [stateId, setStateId] = useState<number>(Number(jobDoc?.stateId ?? 0));

  const [cityId, setCityId] = useState<number>(Number(jobDoc?.cityId ?? 0));

  const [countryName, setCountryName] = useState(jobDoc?.country || "");

  const [stateName, setStateName] = useState(jobDoc?.state || "");

  const [cityName, setCityName] = useState(jobDoc?.city || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSaving, setIsSaving] = useState(false);

  const [isJobIconUploading, setIsJobIconUploading] = useState(false);

  const [isContactPhotoUploading, setIsContactPhotoUploading] = useState(false);

  const isImageUploading = isJobIconUploading || isContactPhotoUploading;

  async function handleSaveJob(data: FormData) {
    if (isSaving) {
      return;
    }

    if (isImageUploading) {
      setErrors((current) => ({
        ...current,
        form: "Please wait for the image upload to finish before publishing the job.",
      }));

      return;
    }

    const newErrors: Record<string, string> = {};

    if (!data.get("title")) {
      newErrors.title = "Job title is required.";
    }

    if (!data.get("description")) {
      newErrors.description = "Job description is required.";
    }

    if (!data.get("salary")) {
      newErrors.salary = "Salary is required.";
    }

    if (!countryName) {
      newErrors.country = "Country is required.";
    }

    if (!stateName) {
      newErrors.state = "State is required.";
    }

    if (!cityName) {
      newErrors.city = "City is required.";
    }

    if (!data.get("contactName")) {
      newErrors.contactName = "Contact name is required.";
    }

    if (!data.get("contactPhone")) {
      newErrors.contactPhone = "Contact phone is required.";
    }

    if (!data.get("contactEmail")) {
      newErrors.contactEmail = "Contact email is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setErrors({});

    data.set("country", countryName);

    data.set("state", stateName);

    data.set("city", cityName);

    data.set("countryId", countryId.toString());

    data.set("stateId", stateId.toString());

    data.set("cityId", cityId.toString());

    data.set("orgId", orgId);

    setIsSaving(true);

    try {
      const savedJob = await saveJobAction(data);

      router.push(`/jobs/${savedJob.orgId}`);

      router.refresh();
    } catch (error) {
      console.error("Failed to save job:", error);

      setIsSaving(false);

      setErrors((current) => ({
        ...current,
        form: "Unable to save this job. Please try again.",
      }));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <Theme>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (isSaving) {
            return;
          }

          const formData = new FormData(event.currentTarget);

          void handleSaveJob(formData);
        }}
        className="container mt-6 flex flex-col gap-4"
      >
        {jobDoc && <input type="hidden" name="id" value={jobDoc._id} />}

        {/* GENERAL FORM ERROR */}
        {errors.form && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errors.form}
          </div>
        )}

        {/* JOB TITLE */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Job title
          </label>

          <TextField.Root
            name="title"
            placeholder="e.g. Front-End Developer"
            defaultValue={jobDoc?.title || ""}
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* JOB TYPE / MODE / SALARY */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Work mode</p>

            <RadioGroup.Root
              defaultValue={jobDoc?.remote || "hybrid"}
              name="remote"
            >
              <RadioGroup.Item value="onsite">On-site</RadioGroup.Item>

              <RadioGroup.Item value="hybrid">Hybrid</RadioGroup.Item>

              <RadioGroup.Item value="remote">Fully remote</RadioGroup.Item>
            </RadioGroup.Root>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Employment type
            </p>

            <RadioGroup.Root defaultValue={jobDoc?.type || "full"} name="type">
              <RadioGroup.Item value="project">Project</RadioGroup.Item>

              <RadioGroup.Item value="part">Part-time</RadioGroup.Item>

              <RadioGroup.Item value="full">Full-time</RadioGroup.Item>
            </RadioGroup.Root>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Salary
            </label>

            <TextField.Root
              name="salary"
              type="number"
              min="0"
              defaultValue={jobDoc?.salary || ""}
            >
              <TextField.Slot>₦</TextField.Slot>

              <TextField.Slot>k/per month</TextField.Slot>
            </TextField.Root>

            {errors.salary && (
              <p className="mt-1 text-sm text-red-500">{errors.salary}</p>
            )}
          </div>
        </div>

        {/* LOCATION */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Location</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <CountrySelect
                defaultValue={
                  countryId && countryName
                    ? ({
                        id: countryId,
                        name: countryName,
                      } as any)
                    : undefined
                }
                onChange={(option: any) => {
                  setCountryId(option?.id || 0);

                  setCountryName(option?.name || "");

                  setStateId(0);
                  setStateName("");

                  setCityId(0);
                  setCityName("");
                }}
                placeHolder="Select Country"
              />

              {errors.country && (
                <p className="mt-1 text-sm text-red-500">{errors.country}</p>
              )}
            </div>

            <div>
              <StateSelect
                defaultValue={
                  stateId && stateName
                    ? ({
                        id: stateId,
                        name: stateName,
                      } as any)
                    : undefined
                }
                countryid={countryId}
                onChange={(option: any) => {
                  setStateId(option?.id || 0);

                  setStateName(option?.name || "");

                  setCityId(0);
                  setCityName("");
                }}
                placeHolder="Select State"
              />

              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state}</p>
              )}
            </div>

            <div>
              <CitySelect
                defaultValue={
                  cityId && cityName
                    ? ({
                        id: cityId,
                        name: cityName,
                      } as any)
                    : undefined
                }
                countryid={countryId}
                stateid={stateId}
                onChange={(option: any) => {
                  setCityId(option?.id || 0);

                  setCityName(option?.name || "");
                }}
                placeHolder="Select City"
              />

              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Job description
          </label>

          <TextArea
            defaultValue={jobDoc?.description || ""}
            placeholder="Describe the role, responsibilities, requirements and benefits..."
            resize="vertical"
            name="description"
            className="min-h-40"
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* IMAGES + CONTACT */}
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Job icon</h3>

            <ImageUpload
              name="jobIcon"
              icon={faStar}
              defaultValue={jobDoc?.jobIcon || ""}
              onUploadingChange={setIsJobIconUploading}
            />
          </div>

          <div className="sm:col-span-2">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Contact person
            </h3>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="shrink-0">
                <ImageUpload
                  name="contactPhoto"
                  icon={faUser}
                  defaultValue={jobDoc?.contactPhoto || ""}
                  onUploadingChange={setIsContactPhotoUploading}
                />
              </div>

              <div className="flex grow flex-col gap-3">
                <div>
                  <TextField.Root
                    placeholder="Contact name"
                    name="contactName"
                    defaultValue={jobDoc?.contactName || ""}
                  />

                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <TextField.Root
                    placeholder="Phone"
                    type="tel"
                    name="contactPhone"
                    defaultValue={jobDoc?.contactPhone || ""}
                  />

                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>

                <div>
                  <TextField.Root
                    placeholder="Email"
                    type="email"
                    name="contactEmail"
                    defaultValue={jobDoc?.contactEmail || ""}
                  />

                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSaving || isImageUploading}
            aria-busy={isSaving || isImageUploading}
            className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-lg bg-[#077998] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(isSaving || isImageUploading) && <InlineLoader />}

            {isImageUploading
              ? "Uploading image..."
              : isSaving
                ? jobDoc
                  ? "Updating job..."
                  : "Publishing job..."
                : jobDoc
                  ? "Update Job"
                  : "Publish Job"}
          </button>
        </div>
      </form>
    </Theme>
  );
}
