import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MIRROR" },
      { name: "description", content: "The terms that govern your use of MIRROR." },
    ],
  }),
  component: () => (
    <LegalLayout title="Terms of Service" updated="Last updated: June 2026">
      <p>
        These Terms of Service ("Terms") govern your use of MIRROR (the
        "Service"). By creating an account or using the Service, you agree to
        these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>You must be at least 13 years old (or the minimum age in your jurisdiction) to use the Service.</p>

      <h2>2. Your account</h2>
      <p>
        You are responsible for safeguarding your account credentials and for
        all activity under your account. Notify us immediately of any
        unauthorized use.
      </p>

      <h2>3. Your content</h2>
      <p>
        You retain ownership of the photos and content you upload. You grant
        MIRROR a worldwide, non-exclusive, royalty-free license to host,
        process, and display your content solely to operate and improve the
        Service.
      </p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>No unlawful, harmful, or infringing content.</li>
        <li>No reverse engineering, scraping, or abuse of the Service.</li>
        <li>No uploading content of others without permission.</li>
      </ul>

      <h2>5. Subscriptions & billing</h2>
      <p>
        Paid plans, if any, will be billed in advance on a recurring basis
        until cancelled. Trial periods convert to paid subscriptions unless
        cancelled before the trial ends. All fees are non-refundable except as
        required by law — see our <a href="/refunds">Refund Policy</a>.
      </p>

      <h2>6. AI outputs</h2>
      <p>
        Style, color, and outfit recommendations are AI-generated and
        provided "as is" for inspiration. They are not professional advice.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including its software, design, and trademarks, is owned
        by MIRROR and protected by intellectual property laws.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate your access at any time for violation of
        these Terms. You may close your account at any time.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
        OF ANY KIND, EXPRESS OR IMPLIED.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, MIRROR WILL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the
        app owner is established, without regard to conflict of law rules.
      </p>

      <h2>12. Changes</h2>
      <p>We may update these Terms. Continued use after changes constitutes acceptance.</p>

      <h2>13. Contact</h2>
      <p>Questions? Email legal@mirror.app.</p>
    </LegalLayout>
  ),
});
