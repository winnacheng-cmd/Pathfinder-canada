import "server-only";
import Stripe from "stripe";

/**
 * Returns null rather than throwing when Stripe isn't configured — billing
 * is optional and must never block the core product. Callers check for
 * null and respond with a clear "billing not configured" message.
 * See docs/ARCHITECTURE.md and README.md "Billing".
 */
export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** One-time "Application Plan" unlock. CAD $39 — see build-prompt §35 ($29-59 range). */
export const APPLICATION_PLAN_PRICE_CAD_CENTS = 3900;
