import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from "lucide-react";

/**
 * A simple rich-text editor for the admin CMS.
 * It uses the browser's contentEditable + execCommand API, which is easy for
 * junior developers to understand. The server sanitises the HTML before save.
 */
export function RichEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Only reset the DOM when the incoming value really differs, so typing
    // does not jump the cursor to the start.
    if (document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  function command(name: string, argument?: string) {
    document.execCommand(name, false, argument);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? "");
  }

  const buttons = [
    { icon: Bold, label: "Bold", action: () => command("bold") },
    { icon: Italic, label: "Italic", action: () => command("italic") },
    { icon: Underline, label: "Underline", action: () => command("underline") },
    { icon: List, label: "Bullet list", action: () => command("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => command("insertOrderedList") },
    { icon: Quote, label: "Quote", action: () => command("formatBlock", "blockquote") },
    {
      icon: Link2,
      label: "Link",
      action: () => {
        const url = window.prompt("https://…");
        if (url) command("createLink", url);
      },
    },
    { icon: RemoveFormatting, label: "Clear formatting", action: () => command("removeFormat") },
    { icon: Undo2, label: "Undo", action: () => command("undo") },
    { icon: Redo2, label: "Redo", action: () => command("redo") },
  ];

  return (
    <div className="rounded-lg border border-base-300 bg-base-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-base-300 p-2">
        <button
          type="button"
          onClick={() => command("formatBlock", "h2")}
          className="btn btn-ghost btn-xs font-bold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => command("formatBlock", "h3")}
          className="btn btn-ghost btn-xs font-bold"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => command("formatBlock", "p")}
          className="btn btn-ghost btn-xs"
          title="Paragraph"
        >
          ¶
        </button>
        <span className="mx-1 h-5 w-px bg-base-300" />
        {buttons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            title={label}
            className="btn btn-ghost btn-xs"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="rich-editor min-h-48 p-4 text-sm outline-none"
      />
    </div>
  );
}
