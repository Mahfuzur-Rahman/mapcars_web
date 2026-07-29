// The MapCars mark: two swooshes that read as an abstract car profile — a cyan
// roofline over a green body sweep — traced from the full logo
// (`public/assets/images/mapcars_logo1.png`). The wordmark is dropped because
// it's illegible below ~64px; this is the mark used in app chrome and the
// favicon (`src/app/icon.svg`, which inlines the same two paths).

const PATHS = (
  <>
    <path
      d="M10 71 C12 44 33 27 61 27 C88 27 110 38 124 52
         C107 43 84 38 62 38 C39 38 23 50 20 74
         C19 79 14 80 11 79 C9 77 9 74 10 71 Z"
    />
    <path
      d="M27 83 C46 69 69 62 91 62 C105 62 116 65 124 69
         C117 72 112 77 108 83 C100 79 91 77 81 77
         C62 77 42 82 30 88 C27 89 25 88 25 86 C25 85 26 84 27 83 Z"
    />
  </>
);

/**
 * Bare mark, inheriting `currentColor`. Wide aspect (~1.7:1) — size it by
 * width and let the height follow.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="8 24 118 68"
      fill="currentColor"
      role="img"
      aria-label="MapCars"
      className={className}
    >
      {PATHS}
    </svg>
  );
}

/** Rounded gradient tile with the mark knocked out in white — the app-chrome lockup. */
export default function LogoTile({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-lg text-white shadow-sm ${className}`}
      style={{ backgroundImage: "var(--gradient-brand)" }}
    >
      <LogoMark className="w-[62%]" />
    </span>
  );
}
