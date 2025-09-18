import Stripe from "stripe";
import { Hono } from "hono";
import { getCurrentSession } from "@/lib/auth";
import { pool } from "@/lib/database";

import { checkIsActive } from "@/features/subscriptions/lib";
import { stripe } from "@/lib/stripe";

type Variables = {
  user: any;
};

// Custom auth middleware
const customAuth = () => {
  return async (c: any, next: any) => {
    try {
      const session = await getCurrentSession();
      if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      c.set("user", session.user);
      await next();
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
};

const app = new Hono<{ Variables: Variables }>()
  .post("/billing", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      client.release();

      if (result.rows.length === 0) {
        return c.json({ error: "No subscription found" }, 404);
      }

      const subscription = result.rows[0];

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      });

      if (!session.url) {
        return c.json({ error: "Failed to create session" }, 400);
      }

      return c.json({ data: session.url });
    } catch (error) {
      console.error("Error creating billing session:", error);
      return c.json({ error: "Failed to create billing session" }, 500);
    }
  })
  .get("/current", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [user.id]
      );
      client.release();

      const subscription = result.rows[0] || null;
      
      // Convert date strings to Date objects for proper comparison
      if (subscription && subscription.stripe_current_period_end) {
        subscription.stripe_current_period_end = new Date(subscription.stripe_current_period_end);
      }
      
      const active = checkIsActive(subscription);

      return c.json({
        data: {
          ...subscription,
          active,
        },
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return c.json({ error: "Failed to fetch subscription" }, 500);
    }
  })
  .post("/checkout", customAuth(), async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=1`,
        payment_method_types: ["card", "paypal"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.email || "",
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      const url = session.url;
      
      if (!url) {
        return c.json({ error: "Failed to create session" }, 400);
      }

      return c.json({ data: url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  })
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (error) {
        return c.json({ error: "Invalid signature" }, 400);
      }

      const session = event.data.object as Stripe.Checkout.Session;

      if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          return c.json({ error: "Invalid session" }, 400);
        }

        const client = await pool.connect();
        await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            session.metadata.userId,
            subscription.id,
            subscription.customer as string,
            subscription.items.data[0].price.id,
            new Date(subscription.current_period_end * 1000),
            subscription.status,
            new Date(),
            new Date()
          ]
        );
        client.release();
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          return c.json({ error: "Invalid session" }, 400);
        }

        const client = await pool.connect();
        await client.query(
          `UPDATE subscriptions 
           SET stripe_current_period_end = $1, status = $2, updated_at = $3 
           WHERE stripe_subscription_id = $4`,
          [
            new Date(subscription.current_period_end * 1000),
            subscription.status,
            new Date(),
            subscription.id
          ]
        );
        client.release();
      }

      return c.json(null, 200);
    },
  )
  .post(
    "/test-create",
    customAuth(),
    async (c) => {
      const user = c.get("user");

      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const client = await pool.connect();
        
        // Check if subscription already exists
        const existingResult = await client.query(
          `SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1`,
          [user.id]
        );

        if (existingResult.rows.length > 0) {
          client.release();
          return c.json({ error: "Subscription already exists" }, 400);
        }

        // Create test subscription
        const result = await client.query(
          `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, stripe_current_period_end, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            user.id,
            'sub_test_' + Date.now(),
            'cus_test_' + Date.now(),
            'price_test_' + Date.now(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            'active',
            new Date(),
            new Date()
          ]
        );
        client.release();

        return c.json({ 
          data: result.rows[0],
          message: "Test subscription created successfully" 
        });
      } catch (error) {
        console.error("Error creating test subscription:", error);
        return c.json({ error: "Failed to create test subscription" }, 500);
      }
    },
  );

export default app;
