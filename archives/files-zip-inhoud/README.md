# Fathom Creative Engine

**Fathom call ends → transcript in → Claude extracts → Claude generates → Slack + Notion out**

---

## Stack

- Node.js 18+ (ESM)
- Express (webhook server)
- Anthropic SDK (Claude Opus 4)
- Slack Incoming Webhooks
- Notion API v2022-06-28

---

## Setup

### 1. Install

```bash
npm install
cp .env.example .env
# Fill in your keys
```

### 2. Notion Database

Create a Notion database with these properties:

| Property | Type |
|---|---|
| Name | Title |
| Date | Date |
| Product | Text |
| Persona | Text |
| Call Type | Select (sales, strategy, creative, podcast, coaching, other) |
| Funnel Stage | Select (awareness, consideration, decision, retention) |
| Quality Score | Number |

Share the database with your Notion integration.

### 3. Slack

1. Create a Slack app at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add to your `#creative` channel
4. Copy webhook URL to `.env`

### 4. Fathom Webhook

In Fathom settings → Integrations → Webhooks:
- URL: `https://your-domain.com/webhook/fathom`
- Event: `call.completed`

---

## Run

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

---

## Pipeline Flow

```
Fathom webhook
    ↓
validate payload
    ↓
STEP 1: Claude extraction
  → call_type, product, persona
  → pain_points, desires, objections
  → proof_points, mechanisms, notable_quotes
    ↓
STEP 2: Claude generation
  → 10 hooks (typed + platform-tagged)
  → 3 script angles
  → 2 campaign concepts
  → 3 email angles
  → 1 best_next_asset recommendation
    ↓
OUTPUT (parallel)
  → Slack: summary + top 5 hooks + top angle + next asset
  → Notion: full structured page in database
```

---

## Testing

Send a test payload to `/webhook/fathom`:

```bash
curl -X POST http://localhost:3000/webhook/fathom \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test_001",
    "title": "Sales call - coaching product",
    "date": "2026-03-18",
    "attendees": ["Tristan", "Prospect"],
    "summary": "Discussed online coaching offer and objections around price and time",
    "transcript": "Tristan: So tell me what the main thing stopping you is... [paste full transcript here]"
  }'
```

---

## Deployment

Deploy to Railway, Render, or any Node host.
Make sure env vars are set and the port is exposed.

For Fathom to hit your webhook, the server needs a public HTTPS URL.
Use ngrok locally for testing: `ngrok http 3000`
