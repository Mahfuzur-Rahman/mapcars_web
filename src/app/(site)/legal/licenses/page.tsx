import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Licenses — MapCars",
  description:
    "Licensing information and open-source acknowledgements for the MapCars platform.",
};

const OSS = [
  { name: "Next.js", license: "MIT", use: "Web application framework" },
  { name: "React", license: "MIT", use: "User interface library" },
  { name: "Flutter", license: "BSD-3-Clause", use: "Mobile apps (rider & driver)" },
  { name: ".NET / ASP.NET Core", license: "MIT", use: "Backend API" },
  { name: "Tailwind CSS", license: "MIT", use: "Styling" },
  { name: "Mapbox GL", license: "Mapbox TOS", use: "Maps & geocoding" },
];

export default function LicensesPage() {
  return (
    <>
      <PageHero
        center
        eyebrow="Legal"
        title="Licenses"
        subtitle="Operating licences and the open-source software that helps power MapCars."
      />

      <Section narrow>
        <div className="doc">
          <div className="doc-lead">
            MapCars is operated by <strong>MAP CARS CHI LTD</strong> (company number <strong>15837715</strong>),
            a private hire platform registered in England and Wales and headquartered in Chichester, West Sussex.
            This page summarises our operating compliance framework and acknowledges the open-source software that helps power our platform.
          </div>
          <p className="doc-updated">Last updated: 8 August 2026</p>

          <h2>1. Operator licensing</h2>
          <p>
            MapCars works only with drivers who hold a valid{" "}
            <strong>Private Hire Vehicle (PHV) licence</strong> issued by the
            relevant local authority, and we verify each driver&rsquo;s licence
            before they can accept trips. Our operations comply with the
            private-hire licensing requirements of the councils in the areas we
            serve across Hampshire and West Sussex.
          </p>

          <h2>2. Company details</h2>
          <div className="doc-table-wrap">
            <table>
              <tbody>
                <tr><th>Legal entity</th><td>MAP CARS CHI LTD</td></tr>
                <tr><th>Company number</th><td>15837715</td></tr>
                <tr><th>Registered in</th><td>England and Wales</td></tr>
                <tr><th>Head office</th><td>Chichester, United Kingdom</td></tr>
              </tbody>
            </table>
          </div>

          <h2>3. Open-source acknowledgements</h2>
          <p>
            We&rsquo;re grateful to the open-source community. MapCars is built
            with, among others, the following projects, used under their
            respective licences:
          </p>
          <div className="doc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>License</th>
                  <th>Used for</th>
                </tr>
              </thead>
              <tbody>
                {OSS.map((o) => (
                  <tr key={o.name}>
                    <td><strong>{o.name}</strong></td>
                    <td>{o.license}</td>
                    <td>{o.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Full licence texts for each dependency are included with the
            respective software packages. A complete, up-to-date list is
            generated from our build and available on request.
          </p>

          <h2>4. Trademarks</h2>
          <p>
            &ldquo;MapCars&rdquo; and the MapCars logo are trademarks of MAP CARS
            CHI LTD. All other trademarks are the property of their respective
            owners and are used for identification purposes only.
          </p>

          <h2>5. Contact</h2>
          <div className="doc-contact">
            <p><strong>MAP CARS CHI LTD</strong></p>
            <p style={{ marginBottom: 0 }}>
              Email: <a href="mailto:info@mapcars.uk">info@mapcars.uk</a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
