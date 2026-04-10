// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const SUB_STATS = { active: 187, paused: 23, cancelled: 41, newThisMonth: 34, churnedThisMonth: 8, churnRate: 4.1 };

interface CohortRow {
  month: string;
  newCustomers: number;
  returnedMonth2?: number;
  returnedMonth3?: number;
  returnedMonth4?: number;
}

const COHORT_DATA: CohortRow[] = [
  { month: "Oktober", newCustomers: 89, returnedMonth2: 41, returnedMonth3: 28, returnedMonth4: 19 },
  { month: "November", newCustomers: 112, returnedMonth2: 58, returnedMonth3: 39, returnedMonth4: 24 },
  { month: "December", newCustomers: 143, returnedMonth2: 71, returnedMonth3: 48 },
  { month: "Januari", newCustomers: 98, returnedMonth2: 52, returnedMonth3: 31 },
  { month: "Februari", newCustomers: 118, returnedMonth2: 63 },
  { month: "Maart", newCustomers: 134 },
];

const LTV = { averageLTV: 187, averageOrderCount: 3.4, paybackPeriod: 2.1 };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RetentionPage() {
  const total = SUB_STATS.active + SUB_STATS.paused + SUB_STATS.cancelled;

  return (
    <div>
      <h1 className="text-2xl font-medium mb-8 text-[#1A1A18]">Retention</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <MetricCard label="Active subs" value={SUB_STATS.active.toString()} color="emerald" />
        <MetricCard label="Paused" value={SUB_STATS.paused.toString()} color="amber" />
        <MetricCard label="Churned" value={SUB_STATS.cancelled.toString()} color="red" />
        <MetricCard label="New this month" value={SUB_STATS.newThisMonth.toString()} color="blue" />
        <MetricCard label="Churn rate" value={`${SUB_STATS.churnRate}%`} color={SUB_STATS.churnRate < 5 ? "emerald" : "red"} />
        <MetricCard label="Avg LTV" value={`$${LTV.averageLTV}`} color="emerald" />
      </div>

      {/* Donut chart */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-4 text-[#1A1A18]">Subscriptions</h2>
        <div className="rounded-lg bg-white border border-[#E8E6E1] p-6 flex items-center gap-10">
          <DonutChart
            segments={[
              { value: SUB_STATS.active, color: "rgb(26,107,60)", label: "Active" },
              { value: SUB_STATS.paused, color: "rgb(139,96,32)", label: "Paused" },
              { value: SUB_STATS.cancelled, color: "rgb(139,32,32)", label: "Cancelled" },
            ]}
            total={total}
          />
          <div className="flex flex-col gap-2 text-sm">
            <LegendItem color="rgb(26,107,60)" label="Active" value={SUB_STATS.active} pct={((SUB_STATS.active / total) * 100).toFixed(0)} />
            <LegendItem color="rgb(139,96,32)" label="Paused" value={SUB_STATS.paused} pct={((SUB_STATS.paused / total) * 100).toFixed(0)} />
            <LegendItem color="rgb(139,32,32)" label="Cancelled" value={SUB_STATS.cancelled} pct={((SUB_STATS.cancelled / total) * 100).toFixed(0)} />
          </div>
        </div>
      </section>

      {/* Cohort table */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-4 text-[#1A1A18]">Cohort Retention</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Maand</th>
                <th className="px-4 py-3 text-right">Nieuw</th>
                <th className="px-4 py-3 text-center">Maand 2</th>
                <th className="px-4 py-3 text-center">Maand 3</th>
                <th className="px-4 py-3 text-center">Maand 4</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map((row) => (
                <tr key={row.month} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-3 text-[#1A1A18]">{row.month}</td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">{row.newCustomers}</td>
                  <CohortCell value={row.returnedMonth2} total={row.newCustomers} />
                  <CohortCell value={row.returnedMonth3} total={row.newCustomers} />
                  <CohortCell value={row.returnedMonth4} total={row.newCustomers} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* LTV cards */}
      <section>
        <h2 className="text-lg font-medium mb-4 text-[#1A1A18]">Lifetime Value</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white border border-[#E8E6E1] p-5">
            <p className="text-xs text-[#8C8A84] mb-2">Gemiddelde LTV</p>
            <p className="text-2xl font-medium text-[#1A6B3C]">${LTV.averageLTV}</p>
          </div>
          <div className="rounded-lg bg-white border border-[#E8E6E1] p-5">
            <p className="text-xs text-[#8C8A84] mb-2">Gem. aantal orders</p>
            <p className="text-2xl font-medium text-[#1A1A18]">{LTV.averageOrderCount}</p>
          </div>
          <div className="rounded-lg bg-white border border-[#E8E6E1] p-5">
            <p className="text-xs text-[#8C8A84] mb-2">Terugverdientijd</p>
            <p className="text-2xl font-medium text-[#1A1A18]">{LTV.paybackPeriod} maanden</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    white: "text-[#1A1A18]", emerald: "text-[#1A6B3C]", amber: "text-[#8B6020]",
    red: "text-[#8B2020]", blue: "text-[#1A4B6B]",
  };
  return (
    <div className="rounded-lg bg-white border border-[#E8E6E1] p-4">
      <p className="text-xs text-[#8C8A84] mb-1">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${colors[color] ?? "text-[#1A1A18]"}`}>{value}</p>
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { value: number; color: string; label: string }[]; total: number }) {
  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const pct = seg.value / total;
        const dashLength = pct * circumference;
        const dashOffset = -offset * circumference;
        offset += pct;

        return (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
      <text x={size / 2} y={size / 2 - 6} fill="#1A1A18" fontSize="20" fontWeight="bold" textAnchor="middle">{total}</text>
      <text x={size / 2} y={size / 2 + 12} fill="#8C8A84" fontSize="10" textAnchor="middle">totaal</text>
    </svg>
  );
}

function LegendItem({ color, label, value, pct }: { color: string; label: string; value: number; pct: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[#8C8A84]">{label}</span>
      <span className="text-[#1A1A18] font-medium">{value}</span>
      <span className="text-[#8C8A84]">({pct}%)</span>
    </div>
  );
}

function CohortCell({ value, total }: { value?: number; total: number }) {
  if (value === undefined) {
    return <td className="px-4 py-3 text-center text-[#E8E6E1]">—</td>;
  }
  const pct = (value / total) * 100;
  const bg = pct >= 50 ? "bg-[#E8F5EE] text-[#1A6B3C]" : pct >= 30 ? "bg-[#FEF3E2] text-[#8B6020]" : "bg-[#FDEAEA] text-[#8B2020]";

  return (
    <td className="px-4 py-3 text-center">
      <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${bg}`}>
        {pct.toFixed(0)}%
      </span>
    </td>
  );
}
