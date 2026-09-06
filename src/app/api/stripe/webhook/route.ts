import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Verifies the Stripe signature before trusting anything in the payload —
 * never process an unverified webhook body. Uses the service-role client
 * because this runs with no user session (Stripe is the caller), and
 * `billing_entitlements` has no client-write RLS policy by design.
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Billing isn't configured." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentProfileId = session.client_reference_id;
    if (studentProfileId) {
      const admin = createAdminClient();
      await admin.from("billing_entitlements").upsert(
        {
          student_profile_id: studentProfileId,
          plan: "application_plan",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_checkout_session_id: session.id,
        },
        { onConflict: "student_profile_id" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
