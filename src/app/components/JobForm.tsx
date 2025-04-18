'use client';
import { saveJobAction } from "@/app/actions/jobActions";
import ImageUpload from "@/app/components/ImageUpload";
import type { Job } from "@/models/Job";
import { faEnvelope, faPhone, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, RadioGroup, TextArea, TextField, Theme } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import { useState } from "react";
import "react-country-state-city/dist/react-country-state-city.css";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";

export default function JobForm({ orgId, jobDoc }: { orgId: string; jobDoc?: Job }) {
  const [countryId, setCountryId] = useState<number>(Number(jobDoc?.countryId ?? 0));
  const [stateId, setStateId] = useState<number>(Number(jobDoc?.stateId ?? 0));
  const [cityId, setCityId] = useState<number>(Number(jobDoc?.cityId ?? 0));
  const [countryName, setCountryName] = useState(jobDoc?.country || '');
  const [stateName, setStateName] = useState(jobDoc?.state || '');
  const [cityName, setCityName] = useState(jobDoc?.city || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSaveJob(data: FormData) {
    // Validate inputs
    const newErrors: Record<string, string> = {};
    if (!data.get('title')) newErrors.title = 'Job title is required.';
    if (!data.get('description')) newErrors.description = 'Job description is required.';
    if (!data.get('salary')) newErrors.salary = 'Salary is required.';
    if (!countryName) newErrors.country = 'Country is required.';
    if (!stateName) newErrors.state = 'State is required.';
    if (!cityName) newErrors.city = 'City is required.';
    if (!data.get('contactName')) newErrors.contactName = 'Contact name is required.';
    if (!data.get('contactPhone')) newErrors.contactPhone = 'Contact phone is required.';
    if (!data.get('contactEmail')) newErrors.contactEmail = 'Contact email is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop form submission
    }

    // Clear errors and proceed
    setErrors({});
    data.set('country', countryName);
    data.set('state', stateName);
    data.set('city', cityName);
    data.set('countryId', countryId.toString());
    data.set('stateId', stateId.toString());
    data.set('cityId', cityId.toString());
    data.set('orgId', orgId);
    const jobDoc = await saveJobAction(data);
    redirect(`/jobs/${jobDoc.orgId}`);
  }

  return (
    <Theme>
      <form
  onSubmit={(e) => {
    e.preventDefault(); // Prevent the default form submission
    const formData = new FormData(e.target as HTMLFormElement); // Access the form element
    handleSaveJob(formData); // Call your save function
  }}
  className="container mt-6 flex flex-col gap-4"
>
        {jobDoc && <input type="hidden" name="id" value={jobDoc._id} />}

        <div>
          <TextField.Root
            name="title"
             placeholder="Job title"
            defaultValue={jobDoc?.title || ''}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        <div className="grid sm:grid-cols-3 gap-6 *:grow">
          <div>
            Remote?
            <RadioGroup.Root defaultValue={jobDoc?.remote || 'hybrid'} name="remote">
              <RadioGroup.Item value="onsite">On-site</RadioGroup.Item>
              <RadioGroup.Item value="hybrid">Hybrid-remote</RadioGroup.Item>
              <RadioGroup.Item value="remote">Fully remote</RadioGroup.Item>
            </RadioGroup.Root>
          </div>
          <div>
            Full time?
            <RadioGroup.Root defaultValue={jobDoc?.type || 'full'} name="type">
              <RadioGroup.Item value="project">Project</RadioGroup.Item>
              <RadioGroup.Item value="part">Part-time</RadioGroup.Item>
              <RadioGroup.Item value="full">Full-time</RadioGroup.Item>
            </RadioGroup.Root>
          </div>
          <div>
            Salary
            <TextField.Root name="salary" defaultValue={jobDoc?.salary || ''}>
              <TextField.Slot>$</TextField.Slot>
              <TextField.Slot>k/year</TextField.Slot>
            </TextField.Root>
            {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
          </div>
        </div>

        <div>
          Location
          <div className="flex flex-col sm:flex-row gap-4 *:grow">
            <CountrySelect
              defaultValue={
                countryId && countryName
                  ? { id: countryId, name: countryName } as any
                  : undefined
              }
              onChange={(e: any) => {
                setCountryId(e.id);
                setCountryName(e.name);
              }}
              placeHolder="Select Country"
            />
            {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            <StateSelect
              defaultValue={
                stateId && stateName
                  ? { id: stateId, name: stateName } as any
                  : undefined
              }
              countryid={countryId}
              onChange={(e: any) => {
                setStateId(e.id);
                setStateName(e.name);
              }}
              placeHolder="Select State"
            />
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            <CitySelect
              defaultValue={
                cityId && cityName
                  ? { id: cityId, name: cityName } as any
                  : undefined
              }
              countryid={countryId}
              stateid={stateId}
              onChange={(e: any) => {
                setCityId(e.id);
                setCityName(e.name);
              }}
              placeHolder="Select City"
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>
        </div>

        <div>
          <TextArea
            defaultValue={jobDoc?.description || ''}
            placeholder="Job description"
            resize="vertical"
            name="description"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div className="sm:flex">
          <div className="w-1/3">
            <h3>Job icon</h3>
            <ImageUpload
              name="jobIcon"
              icon={faStar}
              defaultValue={jobDoc?.jobIcon || ''}
            />
          </div>
          <div className="grow">
            <h3>Contact person</h3>
            <div className="flex gap-2">
              <ImageUpload
                name="contactPhoto"
                icon={faUser}
                defaultValue={jobDoc?.contactPhoto || ''}
              />
              <div className="grow flex flex-col gap-1">
                <TextField.Root
                  placeholder="John Doe"
                  name="contactName"
                  defaultValue={jobDoc?.contactName || ''}
                />
                {errors.contactName && <p className="text-red-500 text-sm">{errors.contactName}</p>}
                <TextField.Root
                  placeholder="Phone"
                  type="tel"
                  name="contactPhone"
                  defaultValue={jobDoc?.contactPhone || ''}
                />
                {errors.contactPhone && <p className="text-red-500 text-sm">{errors.contactPhone}</p>}
                <TextField.Root
                  placeholder="Email"
                  type="email"
                  name="contactEmail"
                  defaultValue={jobDoc?.contactEmail || ''}
                />
                {errors.contactEmail && <p className="text-red-500 text-sm">{errors.contactEmail}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="3">
            <span className="px-8">Save</span>
          </Button>
        </div>
      </form>
    </Theme>
  );
}