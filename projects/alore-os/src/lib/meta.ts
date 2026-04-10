import axios from "axios";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const META_API_VERSION = "v18.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN ?? "";
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID ?? "";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const CampaignInsightSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  spend: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  cpa: z.number(),
});
export type CampaignInsight = z.infer<typeof CampaignInsightSchema>;

// ---------------------------------------------------------------------------
// Raw API response shape
// ---------------------------------------------------------------------------

const RawInsightSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  spend: z.string(),
  impressions: z.string(),
  clicks: z.string(),
  actions: z
    .array(z.object({ action_type: z.string(), value: z.string() }))
    .optional(),
  cost_per_action_type: z
    .array(z.object({ action_type: z.string(), value: z.string() }))
    .optional(),
});

// ---------------------------------------------------------------------------
// Fetch insights
// ---------------------------------------------------------------------------

export async function getCampaignInsights(): Promise<CampaignInsight[]> {
  if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) return [];

  const url = `${BASE_URL}/act_${AD_ACCOUNT_ID}/insights`;

  const res = await axios.get(url, {
    params: {
      access_token: ACCESS_TOKEN,
      level: "campaign",
      fields:
        "campaign_id,campaign_name,spend,impressions,clicks,actions,cost_per_action_type",
      date_preset: "last_7d",
      limit: 500,
    },
  });

  const rows: CampaignInsight[] = [];
  let data = res.data;

  while (true) {
    for (const raw of data.data) {
      const parsed = RawInsightSchema.parse(raw);

      const cpaEntry = parsed.cost_per_action_type?.find(
        (a) => a.action_type === "offsite_conversion.fb_pixel_purchase"
      ) ??
        parsed.cost_per_action_type?.find(
          (a) => a.action_type === "purchase"
        ) ??
        parsed.cost_per_action_type?.find(
          (a) => a.action_type === "omni_purchase"
        );

      rows.push(
        CampaignInsightSchema.parse({
          campaign_id: parsed.campaign_id,
          campaign_name: parsed.campaign_name,
          spend: parseFloat(parsed.spend),
          impressions: parseInt(parsed.impressions, 10),
          clicks: parseInt(parsed.clicks, 10),
          cpa: cpaEntry ? parseFloat(cpaEntry.value) : 0,
        })
      );
    }

    const nextUrl = data.paging?.next;
    if (!nextUrl) break;
    data = (await axios.get(nextUrl)).data;
  }

  return rows;
}
