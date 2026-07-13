import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Cookie Policy — MapCars",
  description:
    "How MapCars uses cookies and similar technologies across our website and apps.",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        center
        sample={false}
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="How we use cookies and similar technologies across the MapCars website."
      />

      <Section narrow>
        <div className="doc">
          <div className="doc-lead">
            This Cookie Policy explains how <strong>MapCars</strong> (operated by
            MAP CARS CHI LTD) uses cookies and similar technologies to recognise
            you when you visit our website. It explains what these technologies
            are, why we use them, and your choices. This is a sample document
            provided for preview.
          </div>
          <p className="doc-updated">Last updated: 7 July 2026</p>

          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a
            website. They are widely used to make websites work, or work more
            efficiently, and to provide reporting information to site owners.
          </p>

          <h2>2. How we use cookies</h2>
          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Purpose</th>
                  <th>Can you turn it off?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Strictly necessary</strong></td>
                  <td>Keep the site secure, remember your session, and enable core features.</td>
                  <td>No — the site can&rsquo;t work without them.</td>
                </tr>
                <tr>
                  <td><strong>Preferences</strong></td>
                  <td>Remember choices such as region or language.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><strong>Analytics</strong></td>
                  <td>Help us understand how the site is used so we can improve it.</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td><strong>Marketing</strong></td>
                  <td>Measure the performance of campaigns that bring people to MapCars.</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Third-party cookies</h2>
          <p>
            Some cookies are set by third parties we work with — for example,
            mapping and analytics providers. These parties may use cookies to
            provide their services and are responsible for their own practices.
          </p>

          <h2>4. Managing cookies</h2>
          <p>
            You can control and delete cookies through your browser settings.
            Most browsers let you refuse or accept cookies and clear those
            already stored. Note that turning off some cookies may affect how the
            site behaves.
          </p>
          <ul>
            <li>Adjust your browser&rsquo;s privacy settings to block or clear cookies.</li>
            <li>Use private/incognito browsing to limit what is stored.</li>
            <li>Opt out of analytics via any consent controls we provide on the site.</li>
          </ul>

          <h2>5. Mobile apps</h2>
          <p>
            Our mobile apps do not use browser cookies, but may use similar
            technologies (such as local storage and device identifiers) to keep
            you signed in and to operate the Service. See our{" "}
            <a href="/legal/privacy">Privacy Policy</a> for details.
          </p>

          <h2>6. Changes to this policy</h2>
          <p>
            We may update this Cookie Policy as our use of cookies evolves. The
            latest version will always be available on this page.
          </p>

          <h2>7. Contact</h2>
          <div className="doc-contact">
            <p><strong>MAP CARS CHI LTD</strong></p>
            <p style={{ marginBottom: 0 }}>
              Email: <a href="mailto:mapcarsuk@gmail.com">mapcarsuk@gmail.com</a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
