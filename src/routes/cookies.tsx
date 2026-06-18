import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — MIRROR" },
      { name: "description", content: "How MIRROR uses cookies and similar technologies." },
    ],
  }),
  component: () => (
    <LegalLayout title="Cookie Policy" updated="Last updated: June 2026">
      <p>
        This Cookie Policy explains how MIRROR uses cookies and similar
        technologies when you visit our Service.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. We also use
        similar technologies such as local storage and pixels.
      </p>

      <h2>2. Categories we use</h2>
      <ul>
        <li><strong>Strictly necessary</strong> — required for authentication, security, and core functionality.</li>
        <li><strong>Preferences</strong> — remember your settings (e.g. theme, language).</li>
        <li><strong>Analytics</strong> — help us understand how the Service is used so we can improve it.</li>
      </ul>

      <h2>3. Managing cookies</h2>
      <p>
        Most browsers allow you to refuse or delete cookies. Disabling
        strictly necessary cookies may prevent the Service from functioning.
      </p>

      <h2>4. Third parties</h2>
      <p>
        Some cookies are set by third-party services we use (e.g. hosting,
        analytics). These providers process data under their own privacy
        terms.
      </p>

      <h2>5. Changes</h2>
      <p>We may update this Cookie Policy from time to time.</p>

      <h2>6. Contact</h2>
      <p>Questions? Email privacy@mirror.app.</p>
    </LegalLayout>
  ),
});
