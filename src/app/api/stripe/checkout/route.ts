import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { APPLICATION_PLAN_PRICE_CAD_CENTS, getStripeClient } from "@/lib/stripe";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Creates a Stripe Checkout Session for the one-time Application Plan
 * unlock (build-prompt §35/37). Nothing in the product is actually gated
 * behind this in the MVP — the printable plan works free today — so this
 * route existing-but-unused when Stripe isn't configured is expected, not
 * a bug. See README.md "Billing".
 */
export async function POST() {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing isn't configured yet. The application plan is free in the meantime." },
      { status: 501 }
    );
  }

  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) {
    return NextResponse.json({ error: "Complete onboarding first." }, { status: 401 });
  }

  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "cad",
          unit_amount: APPLICATION_PLAN_PRICE_CAD_CENTS,
          product_data: { name: "Pathfinder Application Plan" },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email ?? undefined,
    client_reference_id: profile.id,
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
