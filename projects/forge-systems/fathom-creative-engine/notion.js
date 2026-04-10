// ============================================
// NOTION OUTPUT
// Creates a structured page per call.
// All assets stored as blocks for easy reuse.
// ============================================

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28"; // Pinned — breaking changes in March 2026 release

/**
 * @param {object} callData
 * @param {object} extracted
 * @param {object} creative
 */
export async function saveToNotion(callData, extracted, creative) {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.warn("[Notion] Token or DB ID not set — skipping");
    return;
  }

  const page = buildNotionPage(callData, extracted, creative);

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify(page),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Notion] Page creation failed: ${res.status} ${err}`);
  }
}

function buildNotionPage(callData, extracted, creative) {
  return {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: callData.title || "Untitled Call" } }],
      },
      Date: {
        date: { start: callData.date || new Date().toISOString().split("T")[0] },
      },
      Product: {
        rich_text: [{ text: { content: extracted.product || "" } }],
      },
      Persona: {
        rich_text: [{ text: { content: extracted.persona || "" } }],
      },
      "Call Type": {
        select: { name: extracted.call_type || "other" },
      },
      "Funnel Stage": {
        select: { name: extracted.funnel_stage || "awareness" },
      },
      "Quality Score": {
        number: extracted.quality_score || 0,
      },
    },
    children: [
      heading("📊 Call Summary"),
      paragraph(`*Attendees:* ${callData.attendees?.join(", ") || "—"}`),
      paragraph(callData.fathom_summary || "_No summary available_"),

      heading("🎯 Extracted Intelligence"),
      subheading("Pain Points"),
      ...bullets(extracted.pain_points),
      subheading("Desires"),
      ...bullets(extracted.desires),
      subheading("Objections"),
      ...bullets(extracted.objections),
      subheading("Proof Points"),
      ...bullets(extracted.proof_points),
      subheading("Notable Quotes"),
      ...bullets(extracted.notable_quotes),

      heading("🔥 Hooks (10)"),
      ...hookBlocks(creative.hooks),

      heading("📹 Script Angles"),
      ...scriptBlocks(creative.script_angles),

      heading("🚀 Campaign Concepts"),
      ...campaignBlocks(creative.campaign_concepts),

      heading("✉️ Email Angles"),
      ...emailBlocks(creative.email_angles),

      heading("⚡ Best Next Asset"),
      paragraph(
        creative.best_next_asset
          ? `**${creative.best_next_asset.type}** — ${creative.best_next_asset.reason}`
          : "_None recommended_"
      ),
    ],
  };
}

// ── Block helpers ─────────────────────────────────────────────

function heading(text) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ text: { content: text } }] },
  };
}

function subheading(text) {
  return {
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ text: { content: text } }] },
  };
}

function paragraph(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ text: { content: text } }] },
  };
}

function bullets(items = []) {
  if (!items.length) return [paragraph("—")];
  return items.map((item) => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: [{ text: { content: String(item) } }] },
  }));
}

function hookBlocks(hooks = []) {
  return hooks.map((h, i) => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          text: {
            content: `[${h.type} · ${h.platform}] ${h.text}`,
          },
        },
      ],
    },
  }));
}

function scriptBlocks(angles = []) {
  return angles.flatMap((a) => [
    subheading(a.title || "Untitled Angle"),
    paragraph(`Open: ${a.open}`),
    paragraph(`Conflict: ${a.conflict}`),
    paragraph(`Resolution: ${a.resolution}`),
    paragraph(`CTA: ${a.cta_direction}`),
  ]);
}

function campaignBlocks(campaigns = []) {
  return campaigns.flatMap((c) => [
    subheading(c.name || "Untitled Campaign"),
    paragraph(`Angle: ${c.angle}`),
    paragraph(`Target emotion: ${c.target_emotion}`),
    paragraph(`Format: ${c.format_recommendation}`),
    paragraph(`Why it works: ${c.why_it_works}`),
  ]);
}

function emailBlocks(emails = []) {
  return emails.map((e) => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ text: { content: `Subject: "${e.subject}" — ${e.angle}` } }],
    },
  }));
}
