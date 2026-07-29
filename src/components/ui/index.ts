// Shared UI kit for the signed-in portals (admin, driver, account).
// Import from "@/components/ui" rather than reaching for individual files.

export { default as AppShell } from "./AppShell";
export type { NavNode, PortalTone } from "./AppShell";

export { default as Icon } from "./Icon";
export type { IconName } from "./Icon";

export { default as LogoTile, LogoMark } from "./Logo";

export { default as Card } from "./Card";
export { default as StatCard, StatGrid } from "./StatCard";
export type { StatTone } from "./StatCard";

export { default as Badge, driverStatusTone } from "./Badge";
export type { BadgeTone } from "./Badge";

export { default as QuickLink, QuickLinks } from "./QuickLink";

export { default as Button } from "./Button";
export { default as Field, Input, Select } from "./Field";
export { default as SlideOver } from "./SlideOver";

export { Page, PageHeader, SectionTitle } from "./Page";
export { Skeleton, ErrorBanner, EmptyState, PageLoader } from "./Feedback";
