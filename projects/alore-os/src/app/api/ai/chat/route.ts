import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are RealProfit AI, an ecommerce profit analyst for a Shopify brand.
You have access to this store's data:
- This week: Revenue €8,420 | Ad Spend €2,840 | True Profit €1,997 | MER 2.96x | CPA €60 | Orders 47
- Top campaign: Collageen Serum UGC v3 — ROAS 3.8, CPA €23
- Worst campaign: Bundle deal UGC v1 — ROAS 0.7, dead
- Customers at risk: 2 (last order >45 days)
- Monthly fixed costs: €2,151 | Variable costs: €478
- True profit margin: 23.7%
- 12 campaigns total: 3 winners, 3 active, 4 testing, 2 dead
- Best channel: Email (ROAS 7.4x and 5.7x)
- Stores: RealProfit NL (37.7% margin), RealProfit UK (26.3%), RealProfit US (22.1%), SupplementCo NL (21.9%)
Always answer in Dutch. Be direct, sharp, and commercial.
Give specific actionable recommendations based on the data.
Never give vague advice. Always reference actual numbers.
Keep answers concise — max 3-4 paragraphs.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = await req.json();

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
