import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * A labelled checkbox.
 *
 * The kit had `Field`/`Input`/`Select` but no checkbox, so every page that
 * needed one hand-rolled the same label+input markup. This is that markup,
 * lifted once.
 *
 * `lockedReason` is the part worth knowing about: a checkbox that must not be
 * unticked — the last enabled payment method, say — should say *why* rather
 * than silently refusing the click or, worse, letting it through and failing on
 * save. Passing it disables the control and shows the reason as the hint.
 */
export default function Checkbox({
  label,
  hint,
  lockedReason,
  className = "",
  disabled,
  ...props
}: {
  label: ReactNode;
  hint?: ReactNode;
  lockedReason?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const isDisabled = disabled || Boolean(lockedReason);
  const note = lockedReason ?? hint;

  return (
    <div className="mb-3">
      <label
        className={`flex items-start gap-2.5 rounded-lg px-1 py-2 ${
          isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          disabled={isDisabled}
          className={`mt-0.5 size-4 shrink-0 rounded border-line-strong text-brand-ink focus:ring-brand/30 ${className}`}
          {...props}
        />
        <span className="text-sm text-ink">{label}</span>
      </label>
      {note && <p className="ml-8 -mt-1 text-xs text-ink-faint">{note}</p>}
    </div>
  );
}
