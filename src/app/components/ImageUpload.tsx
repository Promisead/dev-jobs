"use client";

import InlineLoader from "@/app/components/InlineLoader";

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@radix-ui/themes";

import axios from "axios";
import Image from "next/image";

import { ChangeEvent, useRef, useState } from "react";

type ImageUploadProps = {
  name: string;
  icon: IconDefinition;
  defaultValue?: string;

  onUploadingChange?: (uploading: boolean) => void;
};

export default function ImageUpload({
  name,
  icon,
  defaultValue = "",
  onUploadingChange,
}: ImageUploadProps) {
  const fileInRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isImageLoading, setIsImageLoading] = useState(false);

  const [hasImageError, setHasImageError] = useState(false);

  const [url, setUrl] = useState(defaultValue);

  const canRenderImage = Boolean(url) && url.includes("res.cloudinary.com");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    onUploadingChange?.(true);

    setHasImageError(false);

    try {
      const data = new FormData();

      data.set("file", file);

      const response = await axios.post("/api/upload", data);

      if (response.data?.url) {
        setUrl(response.data.url);

        setIsImageLoading(true);
      } else {
        throw new Error("No image URL returned.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);

      alert("Unable to upload this image. Please try again.");
    } finally {
      setIsUploading(false);

      onUploadingChange?.(false);

      /*
       * Allows selecting the same file again
       * after an upload error.
       */
      event.target.value = "";
    }
  }

  const showSpinner = isUploading || (isImageLoading && !hasImageError);

  return (
    <div>
      <div className="relative inline-flex size-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
        {/* PLACEHOLDER */}
        {!showSpinner && (!canRenderImage || hasImageError) && (
          <FontAwesomeIcon icon={icon} className="h-7 w-7 text-gray-400" />
        )}

        {/* LOADER */}
        {showSpinner && <InlineLoader className="text-gray-500" />}

        {/* CLOUDINARY IMAGE */}
        {!isUploading && canRenderImage && !hasImageError && (
          <Image
            src={url}
            alt="Uploaded image"
            width={96}
            height={96}
            className="absolute inset-0 h-full w-full bg-white object-contain"
            onLoad={() => {
              setIsImageLoading(false);
            }}
            onError={() => {
              setIsImageLoading(false);

              setHasImageError(true);
            }}
          />
        )}
      </div>

      <input type="hidden" value={url} name={name} />

      <input
        onChange={upload}
        ref={fileInRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={isUploading}
        className="hidden"
      />

      <div className="mt-2">
        <Button
          type="button"
          disabled={isUploading}
          onClick={() => fileInRef.current?.click()}
          variant="soft"
        >
          <span className="inline-flex items-center gap-2">
            {isUploading && <InlineLoader />}

            {isUploading
              ? "Uploading..."
              : url
                ? "Replace image"
                : "Select image"}
          </span>
        </Button>
      </div>
    </div>
  );
}
