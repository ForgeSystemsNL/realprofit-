// ============================================
// STEP 2: GENERATION
// Takes extracted intelligence → produces creative assets.
// Only runs AFTER extraction is clean.
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, "../prompts/generate_system.txt"),
  "utf8"
);

/**
 * @param {object} callData  - original call metadata
 * @param {object} extracted - result from extract.js
 * @returns {Promise<CreativeResult>}
 */
export async function generate(callData, extracted) {
  const userMessage = buildGenerationPrompt(callData, extracted);

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].text;
  return parseJSON(raw, "generation");
}

function buildGenerationPrompt(callData, extracted) {
  return `
CALL: ${callData.title} (${callData.date})

EXTRACTED INTELLIGENCE:
${JSON.stringify(extracted, null, 2)}

Now generate the creative assets. Return ONLY valid JSON. No preamble, no markdown.
`.trim();
}

function parseJSON(raw, step) {
  try {
    const clean = raw.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    throw new Error(`[${step}] Failed to parse Claude JSON output: ${raw.slice(0, 200)}`);
  }
}
