import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-brand focus:ring-3 focus:ring-brand/15 hover:border-line-strong disabled:bg-slate-50 disabled:text-ink-faint shadow-2xs";

/** Label + control + hint/error chrome. Wrap an `Input` or `Select`. */
export default function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-ink"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <div className="mt-1.5 text-xs text-ink-faint">{hint}</div>
      )}
    </div>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} h-11 ${className}`} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${CONTROL} h-11 cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  );
}
