import "../landing.css";
import "../site.css";

import Footer from "@/components/landing/Footer";
import SiteHeader from "@/components/site/SiteHeader";

/**
 * Shared chrome for the interior marketing & legal pages (About, Careers,
 * Ride, Drive, Safety, Business, Blog, Press, Legal/*). Renders the branded
 * header + the landing footer around each page's content.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  );
}
