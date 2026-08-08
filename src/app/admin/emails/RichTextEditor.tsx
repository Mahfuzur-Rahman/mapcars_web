"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui";

/**
 * Small `contentEditable` + `document.execCommand` rich text control. The web
 * app ships zero runtime npm dependencies (see the note at the top of
 * `components/ui/Icon.tsx`), so this avoids pulling in Tiptap/Quill for the
 * one Compose form that needs bold/lists/links.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Only push `value` into the DOM when it changes from *outside* (e.g. the
  // form resets after a successful send) — never on every keystroke, or the
  // cursor would jump to the start on each render.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  function insertLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  return (
    <div className="rounded-xl border border-line bg-surface shadow-2xs">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <ToolbarButton icon="bold" label="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon="italic" label="Italic" onClick={() => exec("italic")} />
        <ToolbarButton icon="underline" label="Underline" onClick={() => exec("underline")} />
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <ToolbarButton icon="list" label="Bulleted list" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton icon="list-ordered" label="Numbered list" onClick={() => exec("insertOrderedList")} />
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <ToolbarButton icon="link" label="Insert link" onClick={insertLink} />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-40 px-3.5 py-3 text-sm text-ink outline-none empty:before:text-ink-faint empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}
