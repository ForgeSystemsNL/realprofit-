# Content Pipeline Deploy Script

## Setup (1x)

```bash
# 1. Dependencies
npm install axios dotenv

# 2. Environment
cp .env.example .env
# Vul .env in (zie stappen hieronder)

# 3. Deploy
node deploy-content-pipeline.js
```

## .env invullen

**N8N_API_KEY**
→ n8n → Settings → API → Create API Key

**Credential namen**
→ n8n → Settings → Credentials
→ Kopieer exact de naam zoals die daar staat

**NOTION_DATABASE_ID**
→ Open je Notion database in browser
→ URL ziet eruit als: notion.so/abc123?v=...
→ Die abc123 is je database ID

## Na deploy

Webhook URL:
```
POST http://localhost:5678/webhook/content-pipeline
```

Test payload:
```json
{
  "source": "manual",
  "transcript": "Hier je transcript...",
  "companyName": "ForgeSystems",
  "targetAudience": "HVAC installateurs Nederland",
  "toneOfVoice": "direct, no-nonsense",
  "platforms": ["linkedin", "instagram", "newsletter"]
}
```

Fireflies payload:
```json
{
  "source": "fireflies",
  "transcriptId": "fireflies_transcript_id",
  "companyName": "ForgeSystems",
  "targetAudience": "HVAC installateurs Nederland",
  "toneOfVoice": "direct, no-nonsense",
  "platforms": ["linkedin", "instagram"]
}
```

## Errors

| Error | Fix |
|-------|-----|
| Cannot connect to n8n | Check of n8n draait op localhost:5678 |
| API key invalid | Nieuwe key aanmaken in n8n Settings |
| Credential niet gevonden | Naam exact kopiëren uit n8n Credentials |
| Workflow exists | Script update automatisch — geen actie nodig |
