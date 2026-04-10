import { NextResponse } from "next/server";
import { getCampaignInsights } from "@/lib/meta";
import { getCampaigns, updateCampaign } from "@/lib/notion";

export async function GET() {
  const errors: string[] = [];
  let updated = 0;

  try {
    const [insights, campaigns] = await Promise.all([
      getCampaignInsights(),
      getCampaigns(),
    ]);

    const campaignMap = new Map(campaigns.map((c) => [c.name, c]));

    for (const insight of insights) {
      const match = campaignMap.get(insight.campaign_name);
      if (!match) {
        errors.push(`No Notion match for "${insight.campaign_name}"`);
        continue;
      }

      const roas =
        insight.cpa > 0 && match.budget > 0
          ? match.budget / (insight.cpa * (insight.spend / match.budget))
          : 0;

      try {
        await updateCampaign(match.id, {
          spend: insight.spend,
          roas,
          cpa: insight.cpa,
          status: insight.spend > 0 ? "Active" : "Paused",
        });
        updated++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`Failed to update "${insight.campaign_name}": ${msg}`);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { updated: 0, errors: [msg] },
      { status: 500 }
    );
  }

  return NextResponse.json({ updated, errors });
}
