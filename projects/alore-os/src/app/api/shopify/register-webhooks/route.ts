// src/app/api/shopify/register-webhooks/route.ts
// Place at: projects/alore-os/src/app/api/shopify/register-webhooks/route.ts
//
// Call this ONCE to register webhooks on the Shopify store.
// After this, Shopify will automatically POST to your webhook
// endpoint every time an order is created, updated, or paid.
//
// Usage: GET /api/shopify/register-webhooks
// Run once after deployment — check logs to confirm success.

import { NextResponse } from "next/server";
import { registerWebhook, listWebhooks } from "@/lib/shopify";

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const webhookUrl = `${appUrl}/api/shopify/webhook`;

    // Check existing webhooks first to avoid duplicates
    const existing = await listWebhooks();
    const existingAddresses = existing.map((w: { address: string }) => w.address);

    const topics = [
      "orders/create",
      "orders/updated",
      "orders/paid",
    ];

    const results = [];

    for (const topic of topics) {
      // Skip if already registered
      if (existingAddresses.includes(webhookUrl)) {
        results.push({ topic, status: "already_registered" });
        continue;
      }

      const result = await registerWebhook(topic, webhookUrl);

      if (result.webhook) {
        results.push({
          topic,
          status:  "registered",
          id:      result.webhook.id,
          address: result.webhook.address,
        });
      } else {
        results.push({
          topic,
          status: "error",
          detail: result.errors ?? result,
        });
      }
    }

    return NextResponse.json({
      success:    true,
      webhookUrl,
      registered: results,
      existing:   existing.map((w: { id: string; topic: string; address: string }) => ({
        id:      w.id,
        topic:   w.topic,
        address: w.address,
      })),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}