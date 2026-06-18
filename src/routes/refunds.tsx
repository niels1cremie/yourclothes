import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — MIRROR" },
      { name: "description", content: "MIRROR's no-refund policy and statutory exceptions." },
    ],
  }),
  component: () => (
    <LegalLayout title="Refund Policy" updated="Last updated: June 2026">
      <p>
        MIRROR offers free trials so you can evaluate paid plans before
        committing. Because of this, all payments made for subscriptions and
        one-time purchases are <strong>non-refundable</strong>, except as
        required by applicable law.
      </p>

      <h2>1. Free trials</h2>
      <p>
        Cancel any time during your free trial to avoid being charged. Once
        the trial ends, your subscription renews automatically at the listed
        price.
      </p>

      <h2>2. Cancellations</h2>
      <p>
        You can cancel a subscription at any time from your account settings.
        Cancellation stops future renewals; you retain access until the end
        of the current billing period. We do not provide pro-rated refunds
        for the unused portion of a billing period.
      </p>

      <h2>3. Statutory rights</h2>
      <p>
        Nothing in this policy limits any non-waivable consumer rights you
        may have under applicable law. If you reside in the European Union or
        United Kingdom, you may have a 14-day right of withdrawal for digital
        services; by starting a subscription you agree that performance
        begins immediately and you acknowledge that this may cause you to
        lose this right once the service has been fully provided.
      </p>

      <h2>4. Billing errors</h2>
      <p>
        If you believe you have been charged in error, contact
        billing@mirror.app within 30 days of the charge and we will review
        your request.
      </p>

      <h2>5. Chargebacks</h2>
      <p>
        Please contact us before initiating a chargeback so we can resolve
        any issue directly.
      </p>

      <h2>6. Contact</h2>
      <p>Questions? Email billing@mirror.app.</p>
    </LegalLayout>
  ),
});
