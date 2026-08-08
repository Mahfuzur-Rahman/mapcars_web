import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Privacy Policy — MapCars",
  description:
    "How MapCars collects, uses, and protects your personal data across the rider and driver apps.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        center
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we handle your data across the MapCars rider and driver apps."
      />

      <Section narrow>
        <div className="doc">
          <div className="doc-lead">
            This Privacy Policy explains how <strong>MapCars</strong>{" "}
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects,
            uses, and protects your personal data when you use the{" "}
            <strong>MapCars</strong> rider app and the{" "}
            <strong>MapCars Driver</strong> app (together, the &ldquo;Apps&rdquo;)
            and related services (the &ldquo;Service&rdquo;). We are the data
            controller under the UK GDPR and the Data Protection Act 2018.
          </div>
          <p className="doc-updated">Last updated: 7 July 2026</p>

          <h2>1. Who we are</h2>
          <p>
            MapCars is a ride-sharing app operated by{" "}
            <strong>MAP CARS CHI LTD</strong>, a company registered in England
            and Wales (company number <strong>15837715</strong>). We operate
            across the South Coast of the United Kingdom, including Southampton,
            Portsmouth, Chichester, Brighton and surrounding areas. If you have
            any questions about this policy or your data, contact us at{" "}
            <a href="mailto:info@mapcars.uk">info@mapcars.uk</a>.
          </p>

          <h2>2. Data we collect</h2>
          <h3>Account information</h3>
          <p>
            Your first name, last name, email address, phone number, and a
            password (stored only in hashed form). If you sign in with Google or
            Apple, we receive your account identifier and basic profile details
            (such as your name and email) where you have chosen to disclose them.
          </p>
          <h3>Location data</h3>
          <p>
            With your permission, we collect your device&rsquo;s precise and
            approximate location to show your position on the map, set your
            pickup point, match you with a nearby driver, and — for drivers —
            share your live location with the assigned rider during a trip.
          </p>
          <h3>Trip information</h3>
          <p>
            Pickup and drop-off addresses and coordinates, trip status,
            timestamps, and fare amounts.
          </p>
          <h3>Driver-specific information (MapCars Driver app only)</h3>
          <p>
            Your PHV (Private Hire Vehicle) licence number and driver approval
            status, used to verify your eligibility to provide rides.
          </p>
          <h3>Device &amp; technical data</h3>
          <p>
            Information needed to operate the App and to keep your sign-in
            session secure on your device.
          </p>
          <p>
            We do <strong>not</strong> currently collect payment card details in
            the App. When card payments are introduced, they will be handled by
            our payment processor (Stripe) and this policy will be updated.
          </p>

          <h2>3. How and why we use your data</h2>
          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Lawful basis (UK GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Create and manage your account</td><td>Contract</td></tr>
                <tr><td>Match riders with drivers and complete trips</td><td>Contract</td></tr>
                <tr><td>Show maps and your location</td><td>Consent (device permission) / Contract</td></tr>
                <tr><td>Verify driver eligibility (PHV licence)</td><td>Contract / Legal obligation</td></tr>
                <tr><td>Keep the Service secure and prevent fraud</td><td>Legitimate interests</td></tr>
                <tr><td>Communicate with you about your trips or account</td><td>Contract</td></tr>
                <tr><td>Comply with legal and licensing requirements</td><td>Legal obligation</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            You can withdraw location permission at any time in your device
            settings, though core features of the Service will not work without
            it.
          </p>

          <h2>4. Who we share data with</h2>
          <p>We do not sell your personal data. We share it only as needed to run the Service:</p>
          <ul>
            <li><strong>Between riders and drivers</strong> — limited details (e.g. first name, live location during a trip, pickup and drop-off) to complete your ride.</li>
            <li><strong>Service providers</strong> — mapping, hosting, and (when launched) payments (Stripe), acting on our instructions.</li>
            <li><strong>Authorities and licensing bodies</strong> — where required by law or to meet private-hire licensing obligations.</li>
          </ul>

          <h2>5. International transfers</h2>
          <p>
            Our infrastructure is hosted in the UK/EU. Where data is transferred
            outside the UK, we use appropriate safeguards such as UK
            International Data Transfer Agreements or adequacy decisions.
          </p>

          <h2>6. How long we keep data</h2>
          <p>
            We keep your account and trip data for as long as your account is
            active and as required to meet legal, tax, and licensing
            obligations, after which it is deleted or anonymised.
          </p>

          <h2>7. Your rights</h2>
          <p>
            Under UK GDPR you have the right to access, correct, delete,
            restrict, or object to processing of your personal data, and to data
            portability. To exercise any of these, contact{" "}
            <a href="mailto:info@mapcars.uk">info@mapcars.uk</a>. You
            also have the right to complain to the UK Information
            Commissioner&rsquo;s Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
          </p>

          <h2>8. Security</h2>
          <p>
            We use commercially acceptable means to protect your personal
            information. However, no method of transmission over the internet or
            electronic storage is 100% secure, and we cannot guarantee absolute
            security.
          </p>

          <h2>9. Children&rsquo;s privacy</h2>
          <p>
            These Services do not address anyone under the age of 18. We do not
            knowingly collect personally identifiable information from anyone
            under 18. If we discover that someone under 18 has provided us with
            personal information, we delete it immediately.
          </p>

          <h2>10. Delete account</h2>
          <p>
            To delete your account and personal data, email{" "}
            <a href="mailto:info@mapcars.uk">info@mapcars.uk</a> from your
            registered address. We will permanently delete your profile, contact
            details, social logins and booking history within 30 days, retaining
            only records we must keep for legal, tax and licensing obligations.
          </p>

          <h2>11. Contact us</h2>
          <div className="doc-contact">
            <p><strong>MapCars</strong> — operated by MAP CARS CHI LTD</p>
            <p>Company number: <strong>15837715</strong> — registered in England and Wales</p>
            <p>Email: <a href="mailto:info@mapcars.uk">info@mapcars.uk</a></p>
            <p>Phone: <a href="tel:+441243252255">01243 252255</a></p>
            <p>Mobile: <a href="tel:+447389077004">+44 7389 077004</a></p>
            <p style={{ marginBottom: 0 }}>
              WhatsApp:{" "}
              <a href="https://wa.me/447389077004" target="_blank" rel="noopener noreferrer">+44 7389 077004</a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
