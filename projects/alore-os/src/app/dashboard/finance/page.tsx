// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface PnlRow {
  month: string;
  revenue: number;
  adSpend: number;
  cogs: number;
  shipping: number;
  tools: number;
  paymentFees: number;
  team: number;
  nettMargin: number;
}

const PNL_DATA: PnlRow[] = [
  { month: "Oktober 2025", revenue: 18400, adSpend: 5200, cogs: 4600, shipping: 920, tools: 380, paymentFees: 552, team: 800, nettMargin: 5948 },
  { month: "November 2025", revenue: 24600, adSpend: 7100, cogs: 6150, shipping: 1230, tools: 380, paymentFees: 738, team: 800, nettMargin: 8202 },
  { month: "December 2025", revenue: 31200, adSpend: 9400, cogs: 7800, shipping: 1560, tools: 380, paymentFees: 936, team: 800, nettMargin: 10324 },
  { month: "Januari 2026", revenue: 22800, adSpend: 6200, cogs: 5700, shipping: 1140, tools: 380, paymentFees: 684, team: 800, nettMargin: 7896 },
  { month: "Februari 2026", revenue: 26400, adSpend: 7800, cogs: 6600, shipping: 1320, tools: 380, paymentFees: 792, team: 800, nettMargin: 8708 },
  { month: "Maart 2026", revenue: 29600, adSpend: 8400, cogs: 7400, shipping: 1480, tools: 380, paymentFees: 888, team: 800, nettMargin: 10252 },
];

function trueProfit(row: PnlRow): number {
  return row.revenue - row.adSpend - row.cogs - row.shipping - row.tools - row.paymentFees - row.team;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FinancePage() {
  const ytdData = PNL_DATA.filter((r) => r.month.includes("2026"));
  const ytdRevenue = ytdData.reduce((s, r) => s + r.revenue, 0);
  const ytdAdSpend = ytdData.reduce((s, r) => s + r.adSpend, 0);
  const ytdRealProfit = ytdData.reduce((s, r) => s + trueProfit(r), 0);
  const avgRealProfitPct = ytdRevenue > 0 ? (ytdRealProfit / ytdRevenue) * 100 : 0;

  const totals = PNL_DATA.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      adSpend: acc.adSpend + r.adSpend,
      cogs: acc.cogs + r.cogs,
      shipping: acc.shipping + r.shipping,
      tools: acc.tools + r.tools,
      paymentFees: acc.paymentFees + r.paymentFees,
      team: acc.team + r.team,
      nettMargin: acc.nettMargin + r.nettMargin,
    }),
    { revenue: 0, adSpend: 0, cogs: 0, shipping: 0, tools: 0, paymentFees: 0, team: 0, nettMargin: 0 }
  );
  const totalTP = PNL_DATA.reduce((s, r) => s + trueProfit(r), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-4 text-[#1A1A18]">RealProfit</h1>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-[#E8E6E1] bg-white p-4">
            <p className="text-xs text-[#8C8A84] mb-1">YTD Revenue</p>
            <p className="text-xl font-semibold tabular-nums text-[#1A6B3C]">&euro;{fmtK(ytdRevenue)}</p>
          </div>
          <div className="rounded-lg border border-[#E8E6E1] bg-white p-4">
            <p className="text-xs text-[#8C8A84] mb-1">YTD Ad Spend</p>
            <p className="text-xl font-semibold tabular-nums text-[#1A1A18]">&euro;{fmtK(ytdAdSpend)}</p>
          </div>
          <div className="rounded-lg border-2 border-[#1A6B3C]/30 bg-[#F0F9F4] p-4">
            <p className="text-xs text-[#8C8A84] mb-1">YTD RealProfit</p>
            <p className={`text-xl font-semibold tabular-nums ${ytdRealProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
              &euro;{fmtK(ytdRealProfit)}
            </p>
          </div>
          <div className="rounded-lg border border-[#E8E6E1] bg-white p-4">
            <p className="text-xs text-[#8C8A84] mb-1">Gem. profit margin</p>
            <p className={`text-xl font-semibold tabular-nums ${avgRealProfitPct >= 30 ? "text-[#1A6B3C]" : avgRealProfitPct >= 20 ? "text-[#8B6020]" : "text-[#8B2020]"}`}>
              {avgRealProfitPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-4 text-[#1A1A18]">Revenue vs RealProfit</h2>
        <div className="rounded-lg border border-[#E8E6E1] bg-white p-6">
          <RevenueProfitChart data={PNL_DATA} />
        </div>
      </section>

      {/* P&L Table */}
      <section>
        <h2 className="text-lg font-medium mb-4 text-[#1A1A18]">P&L Overzicht</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Maand</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Ad Spend</th>
                <th className="px-4 py-3 text-right">COGS</th>
                <th className="px-4 py-3 text-right">Verzending</th>
                <th className="px-4 py-3 text-right">Payment</th>
                <th className="px-4 py-3 text-right">Tools</th>
                <th className="px-4 py-3 text-right">Team</th>
                <th className="px-4 py-3 text-right">RealProfit</th>
                <th className="px-4 py-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {PNL_DATA.map((row) => {
                const tp = trueProfit(row);
                const tpPct = row.revenue > 0 ? (tp / row.revenue) * 100 : 0;
                const tpColor = tpPct >= 30 ? "text-[#1A6B3C]" : tpPct >= 20 ? "text-[#8B6020]" : "text-[#8B2020]";

                return (
                  <tr key={row.month} className="border-b border-[#E8E6E1]/50">
                    <td className="px-4 py-3 text-[#1A1A18]">{row.month}</td>
                    <td className="px-4 py-3 text-right text-[#1A6B3C]">&euro;{fmt(row.revenue)}</td>
                    <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(row.adSpend)}</td>
                    <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(row.cogs)}</td>
                    <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(row.shipping)}</td>
                    <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(row.paymentFees)}</td>
                    <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(row.tools)}</td>
                    <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(row.team)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${tp >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
                      &euro;{fmt(tp)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${tpColor}`}>{tpPct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0F0F0D] bg-white font-semibold">
                <td className="px-4 py-3 text-[#1A1A18]">Totaal</td>
                <td className="px-4 py-3 text-right text-[#1A6B3C]">&euro;{fmt(totals.revenue)}</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(totals.adSpend)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(totals.cogs)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(totals.shipping)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(totals.paymentFees)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(totals.tools)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(totals.team)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#1A6B3C]">&euro;{fmt(totalTP)}</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">
                  {totals.revenue > 0 ? ((totalTP / totals.revenue) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function RevenueProfitChart({ data }: { data: PnlRow[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue));
  const w = 600;
  const h = 160;
  const barGroupWidth = w / data.length;
  const barWidth = barGroupWidth * 0.3;
  const gap = 4;

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full max-w-[700px]">
      {data.map((row, i) => {
        const x = i * barGroupWidth + barGroupWidth * 0.15;
        const revH = (row.revenue / maxVal) * h;
        const tp = trueProfit(row);
        const tpH = Math.abs(tp / maxVal) * h;
        const label = row.month.split(" ")[0].slice(0, 3);

        return (
          <g key={row.month}>
            {/* Revenue bar */}
            <rect
              x={x}
              y={h - revH}
              width={barWidth}
              height={revH}
              fill="#1A6B3C"
              opacity={0.7}
              rx={2}
            />
            {/* RealProfit bar */}
            <rect
              x={x + barWidth + gap}
              y={h - tpH}
              width={barWidth}
              height={tpH}
              fill={tp >= 0 ? "#1A6B3C" : "#8B2020"}
              opacity={0.3}
              rx={2}
            />
            {/* Label */}
            <text
              x={x + barWidth + gap / 2}
              y={h + 16}
              fill="#8C8A84"
              fontSize="10"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={w - 140} y={0} width={8} height={8} fill="#1A6B3C" opacity={0.7} rx={1} />
      <text x={w - 128} y={8} fill="#8C8A84" fontSize="9">Revenue</text>
      <rect x={w - 70} y={0} width={8} height={8} fill="#1A6B3C" opacity={0.3} rx={1} />
      <text x={w - 58} y={8} fill="#8C8A84" fontSize="9">RealProfit</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtK(n: number): string {
  return (n / 1000).toFixed(1) + "k";
}
