// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Automation {
  id: string;
  name: string;
  category: string;
  status: string;
  lastRun: string;
  runsToday: number;
  successRate: number;
  trigger: string;
}

const AUTOMATIONS: Automation[] = [
  { id: "a1", name: "Shopify → Notion sync", category: "Data", status: "Active", lastRun: "2026-03-19 06:00", runsToday: 1, successRate: 100, trigger: "Dagelijks 06:00" },
  { id: "a2", name: "Meta campagne sync", category: "Marketing", status: "Active", lastRun: "2026-03-19 06:02", runsToday: 1, successRate: 98, trigger: "Dagelijks 06:00" },
  { id: "a3", name: "At-risk klant tagger", category: "Retention", status: "Active", lastRun: "2026-03-19 06:05", runsToday: 1, successRate: 100, trigger: "Dagelijks 06:00" },
  { id: "a4", name: "Speed-to-lead WhatsApp", category: "Sales", status: "Active", lastRun: "2026-03-19 11:42", runsToday: 3, successRate: 100, trigger: "Bij nieuwe lead" },
  { id: "a5", name: "Subscription churn alert", category: "Retention", status: "Active", lastRun: "2026-03-18 14:20", runsToday: 0, successRate: 100, trigger: "Bij opzegging" },
  { id: "a6", name: "Weekly KPI rapport", category: "Reporting", status: "Active", lastRun: "2026-03-17 08:00", runsToday: 0, successRate: 100, trigger: "Maandag 08:00" },
  { id: "a7", name: "Win-back email sequence", category: "Retention", status: "Paused", lastRun: "2026-03-10 09:00", runsToday: 0, successRate: 87, trigger: "Bij at-risk tag" },
  { id: "a8", name: "Google Sheets P&L sync", category: "Finance", status: "Draft", lastRun: "Nog niet gerund", runsToday: 0, successRate: 0, trigger: "Wekelijks maandag" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Data: "text-[#1A4B6B] bg-[#E8EFF5]",
  Marketing: "text-[#6B1A6B] bg-[#F5E8F5]",
  Retention: "text-[#1A4B6B] bg-[#E8EFF5]",
  Sales: "text-[#1A6B3C] bg-[#E8F5EE]",
  Reporting: "text-[#8B6020] bg-[#FEF3E2]",
  Finance: "text-[#8B6020] bg-[#FEF3E2]",
};

const BORDER_COLORS: Record<string, string> = {
  Active: "border-l-[#1A6B3C]/50",
  Paused: "border-l-[#8B6020]/50",
  Draft: "border-l-[#E8E6E1]",
};

const STATUS_BADGE: Record<string, string> = {
  Active: "text-[#1A6B3C] bg-[#E8F5EE]",
  Paused: "text-[#8B6020] bg-[#FEF3E2]",
  Draft: "text-[#8C8A84] bg-[#F5F5F0]",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AutomationsPage() {
  const active = AUTOMATIONS.filter((a) => a.status === "Active").length;
  const paused = AUTOMATIONS.filter((a) => a.status === "Paused").length;
  const draft = AUTOMATIONS.filter((a) => a.status === "Draft").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Automations</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-[#1A6B3C]">{active} Active</span>
          <span className="text-[#8B6020]">{paused} Paused</span>
          <span className="text-[#8C8A84]">{draft} Draft</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {AUTOMATIONS.map((a) => (
          <AutomationCard key={a.id} automation={a} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function AutomationCard({ automation: a }: { automation: Automation }) {
  return (
    <div
      className={`rounded-lg border border-[#E8E6E1] border-l-[3px] ${BORDER_COLORS[a.status] ?? "border-l-[#E8E6E1]"} bg-white p-5 flex flex-col gap-3`}
    >
      {/* Top: name + category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[#1A1A18]">{a.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[a.category] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
            {a.category}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_BADGE[a.status] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
          {a.status}
        </span>
      </div>

      {/* Last run */}
      <p className="text-sm text-[#8C8A84]">
        Laatste run: <span className="text-[#1A1A18]/70">{a.lastRun}</span>
      </p>

      {/* Metrics */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-[#8C8A84]">Runs vandaag: </span>
          <span className="font-medium text-[#1A1A18]">{a.runsToday}</span>
        </div>
        <div>
          <span className="text-[#8C8A84]">Success rate: </span>
          <span className={`font-medium ${a.successRate >= 95 ? "text-[#1A6B3C]" : a.successRate >= 80 ? "text-[#8B6020]" : "text-[#8B2020]"}`}>
            {a.successRate > 0 ? `${a.successRate}%` : "—"}
          </span>
        </div>
      </div>

      {/* Trigger */}
      <div className="pt-2 border-t border-[#E8E6E1]">
        <span className="text-xs text-[#8C8A84]">Trigger: {a.trigger}</span>
      </div>
    </div>
  );
}
