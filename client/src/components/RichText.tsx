/**
 * Rich text from the CMS. The API sanitises every HTML string on save, so only
 * a safe allow-list of tags reaches this component.
 */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
