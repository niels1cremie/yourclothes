import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MIRROR" },
      { name: "description", content: "How MIRROR collects, uses, and protects your personal information." },
    ],
  }),
  component: () => (
    <LegalLayout title="Privacy Policy" updated="Last updated: June 2026">
      <p>
        This Privacy Policy explains how MIRROR ("we", "us") collects, uses, and
        shares information when you use our application and services (the
        "Service"). This page is maintained by the app owner and is provided
        for informational purposes; it is not legal advice. By using the
        Service you agree to the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account information</strong> — name, email, and authentication identifiers you provide.</li>
        <li><strong>Wardrobe content</strong> — photos of garments, tags, and outfit data you upload.</li>
        <li><strong>Body & color inputs</strong> — photos and answers you submit during onboarding to generate style analysis.</li>
        <li><strong>Usage data</strong> — device type, browser, pages visited, and interaction events used to improve the Service.</li>
        <li><strong>Cookies & similar technologies</strong> — see our <a href="/cookies">Cookie Policy</a>.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To provide, operate, and improve the Service.</li>
        <li>To generate personalized style, color, and outfit recommendations.</li>
        <li>To communicate updates, security alerts, and support messages.</li>
        <li>To detect, investigate, and prevent fraud and abuse.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>3. Legal bases (GDPR / UK GDPR)</h2>
      <p>
        Where applicable, we rely on (a) your consent, (b) performance of a
        contract with you, (c) compliance with a legal obligation, and (d) our
        legitimate interests in operating and improving the Service.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with
        service providers that help us run the Service (e.g. hosting, AI
        processing, analytics) under appropriate contractual safeguards, or
        when required by law.
      </p>

      <h2>5. International transfers</h2>
      <p>
        Your data may be processed in countries other than your own. Where
        required, we use safeguards such as Standard Contractual Clauses.
      </p>

      <h2>6. Retention</h2>
      <p>
        We retain personal data for as long as your account is active and for
        a reasonable period thereafter to comply with legal obligations and
        resolve disputes.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        delete, port, or restrict the processing of your personal data, and
        to object to processing or withdraw consent. Contact us at
        privacy@mirror.app to exercise these rights.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not directed to children under 13 (or the minimum age
        required in your jurisdiction). We do not knowingly collect personal
        data from children.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard administrative, technical, and physical
        safeguards to protect personal data. No system is perfectly secure.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this Policy from time to time. Material changes will be
        communicated through the Service.
      </p>

      <h2>11. Contact</h2>
      <p>Questions? Email privacy@mirror.app.</p>
    </LegalLayout>
  ),
});
