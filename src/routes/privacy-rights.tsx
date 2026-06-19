import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useState } from "react";

export const Route = createFileRoute("/privacy-rights")({
  head: () => ({
    meta: [
      { title: "Your Privacy Rights — MIRROR" },
      { name: "description", content: "CCPA / CPRA privacy rights, Do Not Sell or Share, and opt-out request form." },
    ],
  }),
  component: PrivacyRights,
});

type RequestType =
  | "access"
  | "delete"
  | "correct"
  | "portability"
  | "do_not_sell"
  | "limit_sensitive";

function PrivacyRights() {
  const [submitted, setSubmitted] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("do_not_sell");

  return (
    <LegalLayout title="Your Privacy Rights" updated="Last updated: June 2026">
      <p>
        This page describes the rights available to residents of California
        under the California Consumer Privacy Act ("CCPA") as amended by the
        California Privacy Rights Act ("CPRA"), as well as how to submit a
        request. Residents of other U.S. states with similar laws (e.g.
        Colorado, Connecticut, Virginia, Utah) may exercise comparable rights
        using the same form.
      </p>

      <h2>1. Do Not Sell or Share My Personal Information</h2>
      <p>
        MIRROR <strong>does not sell</strong> personal information for money
        and does <strong>not share</strong> personal information for
        cross-context behavioral advertising. We do not use third-party
        advertising cookies. You can further express your preference at any
        time by:
      </p>
      <ul>
        <li>Setting cookie categories in our consent banner (decline Analytics and Marketing).</li>
        <li>Enabling the Global Privacy Control (GPC) signal in your browser — we honor GPC as a valid opt-out.</li>
        <li>Submitting the form below selecting "Do Not Sell or Share".</li>
      </ul>

      <h2>2. Right to Limit Use of Sensitive Personal Information</h2>
      <p>
        We only use sensitive personal information (such as account
        credentials and the body/color photos you provide) to deliver the
        Service you requested. We do not use it to infer characteristics
        about you for other purposes.
      </p>

      <h2>3. Your CCPA/CPRA Rights</h2>
      <ul>
        <li><strong>Right to Know</strong> — what personal information we collect, use, and disclose.</li>
        <li><strong>Right to Access / Portability</strong> — a copy of the personal information we hold about you.</li>
        <li><strong>Right to Delete</strong> — deletion of personal information we collected from you.</li>
        <li><strong>Right to Correct</strong> — correction of inaccurate personal information.</li>
        <li><strong>Right to Opt Out</strong> of sale or sharing (see above).</li>
        <li><strong>Right to Limit</strong> use of sensitive personal information.</li>
        <li><strong>Right to Non-Discrimination</strong> — we will not deny service, charge a different price, or provide a different quality of service because you exercised a right.</li>
      </ul>

      <h2>4. Authorized agents</h2>
      <p>
        You can designate an authorized agent to submit a request on your
        behalf. We may require the agent to provide proof of authorization
        and verify your identity.
      </p>

      <h2>5. Verification</h2>
      <p>
        To protect your data, we verify requests by matching information you
        provide with information already associated with your account. We
        will respond within 45 days, extendable once where permitted by law.
      </p>

      <h2>6. Submit a request</h2>

      {submitted ? (
        <div
          className="not-prose mt-4 rounded-2xl border border-foreground/10 p-5 text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Thank you — your request has been recorded and our privacy team
          will follow up by email. For urgent matters write to{" "}
          <a href="mailto:legal@mirror.app">legal@mirror.app</a>.
        </div>
      ) : (
        <form
          className="not-prose mt-4 space-y-4 rounded-2xl border border-foreground/10 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            try {
              const existing = JSON.parse(
                localStorage.getItem("mirror.privacy_requests") || "[]",
              );
              existing.push({
                type: data.get("requestType"),
                name: data.get("name"),
                email: data.get("email"),
                state: data.get("state"),
                details: data.get("details"),
                gpc:
                  typeof navigator !== "undefined" &&
                  (navigator as unknown as { globalPrivacyControl?: boolean })
                    .globalPrivacyControl === true,
                at: new Date().toISOString(),
              });
              localStorage.setItem(
                "mirror.privacy_requests",
                JSON.stringify(existing),
              );
            } catch {
              /* ignore */
            }
            setSubmitted(true);
          }}
        >
          <div>
            <label className="block text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-label)" }}>
              Request type
            </label>
            <select
              name="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              className="mt-2 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            >
              <option value="do_not_sell">Do Not Sell or Share my information</option>
              <option value="access">Access / Know what you have</option>
              <option value="delete">Delete my information</option>
              <option value="correct">Correct my information</option>
              <option value="portability">Portability (export)</option>
              <option value="limit_sensitive">Limit use of sensitive info</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-label)" }}>Full name</label>
              <input required name="name" className="mt-2 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-label)" }}>Email on account</label>
              <input required type="email" name="email" className="mt-2 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-label)" }}>State of residence</label>
            <input name="state" defaultValue="California" className="mt-2 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-label)" }}>Details (optional)</label>
            <textarea name="details" rows={4} className="mt-2 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm" />
          </div>
          <label className="flex items-start gap-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            <input type="checkbox" required className="mt-1" />
            I confirm I am the data subject or an authorized agent and the information above is accurate.
          </label>
          <button type="submit" className="pill-button w-full">
            Submit request
          </button>
        </form>
      )}

      <h2>7. Contact</h2>
      <p>
        You can also submit a request by emailing{" "}
        <a href="mailto:legal@mirror.app">legal@mirror.app</a> with the
        subject line "Privacy Request".
      </p>
    </LegalLayout>
  ),
});
