import { useMemo } from "react";
import { isTipTapJson, renderTipTapJson } from "./RichTextEditor";

const HTML_RE = /<[a-z][\s\S]*>/i;

const DANGEROUS_TAGS = [
  "script", "iframe", "object", "embed", "form", "input", "textarea",
  "select", "button", "style", "link", "meta", "base", "applet",
];
const DANGEROUS_TAG_SELECTOR = DANGEROUS_TAGS.join(", ");

/** Strip dangerous HTML elements and event-handler attributes using the browser's DOMParser. */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll(DANGEROUS_TAG_SELECTOR).forEach((el) => el.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (
        attr.name.startsWith("on") ||
        attr.value.trimStart().startsWith("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

interface RichTextProps {
  content: string;
  className?: string;
  "data-editable"?: string;
  "data-page"?: string;
}

/** Renders content as sanitized HTML, TipTap JSON, or plain text. */
export default function RichText({ content, className, ...rest }: RichTextProps) {
  const renderedHtml = useMemo(() => {
    if (isTipTapJson(content)) {
      return sanitizeHtml(renderTipTapJson(content));
    }
    if (HTML_RE.test(content)) {
      return sanitizeHtml(content);
    }
    return null;
  }, [content]);

  if (renderedHtml !== null) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        className={`rich-content ${className ?? ""}`}
        {...rest}
      />
    );
  }

  return (
    <p className={className} {...rest}>
      {content}
    </p>
  );
}
