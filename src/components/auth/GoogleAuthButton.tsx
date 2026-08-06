"use client";

// "Continue with Google" for the rider (customer) web flow.
//
// When `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set we hand off to Google Identity
// Services, which renders its own official button and gives us an ID token; we
// post that to `/api/bff/rider/google` → `POST /api/v1/auth/riders/google`,
// which upserts the rider and sets the httpOnly session cookie.
//
// When it is NOT set (today) the button still renders — clicking it says so
// plainly instead of failing silently. Nothing else on the page changes.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { riderAuth, ApiError } from "@/lib/api";
import { env } from "@/lib/env";

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface CredentialResponse {
  credential?: string;
}

interface GsiButtonOptions {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (res: CredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }): void;
          renderButton(parent: HTMLElement, options: GsiButtonOptions): void;
        };
      };
    };
  }
}

/** The 4-colour Google "G". */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.94a9 9 0 0 0 0 8.1l3.03-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.95l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

interface Props {
  /** Surfaced in the page's existing error banner. */
  onError: (message: string) => void;
  /** "continue_with" on login, "signup_with" on the create-account page. */
  intent?: "signin" | "signup";
}

export default function GoogleAuthButton({ onError, intent = "signin" }: Props) {
  const router = useRouter();
  const slotRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [rendered, setRendered] = useState(false);
  const clientId = env.googleClientId;

  const signIn = useCallback(
    async (idToken: string) => {
      setBusy(true);
      onError("");
      try {
        const session = await riderAuth.google(idToken);
        router.push(session.isProfileComplete ? "/account" : "/auth/profile");
        router.refresh();
      } catch (err) {
        onError(
          err instanceof ApiError ? err.message : "Google sign-in failed",
        );
      } finally {
        setBusy(false);
      }
    },
    [onError, router],
  );

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const init = () => {
      const gsi = window.google?.accounts.id;
      if (!gsi || cancelled || !slotRef.current) return;
      gsi.initialize({
        client_id: clientId,
        callback: (res) => {
          if (res.credential) void signIn(res.credential);
        },
        cancel_on_tap_outside: true,
      });
      gsi.renderButton(slotRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: intent === "signup" ? "signup_with" : "continue_with",
        logo_alignment: "center",
        width: 320,
      });
      setRendered(true);
    };

    if (window.google) {
      init();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", init);
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script.removeEventListener("load", init);
    };
  }, [clientId, intent, signIn]);

  const label = intent === "signup" ? "Sign up with Google" : "Continue with Google";

  return (
    <div className="auth-social">
      <div className="auth-or">
        <span>or</span>
      </div>

      {/* Google renders its official button in here once GIS has loaded. */}
      <div ref={slotRef} className="auth-google-slot" aria-live="polite" />

      {/* Shown until GIS renders — and permanently while no client ID is set. */}
      {!rendered && (
        <button
          type="button"
          className="auth-google"
          disabled={busy}
          onClick={() =>
            onError(
              clientId
                ? "Google sign-in is still loading — please try again in a moment."
                : "Google sign-in isn't set up yet. Please use email or phone for now.",
            )
          }
        >
          <GoogleMark />
          <span>{label}</span>
        </button>
      )}
    </div>
  );
}
