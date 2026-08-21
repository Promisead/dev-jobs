"use client";

import InlineLoader from "@/app/components/InlineLoader";

import type Quill from "quill";

import "quill/dist/quill.snow.css";

import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;

  onChange: (value: string) => void;

  onUploadingChange?: (uploading: boolean) => void;

  placeholder?: string;
};

const TOOLBAR_OPTIONS = [
  [
    {
      header: [1, 2, 3, 4, false],
    },
  ],

  ["bold", "italic", "underline", "strike"],

  [
    {
      script: "sub",
    },

    {
      script: "super",
    },
  ],

  [
    {
      color: [],
    },

    {
      background: [],
    },
  ],

  [
    {
      list: "ordered",
    },

    {
      list: "bullet",
    },
  ],

  [
    {
      indent: "-1",
    },

    {
      indent: "+1",
    },
  ],

  [
    {
      align: [],
    },
  ],

  ["blockquote", "code-block"],

  ["link", "image"],

  ["clean"],
];

const FORMATS = [
  "header",

  "bold",
  "italic",
  "underline",
  "strike",

  "script",

  "color",
  "background",

  "list",
  "indent",

  "align",

  "blockquote",
  "code-block",

  "link",
  "image",
];

export default function RichTextEditor({
  value,
  onChange,
  onUploadingChange,
  placeholder = "Describe the role, responsibilities, requirements, benefits and application process...",
}: RichTextEditorProps) {
  const editorElementRef = useRef<HTMLDivElement | null>(null);

  const quillRef = useRef<Quill | null>(null);

  /*
   * Keep the initial description stable.
   *
   * This is particularly important when
   * editing existing jobs.
   */
  const initialValueRef = useRef(value);

  /*
   * Callback refs prevent Quill from
   * being recreated every time the
   * parent component renders.
   */
  const onChangeRef = useRef(onChange);

  const onUploadingChangeRef = useRef(onUploadingChange);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [uploadError, setUploadError] = useState("");

  /*
   * Always keep the latest callback
   * functions available to Quill.
   */
  onChangeRef.current = onChange;

  onUploadingChangeRef.current = onUploadingChange;

  useEffect(() => {
    /*
     * Read the React ref once.
     */
    const refElement = editorElementRef.current;

    /*
     * The editor cannot be initialised
     * until the DIV exists.
     */
    if (!refElement) {
      return;
    }

    /*
     * CRITICAL TYPESCRIPT FIX:
     *
     * From this point forward this value
     * has the explicit non-null type
     * HTMLElement.
     *
     * TypeScript therefore cannot widen
     * it back to HTMLDivElement | null
     * inside our asynchronous function.
     */
    const editorRoot: HTMLElement = refElement;

    /*
     * Prevent accidental double
     * initialisation.
     */
    if (quillRef.current) {
      return;
    }

    let disposed = false;

    let activeQuill: Quill | null = null;

    let textChangeHandler: (() => void) | null = null;

    async function initialiseEditor() {
      /*
       * Dynamically importing Quill prevents
       * it from trying to access browser APIs
       * during server rendering.
       */
      const { default: QuillConstructor } = await import("quill");

      /*
       * The component could have unmounted
       * while the dynamic import was loading.
       */
      if (disposed) {
        return;
      }

      /*
       * editorRoot is explicitly HTMLElement.
       *
       * There is no null possibility here.
       */
      const quill = new QuillConstructor(editorRoot, {
        theme: "snow",

        placeholder,

        formats: FORMATS,

        modules: {
          toolbar: {
            container: TOOLBAR_OPTIONS,

            handlers: {
              /*
               * Override Quill's default
               * image handler.
               *
               * Images are uploaded to
               * Cloudinary instead of
               * being stored as base64.
               */
              image: function imageHandler() {
                const input = document.createElement("input");

                input.type = "file";

                input.accept = "image/jpeg,image/png,image/webp,image/gif";

                input.onchange = async () => {
                  const file = input.files?.[0];

                  if (!file) {
                    return;
                  }

                  const MAX_FILE_SIZE = 5 * 1024 * 1024;

                  if (file.size > MAX_FILE_SIZE) {
                    setUploadError("Inline images must not exceed 5MB.");

                    return;
                  }

                  setUploadError("");

                  setIsUploadingImage(true);

                  onUploadingChangeRef.current?.(true);

                  try {
                    const formData = new FormData();

                    formData.set("file", file);

                    const response = await fetch("/api/upload", {
                      method: "POST",

                      body: formData,
                    });

                    const result = (await response.json()) as {
                      url?: string;
                      error?: string;
                    };

                    if (!response.ok || !result.url) {
                      throw new Error(result.error || "Image upload failed.");
                    }

                    /*
                     * Find the user's current
                     * cursor position.
                     */
                    const selection = quill.getSelection(true);

                    const index =
                      selection?.index ?? Math.max(0, quill.getLength() - 1);

                    /*
                     * Insert the Cloudinary URL.
                     */
                    quill.insertEmbed(index, "image", result.url, "user");

                    /*
                     * Add a paragraph after
                     * the image.
                     */
                    quill.insertText(index + 1, "\n", "user");

                    /*
                     * Move the cursor after
                     * the inserted image.
                     */
                    quill.setSelection(index + 2, 0, "silent");

                    /*
                     * Immediately sync the
                     * updated HTML with JobForm.
                     */
                    onChangeRef.current(quill.getSemanticHTML());
                  } catch (error) {
                    console.error("Rich text image upload failed:", error);

                    setUploadError(
                      error instanceof Error
                        ? error.message
                        : "Unable to upload the image.",
                    );
                  } finally {
                    setIsUploadingImage(false);

                    onUploadingChangeRef.current?.(false);
                  }
                };

                input.click();
              },
            },
          },

          history: {
            delay: 800,

            maxStack: 100,

            userOnly: true,
          },
        },
      });

      /*
       * It is possible that the component
       * was disposed immediately after
       * Quill was created.
       */
      if (disposed) {
        editorRoot.innerHTML = "";

        return;
      }

      activeQuill = quill;

      quillRef.current = quill;

      /*
       * LOAD EXISTING DESCRIPTION
       *
       * This supports:
       *
       * 1. Old plain-text jobs
       * 2. New rich-text HTML jobs
       */
      const initialValue = initialValueRef.current?.trim();

      if (initialValue) {
        const containsHtml = /<\/?[a-z][\s\S]*>/i.test(initialValue);

        if (containsHtml) {
          /*
           * New rich-text job.
           *
           * Restore the existing formatted
           * content into Quill.
           */
          quill.clipboard.dangerouslyPasteHTML(initialValue);
        } else {
          /*
           * Legacy plain-text job.
           *
           * Quill converts it into normal
           * editable content.
           */
          quill.setText(initialValue, "silent");
        }
      }

      /*
       * Synchronize the initial editor
       * contents back into JobForm.
       */
      onChangeRef.current(quill.getSemanticHTML());

      /*
       * Whenever the author types or
       * formats something, send the
       * semantic HTML to JobForm.
       */
      textChangeHandler = () => {
        const html = quill.getSemanticHTML();

        onChangeRef.current(html);
      };

      quill.on("text-change", textChangeHandler);
    }

    /*
     * Start Quill without making
     * useEffect itself async.
     */
    void initialiseEditor();

    /*
     * CLEANUP
     */
    return () => {
      disposed = true;

      if (activeQuill && textChangeHandler) {
        activeQuill.off("text-change", textChangeHandler);
      }

      if (quillRef.current === activeQuill) {
        quillRef.current = null;
      }

      /*
       * editorRoot is the same explicitly
       * typed HTMLElement that Quill was
       * mounted into.
       *
       * No React ref access is needed here.
       */
      editorRoot.innerHTML = "";
    };
  }, [placeholder]);

  return (
    <div className="job-rich-editor">
      <div className="relative">
        {/* QUILL MOUNT POINT */}
        <div ref={editorElementRef} />

        {/* INLINE IMAGE UPLOAD STATUS */}
        {isUploadingImage && (
          <div className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
            <InlineLoader />
            Uploading image...
          </div>
        )}
      </div>

      {/* EDITOR HELP / ERROR */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <p className="max-w-2xl text-xs leading-5 text-gray-500">
          Format your job description using headings, lists, colours, links and
          other options. Use the image button to upload inline images securely
          to Cloudinary.
        </p>

        {uploadError && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
