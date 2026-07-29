"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Sign-in is unified at /auth/login. Kept as a redirect for old bookmarks/links.
export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);

  return null;
}
