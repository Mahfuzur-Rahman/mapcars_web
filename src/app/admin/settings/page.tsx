import { Page, PageHeader, QuickLink, QuickLinks } from "@/components/ui";

/**
 * Settings hub.
 *
 * Menu row 16 ("Settings") was seeded back in 001 and has 404'd ever since.
 * Migration 034 turns it into a parent with Payment Settings beneath it, so this
 * page exists mainly so an old bookmark to /admin/settings lands on a card grid
 * rather than a dead end.
 */
export default function AdminSettingsPage() {
  return (
    <Page>
      <PageHeader
        title="Settings"
        subtitle="Platform configuration. Changes here take effect immediately — no redeploy."
      />
      <QuickLinks>
        <QuickLink
          href="/admin/settings/payments"
          icon="credit-card"
          label="Payment settings"
          description="Which methods customers can pay with"
        />
        <QuickLink
          href="/admin/fare"
          icon="sliders"
          label="Fare settings"
          description="Rates, tiers, surge and commission"
        />
      </QuickLinks>
    </Page>
  );
}
