#!/usr/bin/env node

/**
 * Content Pipeline Flow — n8n Deploy Script
 * Run via Claude Code: node deploy-content-pipeline.js
 *
 * Requirements:
 *   npm install axios dotenv
 *
 * Setup:
 *   Create .env file in same directory with:
 *   N8N_URL=http://localhost:5678
 *   N8N_API_KEY=your_api_key_here
 *   AI_PROVIDER=both          (openai | anthropic | both)
 *   OPENAI_CREDENTIAL_NAME=   (exact name as in n8n credentials)
 *   ANTHROPIC_CREDENTIAL_NAME=
 *   NOTION_CREDENTIAL_NAME=
 *   SLACK_CREDENTIAL_NAME=
 *   NOTION_DATABASE_ID=
 *   SLACK_CHANNEL=            (#content-pipeline)
 */

require('dotenv').config();
const axios = require('axios');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const CONFIG = {
  n8nUrl: process.env.N8N_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY,
  aiProvider: process.env.AI_PROVIDER || 'both',
  credentials: {
    openai: process.env.OPENAI_CREDENTIAL_NAME || 'OpenAI',
    anthropic: process.env.ANTHROPIC_CREDENTIAL_NAME || 'Anthropic',
    notion: process.env.NOTION_CREDENTIAL_NAME || 'Notion',
    slack: process.env.SLACK_CREDENTIAL_NAME || 'Slack',
  },
  notion: {
    databaseId: process.env.NOTION_DATABASE_ID || 'YOUR_DB_ID',
  },
  slack: {
    channel: process.env.SLACK_CHANNEL || '#content-pipeline',
  },
};

// ─── HTTP CLIENT ──────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: `${CONFIG.n8nUrl}/api/v1`,
  headers: {
    'X-N8N-API-KEY': CONFIG.apiKey,
    'Content-Type': 'application/json',
  },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function log(msg, type = 'info') {
  const icons = { info: '→', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${msg}`);
}

async function getCredentialId(name) {
  try {
    const res = await api.get('/credentials', { params: { name } });
    const match = res.data?.data?.find(c => c.name === name);
    if (!match) {
      log(`Credential "${name}" niet gevonden in n8n — check je .env`, 'warn');
      return null;
    }
    return match.id;
  } catch (e) {
    log(`Kon credentials niet ophalen: ${e.message}`, 'error');
    return null;
  }
}

async function checkN8nConnection() {
  try {
    await api.get('/workflows?limit=1');
    log(`Verbonden met n8n op ${CONFIG.n8nUrl}`, 'success');
    return true;
  } catch (e) {
    log(`Kan niet verbinden met n8n: ${e.message}`, 'error');
    log('Check: is n8n actief? Is je API key correct in .env?', 'warn');
    return false;
  }
}

// ─── WORKFLOW BUILDER ─────────────────────────────────────────────────────────

function buildWorkflow({ credIds }) {

  // Determine which AI model node to use based on provider
  const extractionNode = CONFIG.aiProvider === 'anthropic'
    ? buildAnthropicNode('ai-extraction', 'AI Extraction (Claude)', 960, 300, {
        model: 'claude-opus-4-5',
        temperature: 0.3,
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
        userPrompt: EXTRACTION_USER_PROMPT,
        credentialId: credIds.anthropic,
      })
    : buildOpenAINode('ai-extraction', 'AI Extraction (GPT-4o)', 960, 300, {
        model: 'gpt-4o',
        temperature: 0.3,
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
        userPrompt: EXTRACTION_USER_PROMPT,
        credentialId: credIds.openai,
      });

  const generationNode = CONFIG.aiProvider === 'openai'
    ? buildOpenAINode('ai-generation', 'AI Generation (GPT-4o)', 1440, 300, {
        model: 'gpt-4o',
        temperature: 0.7,
        systemPrompt: GENERATION_SYSTEM_PROMPT,
        userPrompt: GENERATION_USER_PROMPT,
        credentialId: credIds.openai,
      })
    : buildAnthropicNode('ai-generation', 'AI Generation (Claude)', 1440, 300, {
        model: 'claude-sonnet-4-6',
        temperature: 0.7,
        systemPrompt: GENERATION_SYSTEM_PROMPT,
        userPrompt: GENERATION_USER_PROMPT,
        credentialId: credIds.anthropic,
      });

  const nodes = [
    // 1. Webhook trigger
    {
      id: 'trigger-webhook',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [0, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'content-pipeline',
        responseMode: 'responseNode',
        options: {},
      },
    },

    // 2. Source router
    {
      id: 'router-source',
      name: 'Source Router',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
          conditions: [
            {
              leftValue: '={{ $json.source }}',
              rightValue: 'fireflies',
              operator: { type: 'string', operation: 'equals' },
            },
          ],
          combinator: 'and',
        },
      },
    },

    // 3. Fireflies fetch (true branch)
    {
      id: 'fetch-fireflies',
      name: 'Fetch Fireflies Transcript',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [480, 160],
      parameters: {
        url: 'https://api.fireflies.ai/graphql',
        method: 'POST',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'json',
        body: {
          query: '={{ `{ transcript(id: "${$json.transcriptId}") { title sentences { text speaker_name } } }` }}',
        },
        options: {},
      },
    },

    // 4. Cleanup transcript (Code node)
    {
      id: 'cleanup-transcript',
      name: 'Cleanup Transcript',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [720, 300],
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: CLEANUP_SCRIPT,
      },
    },

    // 5. AI Extraction
    extractionNode,

    // 6. Parse extraction JSON
    {
      id: 'parse-extraction',
      name: 'Parse Extraction JSON',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 300],
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: PARSE_EXTRACTION_SCRIPT,
      },
    },

    // 7. AI Generation
    generationNode,

    // 8. Build final output
    {
      id: 'build-output',
      name: 'Build Final Output',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1680, 300],
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: BUILD_OUTPUT_SCRIPT,
      },
    },

    // 9. Notion output
    {
      id: 'output-notion',
      name: 'Save to Notion',
      type: 'n8n-nodes-base.notion',
      typeVersion: 2,
      position: [1920, 160],
      credentials: credIds.notion ? { notionApi: { id: credIds.notion, name: CONFIG.credentials.notion } } : undefined,
      parameters: {
        resource: 'page',
        operation: 'create',
        databaseId: { __rl: true, value: CONFIG.notion.databaseId, mode: 'id' },
        title: '={{ $json.meta.company }} – Content Batch – {{ $json.meta.generatedAt.substring(0,10) }}',
        propertiesUi: {
          propertyValues: [
            { key: 'Status', type: 'select', selectValue: 'Ready for Review' },
          ],
        },
      },
    },

    // 10. Slack notification
    {
      id: 'output-slack',
      name: 'Notify Slack',
      type: 'n8n-nodes-base.slack',
      typeVersion: 2,
      position: [1920, 420],
      credentials: credIds.slack ? { slackApi: { id: credIds.slack, name: CONFIG.credentials.slack } } : undefined,
      parameters: {
        resource: 'message',
        operation: 'post',
        channel: CONFIG.slack.channel,
        text: SLACK_MESSAGE_TEMPLATE,
        options: {},
      },
    },

    // 11. Webhook response
    {
      id: 'webhook-response',
      name: 'Webhook Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1920, 600],
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json) }}',
        options: {},
      },
    },
  ];

  const connections = {
    'Webhook Trigger': { main: [[{ node: 'Source Router', type: 'main', index: 0 }]] },
    'Source Router': {
      main: [
        [{ node: 'Fetch Fireflies Transcript', type: 'main', index: 0 }],
        [{ node: 'Cleanup Transcript', type: 'main', index: 0 }],
      ],
    },
    'Fetch Fireflies Transcript': { main: [[{ node: 'Cleanup Transcript', type: 'main', index: 0 }]] },
    'Cleanup Transcript': { main: [[{ node: 'AI Extraction (Claude)', type: 'main', index: 0 }, { node: 'AI Extraction (GPT-4o)', type: 'main', index: 0 }].filter(n => nodes.find(x => x.name === n.node))] },
    [`AI Extraction (${CONFIG.aiProvider === 'anthropic' ? 'Claude' : 'GPT-4o'})`]: { main: [[{ node: 'Parse Extraction JSON', type: 'main', index: 0 }]] },
    'Parse Extraction JSON': { main: [[{ node: `AI Generation (${CONFIG.aiProvider === 'openai' ? 'GPT-4o' : 'Claude'})`, type: 'main', index: 0 }]] },
    [`AI Generation (${CONFIG.aiProvider === 'openai' ? 'GPT-4o' : 'Claude'})`]: { main: [[{ node: 'Build Final Output', type: 'main', index: 0 }]] },
    'Build Final Output': {
      main: [[
        { node: 'Save to Notion', type: 'main', index: 0 },
        { node: 'Notify Slack', type: 'main', index: 0 },
        { node: 'Webhook Response', type: 'main', index: 0 },
      ]],
    },
  };

  return {
    name: 'Content Pipeline Flow – Agency',
    nodes,
    connections,
    active: false,
    settings: { executionOrder: 'v1' },
    tags: ['agency', 'content', 'pipeline'],
  };
}

// ─── NODE BUILDERS ────────────────────────────────────────────────────────────

function buildOpenAINode(id, name, x, y, { model, temperature, systemPrompt, userPrompt, credentialId }) {
  return {
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.openAi',
    typeVersion: 1,
    position: [x, y],
    credentials: credentialId ? { openAiApi: { id: credentialId, name: CONFIG.credentials.openai } } : undefined,
    parameters: {
      model,
      options: { temperature },
      messages: {
        values: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    },
  };
}

function buildAnthropicNode(id, name, x, y, { model, temperature, systemPrompt, userPrompt, credentialId }) {
  return {
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.anthropic',
    typeVersion: 1,
    position: [x, y],
    credentials: credentialId ? { anthropicApi: { id: credentialId, name: CONFIG.credentials.anthropic } } : undefined,
    parameters: {
      model,
      options: { temperature },
      messages: {
        values: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
    },
  };
}

// ─── INLINE SCRIPTS & PROMPTS ─────────────────────────────────────────────────

const CLEANUP_SCRIPT = `
const items = $input.all();
const item = items[0];
let rawTranscript = '';
let metadata = {};

if (item.json.source === 'fireflies' && item.json.data?.transcript?.sentences) {
  const sentences = item.json.data.transcript.sentences;
  rawTranscript = sentences.map(s => s.speaker_name + ': ' + s.text).join('\\n');
  metadata.title = item.json.data.transcript.title;
} else if (item.json.transcript) {
  rawTranscript = item.json.transcript;
  metadata.title = item.json.title || 'Manual Input';
}

let cleaned = rawTranscript
  .replace(/\\b(um|uh|uhh|hmm|like|you know|basically|literally|actually|so|right|okay|yeah|yep|mmm)\\b/gi, '')
  .replace(/  +/g, ' ')
  .replace(/\\n{3,}/g, '\\n\\n')
  .replace(/\\[\\d{2}:\\d{2}(:\\d{2})?\\]/g, '')
  .split('\\n').map(line => line.trim()).filter(line => line.length > 0).join('\\n');

return [{
  json: {
    cleanedTranscript: cleaned,
    rawTranscript,
    metadata,
    companyName: item.json.companyName,
    targetAudience: item.json.targetAudience,
    toneOfVoice: item.json.toneOfVoice,
    platforms: item.json.platforms || ['linkedin', 'newsletter'],
    outputTypes: item.json.outputTypes || ['hooks', 'posts', 'scripts', 'newsletter', 'blog'],
  }
}];
`.trim();

const PARSE_EXTRACTION_SCRIPT = `
const items = $input.all();
const raw = items[0].json.message?.content || items[0].json.text || '';
let extraction = {};
try {
  extraction = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g, '').trim());
} catch(e) {
  extraction = { error: 'Parse failed', raw };
}
return [{
  json: {
    extraction,
    companyName: items[0].json.companyName,
    targetAudience: items[0].json.targetAudience,
    toneOfVoice: items[0].json.toneOfVoice,
    platforms: items[0].json.platforms,
    outputTypes: items[0].json.outputTypes,
    cleanedTranscript: items[0].json.cleanedTranscript,
  }
}];
`.trim();

const BUILD_OUTPUT_SCRIPT = `
const items = $input.all();
const raw = items[0].json.message?.content || items[0].json.text || '';
let generation = {};
try {
  generation = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g, '').trim());
} catch(e) {
  generation = { error: 'Parse failed', raw };
}
const extraction = items[0].json.extraction;
const finalOutput = {
  meta: {
    company: items[0].json.companyName,
    audience: items[0].json.targetAudience,
    platforms: items[0].json.platforms,
    generatedAt: new Date().toISOString(),
  },
  extraction,
  generation,
  preview: {
    topHooks: generation.hooks?.slice(0, 3).map(h => h.hook) || [],
    topPainPoints: extraction.painPoints?.slice(0, 3).map(p => p.pain) || [],
    contentAngles: extraction.contentAngles?.slice(0, 3).map(a => a.angle) || [],
    vocabularyToSteal: extraction.vocabularyToSteal?.slice(0, 10) || [],
  },
};
return [{ json: finalOutput }];
`.trim();

const EXTRACTION_SYSTEM_PROMPT = `You are an expert content strategist and VOC analyst. Extract raw intelligence from transcripts. Respond in valid JSON only. No markdown. No explanation outside JSON.`;

const EXTRACTION_USER_PROMPT = `## EXTRACTION TASK

Company: {{ $json.companyName }}
Audience: {{ $json.targetAudience }}
Tone: {{ $json.toneOfVoice }}

Transcript:
{{ $json.cleanedTranscript }}

Return JSON with: targetAudience, painPoints, objections, desiredOutcomes, beliefs, oneLiners, quotes, stories, hooks, contentAngles, keyInsights, vocabularyToSteal.

Rules: use exact transcript language, no generic marketing language, empty array if not present.`;

const GENERATION_SYSTEM_PROMPT = `You are a conversion copywriter. Write content that sounds like it came from the person in the transcript. Use their vocabulary. No fluff. Respond in valid JSON only.`;

const GENERATION_USER_PROMPT = `## GENERATION TASK

Company: {{ $json.companyName }}
Audience: {{ $json.targetAudience }}
Tone: {{ $json.toneOfVoice }}
Platforms: {{ $json.platforms }}

Extraction:
{{ JSON.stringify($json.extraction) }}

Return JSON with:
- hooks (15 items): hook, angle, platform, type
- socialPosts (5 items): platform, hook, body, cta, angle
- shortScripts (3 items): title, hook, script, platform, durationSec
- newsletterIntro: subjectLine, previewText, intro, angle
- blogOutline: title, metaDescription, sections[], cta

Rules: 15 hooks exactly, 5 posts (2 LinkedIn/2 Instagram/1 Twitter), 3 scripts. Use vocabularyToSteal. No generic marketing language.`;

const SLACK_MESSAGE_TEMPLATE = `*Content Batch Ready* ✅

*Company:* {{ $json.meta.company }}
*Audience:* {{ $json.meta.audience }}

*Top Hooks:*
{{ $json.preview.topHooks.map((h, i) => (i+1) + '. ' + h).join('\\n') }}

*Key Pain Points:*
{{ $json.preview.topPainPoints.map(p => '• ' + p).join('\\n') }}

*Vocabulary to Steal:*
{{ $json.preview.vocabularyToSteal.join(', ') }}

→ Full output in Notion`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Content Pipeline Deploy Script\n');

  // 1. Validate config
  if (!CONFIG.apiKey) {
    log('N8N_API_KEY ontbreekt in .env — stop.', 'error');
    process.exit(1);
  }

  // 2. Check connection
  const connected = await checkN8nConnection();
  if (!connected) process.exit(1);

  // 3. Resolve credential IDs
  log('Credentials ophalen uit n8n...', 'info');
  const credIds = {
    openai: CONFIG.aiProvider !== 'anthropic' ? await getCredentialId(CONFIG.credentials.openai) : null,
    anthropic: CONFIG.aiProvider !== 'openai' ? await getCredentialId(CONFIG.credentials.anthropic) : null,
    notion: await getCredentialId(CONFIG.credentials.notion),
    slack: await getCredentialId(CONFIG.credentials.slack),
  };

  log(`OpenAI credential: ${credIds.openai || 'niet gevonden'}`, credIds.openai ? 'success' : 'warn');
  log(`Anthropic credential: ${credIds.anthropic || 'niet gevonden'}`, credIds.anthropic ? 'success' : 'warn');
  log(`Notion credential: ${credIds.notion || 'niet gevonden'}`, credIds.notion ? 'success' : 'warn');
  log(`Slack credential: ${credIds.slack || 'niet gevonden'}`, credIds.slack ? 'success' : 'warn');

  // 4. Build workflow
  log('Workflow bouwen...', 'info');
  const workflow = buildWorkflow({ credIds });

  // 5. Check if workflow already exists
  const existing = await api.get('/workflows', { params: { name: workflow.name } }).catch(() => null);
  const existingWorkflow = existing?.data?.data?.find(w => w.name === workflow.name);

  let result;
  if (existingWorkflow) {
    log(`Workflow bestaat al (ID: ${existingWorkflow.id}) — updaten...`, 'warn');
    result = await api.put(`/workflows/${existingWorkflow.id}`, workflow);
  } else {
    log('Nieuwe workflow aanmaken...', 'info');
    result = await api.post('/workflows', workflow);
  }

  const workflowId = result.data?.id;
  log(`Workflow aangemaakt — ID: ${workflowId}`, 'success');

  // 6. Activate
  await api.patch(`/workflows/${workflowId}`, { active: true });
  log('Workflow geactiveerd', 'success');

  // 7. Summary
  console.log('\n─────────────────────────────────────');
  console.log('✅ Deploy compleet\n');
  console.log(`Webhook URL:`);
  console.log(`  ${CONFIG.n8nUrl}/webhook/content-pipeline\n`);
  console.log('Test payload:');
  console.log(JSON.stringify({
    source: 'manual',
    transcript: 'Plak hier je transcript...',
    companyName: 'ForgeSystems',
    targetAudience: 'HVAC installateurs Nederland',
    toneOfVoice: 'direct, no-nonsense, vakman-to-vakman',
    platforms: ['linkedin', 'instagram', 'newsletter'],
  }, null, 2));
  console.log('\n─────────────────────────────────────\n');
}

main().catch(e => {
  log(`Onverwachte fout: ${e.message}`, 'error');
  console.error(e);
  process.exit(1);
});
