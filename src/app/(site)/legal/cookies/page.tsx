import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Cookie Policy — MapCars | South Coast Ride-Sharing",
  description:
    "How MapCars uses cookies, session storage, and security tokens across our website and applications to deliver reliable South Coast mobility.",
  openGraph: {
    title: "Cookie Policy — MapCars",
    description:
      "Information on the cookies, session tokens, and security mechanisms used by MAP CARS CHI LTD across our web portals.",
    url: "https://mapcars.uk/legal/cookies",
    siteName: "MapCars",
    locale: "en_GB",
    type: "website",
  },
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        center
        eyebrow="Legal &amp; Compliance"
        title="Cookie Policy"
        subtitle="How we use cookies, session storage, and local device technologies to provide secure, transparent mobility services."
      />

      <Section narrow>
        <div className="doc">
          <div className="doc-lead">
            This Cookie Policy explains how <strong>MapCars</strong> (operated by{" "}
            <strong>MAP CARS CHI LTD</strong>, Company No. <strong>15837715</strong>, registered in
            England and Wales and headquartered in Chichester, West Sussex) uses cookies, session
            tokens, and similar web technologies when you visit our website (<strong>mapcars.uk</strong>)
            and associated web portals. It outlines what these technologies are, why we use them, and
            how you can control your preferences in accordance with the UK Privacy and Electronic
            Communications Regulations (PECR) and UK GDPR.
          </div>
          <p className="doc-updated">Last updated: 3 October 2026</p>

          <h2>1. What are cookies and local technologies?</h2>
          <p>
            Cookies are small data files placed on your computer, smartphone, or tablet when you visit
            a website. They are widely used to make websites function properly, maintain secure user
            sessions, remember user interface preferences, and generate aggregated analytics.
          </p>
          <p>
            Related browser technologies such as <strong>Local Storage</strong> and{" "}
            <strong>Session Storage</strong> can also hold data on your device. The MapCars website
            does not currently use them to store any personal data; the only data we keep in your
            browser is the sign-in cookies listed in section 3.
          </p>

          <h2>2. How MapCars uses cookies</h2>
          <p>
            We group the technologies used across our web platform into the categories below. At
            present we only set strictly necessary sign-in cookies.
          </p>

          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Purpose &amp; Typical Examples</th>
                  <th>In use?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Strictly Necessary</strong>
                  </td>
                  <td>
                    Keeps you signed in to your customer, driver or admin account and renews your
                    session securely. Without these, you cannot sign in or book a ride.
                  </td>
                  <td>
                    <strong>Yes</strong> (Cannot be disabled)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Functional &amp; Preferences</strong>
                  </td>
                  <td>
                    Would remember display preferences such as region or language.
                  </td>
                  <td>
                    <strong>No</strong> (None set)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Analytics &amp; Advertising</strong>
                  </td>
                  <td>
                    Would measure site usage or show tailored advertising. We do not use analytics or
                    advertising cookies on this website.
                  </td>
                  <td>
                    <strong>No</strong> (None set)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Specific cookies and storage items</h2>
          <p>
            All of the cookies below are set by <strong>mapcars.uk</strong> itself, are{" "}
            <strong>HttpOnly</strong> (not readable by scripts on the page), are only sent over a
            secure (HTTPS) connection, use <code>SameSite=Lax</code>, and apply to the whole site.
            Only the cookies for the type of account you sign in with are set.
          </p>
          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name / Key</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>mc_customer</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>Short-lived (about 1 hour, renewed while you are active)</td>
                  <td>Keeps you signed in to your customer account.</td>
                </tr>
                <tr>
                  <td><code>mc_customer_rt</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>90 days</td>
                  <td>Renews your customer sign-in so you stay signed in without re-entering your password.</td>
                </tr>
                <tr>
                  <td><code>mc_driver</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>Short-lived (about 1 hour, renewed while you are active)</td>
                  <td>Keeps you signed in to your driver account.</td>
                </tr>
                <tr>
                  <td><code>mc_driver_rt</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>90 days</td>
                  <td>Renews your driver sign-in so you stay signed in without re-entering your password.</td>
                </tr>
                <tr>
                  <td><code>mc_admin</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>Short-lived (about 1 hour, renewed while you are active)</td>
                  <td>Keeps MapCars staff signed in to the admin portal.</td>
                </tr>
                <tr>
                  <td><code>mc_admin_rt</code></td>
                  <td>HTTP Cookie (HttpOnly, Secure)</td>
                  <td>90 days</td>
                  <td>Renews a staff sign-in to the admin portal.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            These cookies are deleted when you sign out. You may also see a cookie named{" "}
            <code>mc_rider</code> (or <code>mc_rider_rt</code>) left over from an earlier version of
            our website; it is no longer issued and is removed when you sign out.
          </p>

          <h2>4. Third-party cookies and services</h2>
          <p>
            The MapCars website does not load advertising or analytics services. A small number of
            third-party services may set their own cookies in the situations below; we do not control
            them and they are governed by those providers&rsquo; own policies:
          </p>
          <ul>
            <li>
              <strong>Google Sign-In:</strong> If you choose &ldquo;Continue with Google&rdquo; on the
              sign-in or sign-up page, the button is loaded from Google, which may set its own cookies
              or use similar technologies to run the sign-in. It is loaded only on those two pages.
            </li>
            <li>
              <strong>Google Maps (admin portal only):</strong> The MapCars staff live-trip map is
              provided by Google Maps. It is not used on the public website or in customer and driver
              accounts.
            </li>
            <li>
              <strong>Stripe (driver payouts):</strong> Drivers who set up payouts are sent to a
              Stripe-hosted page, where Stripe may use cookies for security and fraud prevention.
            </li>
          </ul>

          <h2>5. How you can control and delete cookies</h2>
          <p>
            We only set strictly necessary cookies, so there is no cookie banner and nothing optional to
            switch off. You can still view and delete cookies at any time:
          </p>
          <ul>
            <li>
              <strong>Browser Controls:</strong> Most web browsers allow you to view, manage, delete,
              and block cookies through their settings menu. For guidance:
              <ul>
                <li>Google Chrome: <em>Settings &rarr; Privacy and security &rarr; Cookies and other site data</em></li>
                <li>Apple Safari: <em>Preferences &rarr; Privacy &rarr; Manage Website Data</em></li>
                <li>Mozilla Firefox: <em>Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data</em></li>
                <li>Microsoft Edge: <em>Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies</em></li>
              </ul>
            </li>
            <li>
              <strong>Private / Incognito Mode:</strong> You can browse in private mode to ensure cookies
              and local storage are cleared when your window is closed.
            </li>
          </ul>
          <p>
            <em>Please note:</em> Disabling strictly necessary cookies will prevent you from signing in
            to your account, viewing live trip tracking, or managing driver documents online.
          </p>

          <h2>6. Mobile applications (iOS and Android)</h2>
          <p>
            The <strong>MapCars Customer</strong> and <strong>MapCars Driver</strong> mobile apps do not
            use traditional browser HTTP cookies. Instead, they utilize operating system secure storage
            (such as Apple Keychain and Android Keystore) to store encrypted authentication tokens and
            device push notification identifiers. For details on mobile device data, please review our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>

          <h2>7. Updates to this policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our technology,
            legal requirements, or operational practices. The revised version will always be published
            here with an updated effective date.
          </p>

          <h2>8. Contact &amp; Data Protection Officer</h2>
          <p>
            If you have questions about our use of cookies or wish to exercise your privacy rights under
            UK GDPR, please contact our team:
          </p>
          <div className="doc-contact">
            <p><strong>MAP CARS CHI LTD</strong> (Company No. 15837715)</p>
            <p>Operational Headquarters: Chichester, West Sussex, United Kingdom</p>
            <p>Email: <a href="mailto:info@mapcars.uk">info@mapcars.uk</a></p>
            <p>Helpline: <a href="tel:01243252255">01243 252255</a></p>
            <p style={{ marginBottom: 0 }}>
              WhatsApp Coordinator: <a href="https://wa.me/447389077004" target="_blank" rel="noopener noreferrer">+44 7389 077004</a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
