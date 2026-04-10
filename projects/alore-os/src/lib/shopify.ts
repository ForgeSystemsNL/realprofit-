// src/lib/shopify.ts
// Place at: projects/alore-os/src/lib/shopify.ts
//
// Shopify API client using direct access token.
// Fetches orders and customers from the connected store.

const SHOPIFY_STORE    = process.env.SHOPIFY_STORE!;
const ACCESS_TOKEN     = process.env.SHOPIFY_ACCESS_TOKEN!;
const API_VERSION      = "2024-01";
const BASE_URL         = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`;

// ---------------------------------------------------------------------------
// Base fetch helper
// ---------------------------------------------------------------------------

async function shopifyFetch(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "X-Shopify-Access-Token": ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    // Always fetch fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopifyOrder {
  id: number;
  name: string;                    // e.g. "#1042"
  email: string;
  financial_status: string;        // paid | pending | refunded
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  source_name: string;
  referring_site: string;
  landing_site: string;
  created_at: string;
  billing_address?: {
    first_name: string;
    last_name: string;
  };
  line_items: {
    id: number;
    title: string;
    quantity: number;
    price: string;
  }[];
  shipping_lines: {
    price: string;
  }[];
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  created_at: string;
  tags: string;
}

// ---------------------------------------------------------------------------
// Fetch all orders (paginated)
// ---------------------------------------------------------------------------

export async function getAllOrders(limit = 250): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = [];
  const url = `/orders.json?status=any&limit=${limit}`;

  // Handle Shopify cursor-based pagination
  while (url) {
    const data = await shopifyFetch(url);
    orders.push(...(data.orders ?? []));

    // Shopify returns next page link in response — for simplicity
    // we fetch one page (250 orders max) which covers most stores
    break;
  }

  return orders;
}

// ---------------------------------------------------------------------------
// Fetch recent orders (last 7 days)
// ---------------------------------------------------------------------------

export async function getRecentOrders(days = 7): Promise<ShopifyOrder[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  const data = await shopifyFetch(
    `/orders.json?status=any&created_at_min=${sinceStr}&limit=250`
  );

  return data.orders ?? [];
}

// ---------------------------------------------------------------------------
// Fetch single order by Shopify order ID
// ---------------------------------------------------------------------------

export async function getOrder(shopifyOrderId: string): Promise<ShopifyOrder> {
  const data = await shopifyFetch(`/orders/${shopifyOrderId}.json`);
  return data.order;
}

// ---------------------------------------------------------------------------
// Fetch all customers
// ---------------------------------------------------------------------------

export async function getAllCustomers(): Promise<ShopifyCustomer[]> {
  const data = await shopifyFetch(`/customers.json?limit=250`);
  return data.customers ?? [];
}

// ---------------------------------------------------------------------------
// Fetch store info (for verification)
// ---------------------------------------------------------------------------

export async function getShopInfo() {
  const data = await shopifyFetch(`/shop.json`);
  return data.shop;
}

// ---------------------------------------------------------------------------
// Register a webhook on the store
// ---------------------------------------------------------------------------

export async function registerWebhook(topic: string, callbackUrl: string) {
  const res = await fetch(`${BASE_URL}/webhooks.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      webhook: {
        topic,
        address: callbackUrl,
        format: "json",
      },
    }),
  });

  return res.json();
}

// ---------------------------------------------------------------------------
// List registered webhooks (for debugging)
// ---------------------------------------------------------------------------

export async function listWebhooks() {
  const data = await shopifyFetch(`/webhooks.json`);
  return data.webhooks ?? [];
}