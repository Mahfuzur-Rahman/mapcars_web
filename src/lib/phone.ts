// UK phone normalization to E.164 (+44...).
//
// Accepts the messy ways users type a UK mobile and produces a single canonical
// form. Handles: spaces/brackets/dashes, a leading "0" (07700…), an existing
// "+44"/"44" country code, so we never double-prefix to "+44+44…" or "+44077…".

export function normalizeUkPhone(input: string): string {
  // Strip everything except digits and a leading "+".
  let p = input.trim().replace(/[^\d+]/g, "");

  if (p.startsWith("+44")) p = p.slice(3);
  else if (p.startsWith("44")) p = p.slice(2);

  // National trunk "0" prefix (e.g. 07700…) → drop it.
  if (p.startsWith("0")) p = p.slice(1);

  return `+44${p}`;
}
