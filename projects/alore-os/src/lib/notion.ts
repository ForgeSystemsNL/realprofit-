import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Client (lazy — only created when API key is present)
// ---------------------------------------------------------------------------

function getClient(): Client {
  if (!process.env.NOTION_API_KEY) throw new Error("NOTION_API_KEY not set");
  return new Client({ auth: process.env.NOTION_API_KEY });
}

const DB = {
  get campaigns() { return process.env.NOTION_DB_CAMPAIGNS ?? ""; },
  get creatives() { return process.env.NOTION_DB_CREATIVES ?? ""; },
  get orders() { return process.env.NOTION_DB_ORDERS ?? ""; },
  get customers() { return process.env.NOTION_DB_CUSTOMERS ?? ""; },
  get kpi() { return process.env.NOTION_DB_KPI ?? ""; },
};

// ---------------------------------------------------------------------------
// Property helpers
// ---------------------------------------------------------------------------

type Props = PageObjectResponse["properties"];
type Prop = Props[string];

function text(prop: Prop | undefined): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("");
    case "email":
      return prop.email ?? "";
    case "url":
      return prop.url ?? "";
    case "phone_number":
      return prop.phone_number ?? "";
    default:
      return "";
  }
}

function num(prop: Prop | undefined): number {
  if (!prop || prop.type !== "number") return 0;
  return prop.number ?? 0;
}

function sel(prop: Prop | undefined): string {
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name ?? "";
}

function multiSel(prop: Prop | undefined): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((o) => o.name);
}

function date(prop: Prop | undefined): string | null {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start ?? null;
}

// ---------------------------------------------------------------------------
// Schemas & types
// ---------------------------------------------------------------------------

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  platform: z.string(),
  budget: z.number(),
  spend: z.number(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const CreativeSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  type: z.string(),
  url: z.string(),
  headline: z.string(),
  cta: z.string(),
  status: z.string(),
});
export type Creative = z.infer<typeof CreativeSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  customer: z.string(),
  total: z.number(),
  status: z.string(),
  createdAt: z.string().nullable(),
});
export type Order = z.infer<typeof OrderSchema>;

export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  totalOrders: z.number(),
  totalSpent: z.number(),
  firstOrderAt: z.string().nullable(),
  tags: z.array(z.string()),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const KpiEntrySchema = z.object({
  id: z.string(),
  date: z.string().nullable(),
  revenue: z.number(),
  adSpend: z.number(),
  roas: z.number(),
  orders: z.number(),
  sessions: z.number(),
  conversionRate: z.number(),
  newSubscribers: z.number(),
});
export type KpiEntry = z.infer<typeof KpiEntrySchema>;

// ---------------------------------------------------------------------------
// Query helper
// ---------------------------------------------------------------------------

async function queryAll(
  databaseId: string,
  filter?: QueryDatabaseParameters["filter"]
): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const res = await getClient().databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of res.results) {
      if ("properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

// ---------------------------------------------------------------------------
// Exported query functions
// ---------------------------------------------------------------------------

export async function getCampaigns(): Promise<Campaign[]> {
  const pages = await queryAll(DB.campaigns);
  return pages.map((p) =>
    CampaignSchema.parse({
      id: p.id,
      name: text(p.properties["Name"]),
      status: sel(p.properties["Status"]),
      platform: sel(p.properties["Platform"]),
      budget: num(p.properties["Budget"]),
      spend: num(p.properties["Spend"]),
      startDate: date(p.properties["Start Date"]),
      endDate: date(p.properties["End Date"]),
    })
  );
}

export async function getCreatives(): Promise<Creative[]> {
  const pages = await queryAll(DB.creatives);
  return pages.map((p) =>
    CreativeSchema.parse({
      id: p.id,
      campaignId: text(p.properties["Campaign ID"]),
      type: sel(p.properties["Type"]),
      url: text(p.properties["URL"]),
      headline: text(p.properties["Headline"]),
      cta: text(p.properties["CTA"]),
      status: sel(p.properties["Status"]),
    })
  );
}

export async function getOrders(): Promise<Order[]> {
  const pages = await queryAll(DB.orders);
  return pages.map((p) =>
    OrderSchema.parse({
      id: p.id,
      orderId: text(p.properties["Order ID"]),
      customer: text(p.properties["Customer"]),
      total: num(p.properties["Total"]),
      status: sel(p.properties["Status"]),
      createdAt: date(p.properties["Created At"]),
    })
  );
}

export async function getCustomers(): Promise<Customer[]> {
  const pages = await queryAll(DB.customers);
  return pages.map((p) =>
    CustomerSchema.parse({
      id: p.id,
      email: text(p.properties["Email"]),
      name: text(p.properties["Name"]),
      totalOrders: num(p.properties["Total Orders"]),
      totalSpent: num(p.properties["Total Spent"]),
      firstOrderAt: date(p.properties["First Order At"]),
      tags: multiSel(p.properties["Tags"]),
    })
  );
}

// ---------------------------------------------------------------------------
// Write functions
// ---------------------------------------------------------------------------

export async function createOrder(data: {
  orderId: string;
  email: string;
  total: number;
  lineItems: string[];
  source: string;
}): Promise<string> {
  const page = await getClient().pages.create({
    parent: { database_id: DB.orders },
    properties: {
      "Order ID": { title: [{ text: { content: data.orderId } }] },
      "Customer": { rich_text: [{ text: { content: data.email } }] },
      "Total": { number: data.total },
      "Status": { select: { name: "Paid" } },
      "Created At": { date: { start: new Date().toISOString() } },
      "Line Items": {
        rich_text: [{ text: { content: data.lineItems.join(", ").slice(0, 2000) } }],
      },
      "Source": { rich_text: [{ text: { content: data.source } }] },
    },
  });
  return page.id;
}

export async function upsertCustomer(
  email: string,
  data: { name: string; total: number; orderCount: number; tags: string[] }
): Promise<void> {
  const existing = await getClient().databases.query({
    database_id: DB.customers,
    filter: { property: "Email", email: { equals: email } },
    page_size: 1,
  });

  const match = existing.results[0];

  if (match && "properties" in match) {
    const page = match as PageObjectResponse;
    const prevOrders = num(page.properties["Total Orders"]);
    const prevSpent = num(page.properties["Total Spent"]);
    const prevTags = multiSel(page.properties["Tags"]);
    const mergedTags = Array.from(new Set([...prevTags, ...data.tags]));

    await getClient().pages.update({
      page_id: page.id,
      properties: {
        "Name": { rich_text: [{ text: { content: data.name } }] },
        "Total Orders": { number: prevOrders + data.orderCount },
        "Total Spent": { number: prevSpent + data.total },
        "Tags": { multi_select: mergedTags.map((t) => ({ name: t })) },
      },
    });
  } else {
    await getClient().pages.create({
      parent: { database_id: DB.customers },
      properties: {
        "Email": { title: [{ text: { content: email } }] },
        "Name": { rich_text: [{ text: { content: data.name } }] },
        "Total Orders": { number: data.orderCount },
        "Total Spent": { number: data.total },
        "First Order At": { date: { start: new Date().toISOString() } },
        "Tags": { multi_select: data.tags.map((t) => ({ name: t })) },
      },
    });
  }
}

export async function updateCampaign(
  notionPageId: string,
  data: { spend: number; roas: number; cpa: number; status: string }
): Promise<void> {
  await getClient().pages.update({
    page_id: notionPageId,
    properties: {
      "Spend": { number: data.spend },
      "ROAS": { number: data.roas },
      "CPA": { number: data.cpa },
      "Status": { select: { name: data.status } },
    },
  });
}

export async function createKpiEntry(data: {
  date: string;
  revenue: number;
  adSpend: number;
  orders: number;
  sessions: number;
  conversionRate: number;
  newSubscribers: number;
}): Promise<void> {
  const existing = await getClient().databases.query({
    database_id: DB.kpi,
    filter: { property: "Date", date: { equals: data.date } },
    page_size: 1,
  });

  const roas = data.adSpend > 0 ? data.revenue / data.adSpend : 0;
  const props = {
    "Date": { date: { start: data.date } },
    "Revenue": { number: data.revenue },
    "Ad Spend": { number: data.adSpend },
    "ROAS": { number: roas },
    "Orders": { number: data.orders },
    "Sessions": { number: data.sessions },
    "Conversion Rate": { number: data.conversionRate },
    "New Subscribers": { number: data.newSubscribers },
  };

  const match = existing.results[0];
  if (match) {
    await getClient().pages.update({ page_id: match.id, properties: props });
  } else {
    await getClient().pages.create({
      parent: { database_id: DB.kpi },
      properties: {
        "Name": { title: [{ text: { content: data.date } }] },
        ...props,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// KPI query
// ---------------------------------------------------------------------------

export async function getKpiEntries(
  dateFilter?: { start: string; end: string }
): Promise<KpiEntry[]> {
  const filter: QueryDatabaseParameters["filter"] = dateFilter
    ? {
        and: [
          {
            property: "Date",
            date: { on_or_after: dateFilter.start },
          },
          {
            property: "Date",
            date: { on_or_before: dateFilter.end },
          },
        ],
      }
    : undefined;

  const pages = await queryAll(DB.kpi, filter);
  return pages.map((p) =>
    KpiEntrySchema.parse({
      id: p.id,
      date: date(p.properties["Date"]),
      revenue: num(p.properties["Revenue"]),
      adSpend: num(p.properties["Ad Spend"]),
      roas: num(p.properties["ROAS"]),
      orders: num(p.properties["Orders"]),
      sessions: num(p.properties["Sessions"]),
      conversionRate: num(p.properties["Conversion Rate"]),
      newSubscribers: num(p.properties["New Subscribers"]),
    })
  );
}
