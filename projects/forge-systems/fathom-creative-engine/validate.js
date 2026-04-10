// ============================================
// WEBHOOK VALIDATOR
// Normalizes Fathom payload into clean callData.
// Throws if required fields are missing.
// ============================================

export function validateWebhook(body) {
  // Fathom sends different payload shapes depending on version.
  // We normalize here so the rest of the pipeline is clean.

  const transcript =
    body?.transcript ||
    body?.data?.transcript ||
    body?.call?.transcript;

  if (!transcript || transcript.trim().length < 50) {
    throw new Error("Payload missing or too-short transcript");
  }

  return {
    call_id: body?.call_id || body?.id || `call_${Date.now()}`,
    title:
      body?.title ||
      body?.call?.title ||
      body?.meeting_name ||
      "Untitled Call",
    date:
      body?.date ||
      body?.call?.date ||
      body?.started_at?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
    attendees:
      body?.attendees ||
      body?.call?.attendees ||
      body?.participants ||
      [],
    fathom_summary:
      body?.summary ||
      body?.call?.summary ||
      body?.ai_summary ||
      null,
    transcript,
    source_url:
      body?.url ||
      body?.call?.url ||
      body?.recording_url ||
      null,
  };
}
