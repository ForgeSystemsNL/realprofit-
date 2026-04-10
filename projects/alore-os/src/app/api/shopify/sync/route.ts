// src/app/api/shopify/sync/route.ts
// Place at: projects/alore-os/src/app/api/shopify/sync/route.ts

import { NextResponse }               from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin }              from "@/lib/supabase-admin";
import { getAllOrders, getAllCustomers } from "@/lib/shopify";

export async function GET() {
  try {

    let tenantId: string;

    // ── DEV MODE: skip auth, find tenant via shopify_connections ─────────────
    // This allows calling /api/shopify/sync directly in the browser without
    // being logged in. Safe for local testing only.
    // In production (NODE_ENV=production) the full auth check runs instead.
    // ────────────────────────────────────────────────────────────────────────
    if (process.env.NODE_ENV === "development") {

      const { data: connection, error: connError } = await supabaseAdmin
        .from("shopify_connections")
        .select("tenant_id")
        .eq("shop", process.env.SHOPIFY_STORE!)
        .single();

      if (connError || !connection) {
        return NextResponse.json({
          error: "No shopify_connections row found in Supabase for this store. Run the SQL setup first.",
          store: process.env.SHOPIFY_STORE,
          hint:  "Insert a row into shopify_connections with your tenant_id and shop domain.",
        }, { status: 400 });
      }

      tenantId = connection.tenant_id;

    } else {
      // ── PRODUCTION: require login ─────────────────────────────────────────
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: tenantUser } = await supabaseAdmin
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", user.id)
        .single();

      if (!tenantUser) {
        return NextResponse.json({ error: "No tenant found for this user" }, { status: 400 });
      }

      tenantId = tenantUser.tenant_id;
    }

    // ── Fetch from Shopify ──────────────────────────────────────────────────
    const [orders, customers] = await Promise.all([
      getAllOrders(),
      getAllCustomers(),
    ]);

    // ── Write orders ────────────────────────────────────────────────────────
    let ordersInserted = 0;
    let ordersError    = 0;

    for (const order of orders) {
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

      if (error) {
        console.error("Order insert error:", error.message);
        ordersError++;
      } else {
        ordersInserted++;
      }
    }

    // ── Write customers ─────────────────────────────────────────────────────
    let customersInserted = 0;
    let customersError    = 0;

    for (const customer of customers) {
      const fullName = `${customer.first_name} ${customer.last_name}`.trim();

      const { error } = await supabaseAdmin.from("customers").upsert({
        tenant_id:      tenantId,
        email:          customer.email,
        name:           fullName,
        total_orders:   customer.orders_count,
        total_spent:    parseFloat(customer.total_spent ?? "0"),
        first_order_at: customer.created_at,
        last_order_at:  customer.created_at,
        tags:           customer.tags
                          ? customer.tags.split(",").map((t: string) => t.trim())
                          : [],
      }, { onConflict: "tenant_id,email" });

      if (error) {
        console.error("Customer insert error:", error.message);
        customersError++;
      } else {
        customersInserted++;
      }
    }

    // ── Return result ───────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      tenant_id: tenantId,
      orders: {
        total:    orders.length,
        inserted: ordersInserted,
        errors:   ordersError,
      },
      customers: {
        total:    customers.length,
        inserted: customersInserted,
        errors:   customersError,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Shopify sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}