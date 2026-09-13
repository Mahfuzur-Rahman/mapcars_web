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
          <p className="doc-updated">Last updated: 8 August 2026</p>

          <h2>1. What are cookies and local technologies?</h2>
          <p>
            Cookies are small data files placed on your computer, smartphone, or tablet when you visit
            a website. They are widely used to make websites function properly, maintain secure user
            sessions, remember user interface preferences, and generate aggregated analytics.
          </p>
          <p>
            In addition to HTTP cookies, we may use related browser technologies such as{" "}
            <strong>Local Storage</strong> and <strong>Session Storage</strong> to preserve application
            state (for example, keeping you signed in across page transitions in our web portal).
          </p>

          <h2>2. How MapCars uses cookies</h2>
          <p>
            We group the cookies and storage technologies used across our web platform into the
            following four clear categories:
          </p>

          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Purpose &amp; Typical Examples</th>
                  <th>Essential?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Strictly Necessary</strong>
                  </td>
                  <td>
                    Essential for website operation, user authentication, CSRF security tokens,
                    session state, and API rate-limiting. Without these, you cannot sign in or book a
                    ride.
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
                    Remembers your display preferences (e.g. region choice, map viewport coordinates,
                    saved pickup suggestions, or language selection).
                  </td>
                  <td>
                    <strong>Optional</strong> (Controlled in settings)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Performance &amp; Diagnostics</strong>
                  </td>
                  <td>
                    Helps us monitor server response times, map tile rendering latency, and page error
                    rates so we can keep our dispatch systems fast and reliable across the South
                    Coast.
                  </td>
                  <td>
                    <strong>Optional</strong> (Aggregated / Anonymised)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Security &amp; Fraud Prevention</strong>
                  </td>
                  <td>
                    Detects suspicious automated traffic, rapid bot requests, and unauthorised session
                    takeovers to protect customer and driver accounts.
                  </td>
                  <td>
                    <strong>Yes</strong> (Legitimate Security Interest)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Specific cookies and storage items</h2>
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
                  <td><code>mapcars_session</code></td>
                  <td>HTTP Cookie (Secure)</td>
                  <td>Session</td>
                  <td>Maintains your authenticated session state across portal pages.</td>
                </tr>
                <tr>
                  <td><code>__Host-csrf_token</code></td>
                  <td>HTTP Cookie (SameSite)</td>
                  <td>Session</td>
                  <td>Cross-Site Request Forgery security protection for web forms.</td>
                </tr>
                <tr>
                  <td><code>mc_pref_region</code></td>
                  <td>Local Storage</td>
                  <td>Persistent (1 Year)</td>
                  <td>Stores your selected South Coast zone (e.g., Chichester, Brighton, Southampton).</td>
                </tr>
                <tr>
                  <td><code>mc_cookie_consent</code></td>
                  <td>Local Storage</td>
                  <td>Persistent (1 Year)</td>
                  <td>Records your cookie banner preferences and opt-in choices.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>4. Third-party cookies and services</h2>
          <p>
            When using our online mapping features or booking portals, third-party infrastructure
            providers may set cookies or inspect device characteristics to deliver their services:
          </p>
          <ul>
            <li>
              <strong>Map Providers &amp; Geocoding:</strong> Map tiles and routing telemetry to render
              South Coast road maps accurately.
            </li>
            <li>
              <strong>Payment Processing (Stripe):</strong> When card transactions occur, Stripe uses
              fraud prevention and device telemetry cookies to detect compromised cards and unauthorized
              activity.
            </li>
          </ul>

          <h2>5. How you can control and delete cookies</h2>
          <p>
            You have the right to accept or decline non-essential cookies. You can manage your choices
            at any time:
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
