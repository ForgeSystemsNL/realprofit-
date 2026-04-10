// ============================================
// STEP 1: EXTRACTION
// Pull market intelligence out of the transcript.
// No creative generation here — just signal.
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, "../prompts/extract_system.txt"),
  "utf8"
);

/**
 * @param {object} callData - validated Fathom payload
 * @returns {Promise<ExtractionResult>}
 */
export async function extract(callData) {
  const userMessage = buildExtractionPrompt(callData);

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].text;
  return parseJSON(raw, "extraction");
}

function buildExtractionPrompt({ title, transcript, attendees, date, fathom_summary }) {
  return `
CALL METADATA:
- Title: ${title}
- Date: ${date}
- Attendees: ${attendees?.join(", ") || "unknown"}
- Fathom Summary: ${fathom_summary || "none"}

TRANSCRIPT:
${transcript}

Extract the market intelligence from this call. Return ONLY valid JSON. No preamble, no markdown.
`.trim();
}

function parseJSON(raw, step) {
  try {
    // Strip potential markdown fences
    const clean = raw.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error(`[${step}] Failed to parse Claude JSON output: ${raw.slice(0, 200)}`);
  }
}
