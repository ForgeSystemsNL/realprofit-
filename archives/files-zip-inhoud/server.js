// ============================================
// FATHOM → CLAUDE → SLACK + NOTION PIPELINE
// Creative Engine v1 for Tristan (CMO)
// ============================================

import express from "express";
import { extract } from "./steps/extract.js";
import { generate } from "./steps/generate.js";
import { postToSlack } from "./outputs/slack.js";
import { saveToNotion } from "./outputs/notion.js";
import { validateWebhook } from "./utils/validate.js";
import { logger } from "./utils/logger.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok" }));

// ── Main webhook endpoint ─────────────────────────────────────
app.post("/webhook/fathom", async (req, res) => {
  const callId = req.body?.call_id || `call_${Date.now()}`;

  try {
    logger.info(`[${callId}] Webhook received`);

    // 1. Validate incoming payload
    const callData = validateWebhook(req.body);
    logger.info(`[${callId}] Payload valid — transcript length: ${callData.transcript.length} chars`);

    // Respond immediately so Fathom doesn't timeout
    res.json({ status: "processing", call_id: callId });

    // 2. STEP 1 — Extract market intelligence from transcript
    logger.info(`[${callId}] Starting extraction...`);
    const extracted = await extract(callData);
    logger.info(`[${callId}] Extraction complete`);

    // 3. STEP 2 — Generate creative assets from extracted intelligence
    logger.info(`[${callId}] Starting generation...`);
    const creative = await generate(callData, extracted);
    logger.info(`[${callId}] Generation complete`);

    // 4. Output — Slack (speed) + Notion (archive)
    await Promise.allSettled([
      postToSlack(callData, extracted, creative),
      saveToNotion(callData, extracted, creative),
    ]);

    logger.info(`[${callId}] Pipeline complete ✓`);
  } catch (err) {
    logger.error(`[${callId}] Pipeline failed: ${err.message}`);
    // res already sent, just log
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Creative Engine listening on :${PORT}`);
});
