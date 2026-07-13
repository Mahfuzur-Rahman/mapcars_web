import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Terms of Service — MapCars",
  description:
    "The terms that govern your use of the MapCars rider and driver apps and related services.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        center
        sample={false}
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The agreement between you and MapCars when you use our apps and services."
      />

      <Section narrow>
        <div className="doc">
          <div className="doc-lead">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
            and use of the <strong>MapCars</strong> rider and driver apps and
            related services (together, the &ldquo;Service&rdquo;), operated by{" "}
            <strong>MAP CARS CHI LTD</strong> (company number 15837715). By
            creating an account or using the Service, you agree to these Terms.
            This is a sample document provided for preview.
          </div>
          <p className="doc-updated">Last updated: 7 July 2026</p>

          <h2>1. Eligibility</h2>
          <p>
            You must be at least 18 years old and able to form a binding
            contract to use the Service. Drivers must additionally hold a valid
            PHV licence and meet the requirements set out on our{" "}
            <a href="/drive">Drive with Us</a> page.
          </p>

          <h2>2. Your account</h2>
          <p>
            You are responsible for keeping your login credentials secure and
            for all activity that happens under your account. Tell us
            immediately if you suspect unauthorised use. The information you give
            us must be accurate and kept up to date.
          </p>

          <h2>3. Booking and rides</h2>
          <p>
            MapCars connects riders with independent, licensed drivers. When you
            book, you enter into a direct arrangement for that ride. We show the
            fare up front; the quoted price applies unless the trip changes
            materially (for example, a new destination or added stops).
          </p>

          <h2>4. Pricing and payment</h2>
          <p>
            Fares are shown before you confirm a booking. Additional charges may
            apply for waiting time, tolls, cleaning, or cancellations, and will
            be made clear where relevant. Payment is taken through the methods
            supported in the App.
          </p>

          <h2>5. Cancellations</h2>
          <p>
            You may cancel a ride before it begins. A cancellation fee may apply
            once a driver is on the way, to fairly compensate the driver&rsquo;s
            time and travel.
          </p>

          <h2>6. Acceptable use</h2>
          <ul>
            <li>Treat drivers, riders, and staff with respect.</li>
            <li>Do not use the Service for anything unlawful or unsafe.</li>
            <li>Do not misuse, disrupt, or attempt to gain unauthorised access to the Service.</li>
            <li>Do not damage vehicles or leave them in an unreasonable state.</li>
          </ul>

          <h2>7. Driver terms</h2>
          <p>
            Drivers are independent contractors, not employees of MapCars.
            Drivers agree to hold all required licences and insurance, to keep
            their vehicle roadworthy, and to comply with all applicable laws and
            local licensing conditions.
          </p>

          <h2>8. Liability</h2>
          <p>
            Nothing in these Terms limits liability that cannot be limited by
            law. Subject to that, MapCars is not liable for the acts or
            omissions of independent drivers or riders, and our liability for the
            Service is limited to the extent permitted by law.
          </p>

          <h2>9. Suspension and termination</h2>
          <p>
            We may suspend or close accounts that breach these Terms, create
            safety risks, or involve fraudulent activity. You may close your
            account at any time.
          </p>

          <h2>10. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. We&rsquo;ll post the
            latest version here and, where changes are significant, let you know
            in the App.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These Terms are governed by the laws of England and Wales, and the
            courts of England and Wales have exclusive jurisdiction.
          </p>

          <h2>12. Contact</h2>
          <div className="doc-contact">
            <p><strong>MAP CARS CHI LTD</strong></p>
            <p>Email: <a href="mailto:mapcarsuk@gmail.com">mapcarsuk@gmail.com</a></p>
            <p style={{ marginBottom: 0 }}>Phone: <a href="tel:+441243252255">01243 252255</a></p>
          </div>
        </div>
      </Section>
    </>
  );
}
