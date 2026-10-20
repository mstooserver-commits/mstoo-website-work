import sanitizeHtml from "sanitize-html";

const TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
];

/** Sanitize remotely managed CMS copy before it reaches React's HTML renderer. */
export function sanitizeCmsHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { a: ["http", "https", "mailto", "tel"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
    },
  });
}
