import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/dpa")({
  head: () => ({
    meta: [
      { title: "Data Processing Addendum — MIRROR" },
      { name: "description", content: "MIRROR's Data Processing Addendum, subprocessors, and data retention." },
    ],
  }),
  component: () => (
    <LegalLayout title="Data Processing Addendum" updated="Last updated: June 2026">
      <p>
        This Data Processing Addendum ("DPA") supplements the{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/privacy">Privacy Policy</a> and describes how MIRROR processes
        personal data on behalf of its users, the subprocessors we rely on, and
        how long we keep data. This page is maintained by the app owner for
        informational purposes and is not legal advice.
      </p>

      <h2>1. Roles</h2>
      <p>
        For account, wardrobe, and styling data you upload, MIRROR acts as a
        <strong> processor</strong> of your personal data and you act as the
        <strong> controller</strong>. For usage and diagnostic data we collect to
        operate the Service, MIRROR acts as an independent controller.
      </p>

      <h2>2. Scope of processing</h2>
      <ul>
        <li><strong>Subject matter:</strong> providing the MIRROR wardrobe and AI styling Service.</li>
        <li><strong>Duration:</strong> for as long as your account is active, plus the retention periods below.</li>
        <li><strong>Nature:</strong> storage, hosting, AI inference, analytics, and support.</li>
        <li><strong>Data categories:</strong> account identifiers, photos of garments, body and color inputs, outfit data, usage events.</li>
        <li><strong>Data subjects:</strong> account holders and individuals appearing in uploaded photos.</li>
      </ul>

      <h2>3. Subprocessors</h2>
      <p>
        MIRROR uses the following subprocessors to operate the Service. We
        require each subprocessor to provide appropriate safeguards for personal
        data.
      </p>
      <ul>
        <li>
          <strong>Lovable Cloud (Supabase infrastructure)</strong> — authentication,
          database, file storage, and serverless functions. Region: EU/US.
          Purpose: storing account, wardrobe, and application data.
        </li>
        <li>
          <strong>Lovable AI Gateway</strong> — routes AI requests to the
          underlying model providers used by the Service (which may include
          Google, OpenAI, Anthropic, and other commercial model providers).
          Purpose: generating style, color, and outfit recommendations from your
          inputs. Prompts and uploaded images may be transmitted to the chosen
          model for inference.
        </li>
        <li>
          <strong>Hosting & CDN</strong> — Cloudflare-based edge runtime for
          serving the Service. Purpose: delivering the app and processing
          requests.
        </li>
      </ul>
      <p>
        We will provide notice of material changes to this list through the
        Service. If you require a signed DPA or an up-to-date subprocessor list
        for compliance purposes, contact <a href="mailto:legal@mirror.app">legal@mirror.app</a>.
      </p>

      <h2>4. International transfers</h2>
      <p>
        Where personal data is transferred outside the EEA, UK, or your country
        of residence, we rely on appropriate safeguards such as the Standard
        Contractual Clauses or equivalent transfer mechanisms offered by our
        subprocessors.
      </p>

      <h2>5. Security</h2>
      <p>
        We use industry-standard administrative, technical, and physical
        safeguards, including encryption in transit (TLS), encryption at rest
        for data stored by our subprocessors, access controls, and row-level
        security on user data. No system is perfectly secure.
      </p>

      <h2>6. Data retention</h2>
      <ul>
        <li><strong>Account data</strong> — kept for the lifetime of your account.</li>
        <li><strong>Wardrobe photos, body and color inputs, outfits</strong> — kept until you delete the item or your account.</li>
        <li><strong>Deleted items and closed accounts</strong> — purged from active systems within 30 days and from backups within 90 days, except where retention is required by law.</li>
        <li><strong>AI prompts and outputs</strong> — retained only as needed to deliver the response and improve the Service; model providers may apply their own short-term abuse-monitoring retention.</li>
        <li><strong>Usage and diagnostic logs</strong> — retained for up to 12 months.</li>
        <li><strong>Billing records</strong> — kept for as long as required by applicable tax and accounting law (typically 6–10 years), even though MIRROR is currently free during early access.</li>
      </ul>

      <h2>7. Your rights and assistance</h2>
      <p>
        We will assist controllers in responding to data subject requests
        (access, deletion, correction, portability, objection). California
        residents can use our <a href="/privacy-rights">Privacy Rights</a>{" "}
        page to submit a request, including a "Do Not Sell or Share" opt-out.
      </p>

      <h2>8. Sub-processing changes & audits</h2>
      <p>
        Reasonable audit and information requests can be made by writing to{" "}
        <a href="mailto:legal@mirror.app">legal@mirror.app</a>. We may satisfy
        audit obligations by providing third-party reports from our
        subprocessors.
      </p>

      <h2>9. Contact</h2>
      <p>
        Data protection and legal requests: <a href="mailto:legal@mirror.app">legal@mirror.app</a>.
        Billing questions: <a href="mailto:billing@mirror.app">billing@mirror.app</a>.
      </p>
    </LegalLayout>
  ),
});
