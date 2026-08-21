import { normalizeJobDescription } from "@/lib/jobDescription";

export default function JobRichContent({
  description,
}: {
  description: string;
}) {
  /*
   * Sanitize again at render time.
   *
   * This also protects old records that
   * existed before server-side rich text
   * sanitisation was introduced.
   */
  const safeHtml = normalizeJobDescription(description);

  return (
    <div
      className="job-rich-content"
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}
