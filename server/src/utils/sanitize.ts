import sanitizeHtml from "sanitize-html";

// Rich-text content is created in the admin editor. Before it is stored we
// remove scripts, inline event handlers and anything else that could run code.
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "em", "u", "s",
    "ul", "ol", "li", "blockquote", "a", "code", "pre", "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, options);
}

// A short plain-text excerpt for article cards and social previews.
export function makeExcerpt(html: string, maxLength = 180): string {
  const text = sanitizeHtml(html, { allowedTags: [] }).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}
