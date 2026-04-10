// ---------------------------------------------------------------------------
// CAC & LTV — /dashboard/cac
// ---------------------------------------------------------------------------

const HERO_METRICS = [
  { label: "Blended CAC", value: "€60", delta: "+8% vs vorige week", negative: true },
  { label: "LTV (12m)", value: "€142", delta: "+5% vs vorige maand", negative: false },
  { label: "LTV:CAC ratio", value: "2.4x", delta: "Doel: >3.0x", negative: true },
  { label: "Payback periode", value: "47 dagen", delta: "Doel: <30 dagen", negative: true },
];

const CHANNELS = [
  { channel: "Meta Ads", cac: 58, ltv: 138, ratio: 2.38, payback: 45, spend: 2100 },
  { channel: "Google Ads", cac: 72, ltv: 155, ratio: 2.15, payback: 52, spend: 480 },
  { channel: "E-mail", cac: 8, ltv: 165, ratio: 20.6, payback: 3, spend: 120 },
  { channel: "Organic", cac: 0, ltv: 128, ratio: 0, payback: 0, spend: 0 },
  { channel: "Referral", cac: 12, ltv: 172, ratio: 14.3, payback: 5, spend: 140 },
];

const COHORTS = [
  { month: "Aug 2023", customers: 42, m0: 64, m1: 18, m2: 12, m3: 8, m6: 22, m12: 15 },
  { month: "Sep 2023", customers: 56, m0: 68, m1: 22, m2: 14, m3: 10, m6: 18, m12: 12 },
  { month: "Okt 2023", customers: 48, m0: 62, m1: 16, m2: 10, m3: 12, m6: 20, m12: null },
  { month: "Nov 2023", customers: 71, m0: 72, m1: 28, m2: 18, m3: 14, m6: null, m12: null },
  { month: "Dec 2023", customers: 89, m0: 85, m1: 32, m2: 20, m3: null, m6: null, m12: null },
  { month: "Jan 2024", customers: 47, m0: 64, m1: 18, m2: null, m3: null, m6: null, m12: null },
];

// Payback visualizer data
const PAYBACK_MONTHS = [
  { month: 0, revenue: 64, cumCost: 60 },
  { month: 1, revenue: 82, cumCost: 60 },
  { month: 2, revenue: 94, cumCost: 60 },
  { month: 3, revenue: 104, cumCost: 60 },
  { month: 6, revenue: 126, cumCost: 60 },
  { month: 12, revenue: 142, cumCost: 60 },
];

function cohortCellColor(value: number | null): string {
  if (value === null) return "text-[#8C8A84]";
  if (value >= 60) return "text-[#1A6B3C] bg-[#1A6B3C]/5";
  if (value >= 30) return "text-[#8B6020] bg-[#8B6020]/5";
  if (value >= 15) return "text-[#1A1A18]";
  return "text-[#8C8A84]";
}

export default function CacPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">CAC & LTV</h1>
        <p className="text-sm text-[#8C8A84] mt-1">
          Acquisitiekosten, lifetime value en payback analyse
        </p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {HERO_METRICS.map((m) => (
          <div key={m.label} className="bg-white border border-[#E8E6E1] rounded-xl p-5">
            <p className="text-[11px] text-[#8C8A84] uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-2xl font-semibold tabular-nums text-[#1A1A18]">{m.value}</p>
            <p className={`text-xs mt-1 ${m.negative ? "text-[#8B2020]" : "text-[#1A6B3C]"}`}>
              {m.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Payback visualizer */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mb-8">
        <h2 className="text-sm font-medium text-[#1A1A18] mb-4">
          Payback visualisatie — cumulatieve revenue vs. CAC
        </h2>
        <div className="h-[200px] relative">
          <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 45, 90, 135, 180].map((y) => (
              <line key={y} x1="40" y1={y} x2="580" y2={y} stroke="#E8E6E1" strokeWidth="0.5" />
            ))}

            {/* Y-axis labels */}
            <text x="35" y="180" textAnchor="end" className="fill-[#8C8A84] text-[10px]">€0</text>
            <text x="35" y="135" textAnchor="end" className="fill-[#8C8A84] text-[10px]">€50</text>
            <text x="35" y="90" textAnchor="end" className="fill-[#8C8A84] text-[10px]">€100</text>
            <text x="35" y="45" textAnchor="end" className="fill-[#8C8A84] text-[10px]">€150</text>

            {/* CAC line (horizontal) */}
            <line
              x1="40"
              y1={180 - (60 / 150) * 180}
              x2="580"
              y2={180 - (60 / 150) * 180}
              stroke="#8B2020"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x="585"
              y={180 - (60 / 150) * 180 + 4}
              className="fill-[#8B2020] text-[10px]"
            >
              CAC €60
            </text>

            {/* Revenue curve */}
            <polyline
              points={PAYBACK_MONTHS.map((p, i) => {
                const x = 40 + (i / (PAYBACK_MONTHS.length - 1)) * 540;
                const y = 180 - (p.revenue / 150) * 180;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke="#1A6B3C"
              strokeWidth="2"
            />

            {/* Data points */}
            {PAYBACK_MONTHS.map((p, i) => {
              const x = 40 + (i / (PAYBACK_MONTHS.length - 1)) * 540;
              const y = 180 - (p.revenue / 150) * 180;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="#1A6B3C" />
                  <text x={x} y={y - 10} textAnchor="middle" className="fill-[#1A1A18] text-[10px] font-medium">
                    €{p.revenue}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {PAYBACK_MONTHS.map((p, i) => {
              const x = 40 + (i / (PAYBACK_MONTHS.length - 1)) * 540;
              return (
                <text key={i} x={x} y="198" textAnchor="middle" className="fill-[#8C8A84] text-[10px]">
                  M{p.month}
                </text>
              );
            })}

            {/* Breakeven indicator */}
            {(() => {
              // Breakeven is between M0 (€64) and M1 (€82), but CAC is €60, so it's roughly at month ~0
              const breakX = 40 + (0 / (PAYBACK_MONTHS.length - 1)) * 540 + 20;
              const breakY = 180 - (60 / 150) * 180;
              return (
                <g>
                  <line x1={breakX} y1={breakY - 15} x2={breakX} y2={breakY + 15} stroke="#1A6B3C" strokeWidth="1" strokeDasharray="3 2" />
                  <text x={breakX} y={breakY - 20} textAnchor="middle" className="fill-[#1A6B3C] text-[9px] font-medium">
                    Breakeven
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Channel breakdown */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-[#E8E6E1]">
          <h2 className="text-sm font-medium text-[#1A1A18]">CAC per kanaal</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-left">
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider">Kanaal</th>
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">CAC</th>
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">LTV</th>
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">LTV:CAC</th>
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">Payback</th>
              <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">Spend</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((c) => (
              <tr key={c.channel} className="border-b border-[#E8E6E1] last:border-0">
                <td className="px-5 py-3 text-sm text-[#1A1A18]">{c.channel}</td>
                <td className="px-5 py-3 text-sm tabular-nums text-right text-[#1A1A18]">
                  {c.cac > 0 ? `€${c.cac}` : "—"}
                </td>
                <td className="px-5 py-3 text-sm tabular-nums text-right text-[#1A1A18]">€{c.ltv}</td>
                <td className={`px-5 py-3 text-sm font-semibold tabular-nums text-right ${
                  c.ratio >= 3 ? "text-[#1A6B3C]" : c.ratio >= 2 ? "text-[#8B6020]" : c.ratio > 0 ? "text-[#8B2020]" : "text-[#8C8A84]"
                }`}>
                  {c.ratio > 0 ? `${c.ratio}x` : "∞"}
                </td>
                <td className="px-5 py-3 text-sm tabular-nums text-right text-[#1A1A18]">
                  {c.payback > 0 ? `${c.payback}d` : "—"}
                </td>
                <td className="px-5 py-3 text-sm tabular-nums text-right text-[#8C8A84]">
                  {c.spend > 0 ? `€${c.spend.toLocaleString("nl-NL")}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cohort revenue table */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-[#E8E6E1]">
          <h2 className="text-sm font-medium text-[#1A1A18]">Cohort revenue (€ per klant)</h2>
          <p className="text-xs text-[#8C8A84] mt-0.5">Gemiddelde omzet per klant per maand na acquisitie</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left">
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider">Cohort</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">Klanten</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M0</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M1</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M2</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M3</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M6</th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">M12</th>
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c) => (
                <tr key={c.month} className="border-b border-[#E8E6E1] last:border-0">
                  <td className="px-5 py-3 text-sm text-[#1A1A18]">{c.month}</td>
                  <td className="px-5 py-3 text-sm tabular-nums text-right text-[#8C8A84]">{c.customers}</td>
                  {[c.m0, c.m1, c.m2, c.m3, c.m6, c.m12].map((val, i) => (
                    <td key={i} className={`px-5 py-3 text-sm tabular-nums text-right rounded ${cohortCellColor(val)}`}>
                      {val !== null ? `€${val}` : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight card */}
      <div className="bg-[#1A4B6B]/5 border border-[#1A4B6B]/20 rounded-xl p-5">
        <p className="text-sm font-medium text-[#1A4B6B] mb-1">Inzicht</p>
        <p className="text-sm text-[#1A1A18]">
          E-mail en referral zijn je meest efficiënte kanalen met een LTV:CAC ratio boven 14x.
          Meta Ads heeft het hoogste volume maar een ratio van slechts 2.4x — onder het doel van 3.0x.
          Focus op het verlagen van Meta CPA of verhoog AOV om de ratio te verbeteren.
        </p>
      </div>
    </div>
  );
}
