// ============================================
// SLACK OUTPUT
// Posts a compact, scannable summary to Slack.
// 1 message, structured blocks — not spam.
// ============================================

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * @param {object} callData
 * @param {object} extracted
 * @param {object} creative
 */
export async function postToSlack(callData, extracted, creative) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("[Slack] SLACK_WEBHOOK_URL not set — skipping");
    return;
  }

  const message = buildSlackMessage(callData, extracted, creative);

  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`[Slack] Post failed: ${res.status} ${await res.text()}`);
  }
}

function buildSlackMessage(callData, extracted, creative) {
  const top5Hooks = (creative.hooks || []).slice(0, 5);
  const topAngle = creative.script_angles?.[0];
  const nextAsset = creative.best_next_asset;

  const hooksText = top5Hooks
    .map((h, i) => `${i + 1}. [${h.type}] ${h.text}`)
    .join("\n");

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🎯 New Creative Drop — ${callData.title}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Product:* ${extracted.product || "—"}` },
          { type: "mrkdwn", text: `*Persona:* ${extracted.persona || "—"}` },
          { type: "mrkdwn", text: `*Call type:* ${extracted.call_type || "—"}` },
          { type: "mrkdwn", text: `*Quality score:* ${extracted.quality_score || "—"}/10` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🔥 Top 5 Hooks:*\n${hooksText || "_none generated_"}`,
        },
      },
      { type: "divider" },
      ...(topAngle
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*📹 Top Script Angle: ${topAngle.title}*\n>${topAngle.open}`,
              },
            },
            { type: "divider" },
          ]
        : []),
      ...(nextAsset
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*⚡ Best Next Asset: ${nextAsset.type}*\n${nextAsset.reason}`,
              },
            },
          ]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📅 ${callData.date} · Full breakdown in Notion`,
          },
        ],
      },
    ],
  };
}
