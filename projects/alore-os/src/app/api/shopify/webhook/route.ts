// src/app/api/shopify/webhook/route.ts
// Place at: projects/alore-os/src/app/api/shopify/webhook/route.ts
//
// Receives live order webhooks from Shopify.
// Every new order → written to Supabase automatically.
// Shopify sends: orders/create, orders/updated, orders/paid

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto                        from "crypto";
import { supabaseAdmin }             from "@/lib/supabase-admin";

// ---------------------------------------------------------------------------
// Verify the request genuinely came from Shopify
// ---------------------------------------------------------------------------

function verifyWebhook(rawBody: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  const hash   = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  return hash === hmacHeader;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const hmac  = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const shop  = req.headers.get("x-shopify-shop-domain") ?? "";
  const topic = req.headers.get("x-shopify-topic")       ?? "";

  // Read raw body (must be text for HMAC verification)
  const rawBody = await req.text();

  // ── Security check ──────────────────────────────────────────────────────
  if (!verifyWebhook(rawBody, hmac)) {
    console.error("Webhook verification failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = JSON.parse(rawBody);

  // ── Find tenant by shop domain ───────────────────────────────────────────
  // For now we match by the SHOPIFY_STORE env variable
  // When you support multiple tenants, look up shopify_connections table
  const configuredShop = process.env.SHOPIFY_STORE!;

  if (shop !== configuredShop) {
    // Not our store — ignore silently (Shopify expects 200)
    return NextResponse.json({ ok: true });
  }

  // Get tenant ID from shopify_connections table
  const { data: connection } = await supabaseAdmin
    .from("shopify_connections")
    .select("tenant_id")
    .eq("shop", shop)
    .single();

  if (!connection) {
    console.error(`No tenant found for shop: ${shop}`);
    // Return 200 anyway so Shopify doesn't retry endlessly
    return NextResponse.json({ ok: true });
  }

  const tenantId = connection.tenant_id;

  // ── Handle webhook topics ────────────────────────────────────────────────
  if (
    topic === "orders/create" ||
    topic === "orders/paid"   ||
    topic === "orders/updated"
  ) {
    await upsertOrder(tenantId, order);
    await upsertCustomer(tenantId, order);
  }

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Write order to Supabase
// ---------------------------------------------------------------------------

async function upsertOrder(tenantId: string, order: unknown & { id: number; name: string; email: string; billing_address?: { first_name: string; last_name: string }; total_price?: string; subtotal_price?: string; total_tax?: string; total_discounts?: string; shipping_lines?: { price: string }[]; currency?: string; financial_status: string; fulfillment_status?: string; source_name?: string; referring_site?: string; landing_site?: string; line_items?: unknown[]; created_at: string }) {
  const { error } = await supabaseAdmin.from("orders").upsert({
    tenant_id:          tenantId,
    shopify_order_id:   String(order.id),
    order_number:       order.name,
    customer_email:     order.email,
    customer_name:      order.billing_address
                          ? `${order.billing_address.first_name} ${order.billing_address.last_name}`.trim()
                          : order.email,
    total_price:        parseFloat(order.total_price    ?? "0"),
    subtotal_price:     parseFloat(order.subtotal_price ?? "0"),
    total_tax:          parseFloat(order.total_tax      ?? "0"),
    total_discounts:    parseFloat(order.total_discounts ?? "0"),
    shipping_price:     parseFloat(order.shipping_lines?.[0]?.price ?? "0"),
    currency:           order.currency          ?? "EUR",
    financial_status:   order.financial_status,
    fulfillment_status: order.fulfillment_status ?? "unfulfilled",
    source_name:        order.source_name,
    referring_site:     order.referring_site,
    landing_site:       order.landing_site,
    line_items:         order.line_items         ?? [],
    shopify_created_at: order.created_at,
  }, { onConflict: "tenant_id,shopify_order_id" });

  if (error) console.error("Webhook order upsert error:", error.message);
}

// ---------------------------------------------------------------------------
// Upsert customer — create or update totals
// ---------------------------------------------------------------------------

async function upsertCustomer(tenantId: string, order: { email: string; billing_address?: { first_name: string; last_name: string }, total_price?: string; created_at: string } ) {
  const email = order.email;
  if (!email) return;

  const name  = order.billing_address
    ? `${order.billing_address.first_name} ${order.billing_address.last_name}`.trim()
    : email;

  const total = parseFloat(order.total_price ?? "0");

  const { data: existing } = await supabaseAdmin
    .from("customers")
    .select("id, total_orders, total_spent")
    .eq("tenant_id", tenantId)
    .eq("email", email)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("customers")
      .update({
        name,
        total_orders:  existing.total_orders + 1,
        total_spent:   Number(existing.total_spent) + total,
        last_order_at: order.created_at,
      })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin.from("customers").insert({
      tenant_id:      tenantId,
      email,
      name,
      total_orders:   1,
      total_spent:    total,
      first_order_at: order.created_at,
      last_order_at:  order.created_at,
    });
  }
}