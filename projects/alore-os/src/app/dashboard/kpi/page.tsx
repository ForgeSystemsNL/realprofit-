// ---------------------------------------------------------------------------
// Mock data — last 7 days
// ---------------------------------------------------------------------------

interface KpiRow {
  date: string;
  spend: number;
  revenue: number;
  cogs: number;
  orders: number;
  cpa: number;
  newSubscribers: number;
}

const KPI_DATA: KpiRow[] = [
  { date: "2026-03-13", spend: 380, revenue: 1240, cogs: 310, orders: 8, cpa: 47, newSubscribers: 42 },
  { date: "2026-03-14", spend: 420, revenue: 1680, cogs: 420, orders: 11, cpa: 38, newSubscribers: 38 },
  { date: "2026-03-15", spend: 310, revenue: 890, cogs: 222, orders: 6, cpa: 52, newSubscribers: 29 },
  { date: "2026-03-16", spend: 480, revenue: 1920, cogs: 480, orders: 14, cpa: 34, newSubscribers: 55 },
  { date: "2026-03-17", spend: 390, revenue: 1560, cogs: 390, orders: 10, cpa: 39, newSubscribers: 47 },
  { date: "2026-03-18", spend: 440, revenue: 1740, cogs: 435, orders: 12, cpa: 37, newSubscribers: 51 },
  { date: "2026-03-19", spend: 420, revenue: 1390, cogs: 347, orders: 9, cpa: 47, newSubscribers: 50 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KpiPage() {
  const totals = KPI_DATA.reduce(
    (acc, r) => ({
      spend: acc.spend + r.spend,
      revenue: acc.revenue + r.revenue,
      cogs: acc.cogs + r.cogs,
      orders: acc.orders + r.orders,
      newSubscribers: acc.newSubscribers + r.newSubscribers,
    }),
    { spend: 0, revenue: 0, cogs: 0, orders: 0, newSubscribers: 0 }
  );

  const avgMer = totals.spend > 0 ? totals.revenue / totals.spend : 0;
  const avgCpa = totals.orders > 0 ? totals.spend / totals.orders : 0;
  const cogsPct = totals.revenue > 0 ? (totals.cogs / totals.revenue) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-[#1A1A18]">KPI Rapport</h1>
          <p className="text-sm text-[#8C8A84] mt-1">13 maart — 19 maart 2026</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-[#8C8A84]">Week Spend</p>
            <p className="text-lg font-semibold tabular-nums text-[#1A1A18]">${fmt(totals.spend)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Week Revenue</p>
            <p className="text-lg font-semibold tabular-nums text-[#1A6B3C]">${fmt(totals.revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">COGS</p>
            <p className="text-lg font-semibold tabular-nums text-[#8B6020]">${fmt(totals.cogs)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Avg MER</p>
            <p className="text-lg font-semibold tabular-nums text-[#1A1A18]">{avgMer.toFixed(2)}x</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3 text-right">Spend</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">COGS</th>
              <th className="px-4 py-3 text-right">MER</th>
              <th className="px-4 py-3 text-right">CPA</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Subscribers</th>
            </tr>
          </thead>
          <tbody>
            {KPI_DATA.map((row) => {
              const mer = row.spend > 0 ? row.revenue / row.spend : 0;
              const merColor = mer >= 4 ? "text-[#1A6B3C]" : mer >= 3 ? "text-[#8B6020]" : "text-[#8B2020]";
              const cpaColor = row.cpa < 40 ? "text-[#1A6B3C]" : row.cpa < 50 ? "text-[#1A1A18]" : "text-[#8B2020]";
              const rowCogsPct = row.revenue > 0 ? (row.cogs / row.revenue) * 100 : 0;

              return (
                <tr key={row.date} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-3 text-[#8C8A84]">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">${fmt(row.spend)}</td>
                  <td className="px-4 py-3 text-right text-[#1A6B3C]">${fmt(row.revenue)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[#1A1A18]">${fmt(row.cogs)}</span>
                    <span className="text-[#8C8A84] text-xs ml-1">({rowCogsPct.toFixed(0)}%)</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${merColor}`}>{mer.toFixed(2)}x</td>
                  <td className={`px-4 py-3 text-right ${cpaColor}`}>${fmt(row.cpa)}</td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">{row.orders}</td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">{row.newSubscribers}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E8E6E1] bg-[#F5F5F0] font-semibold">
              <td className="px-4 py-3 text-[#1A1A18]">Totaal / Gem.</td>
              <td className="px-4 py-3 text-right text-[#1A1A18]">${fmt(totals.spend)}</td>
              <td className="px-4 py-3 text-right text-[#1A6B3C]">${fmt(totals.revenue)}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-[#1A1A18]">${fmt(totals.cogs)}</span>
                <span className="text-[#8C8A84] text-xs ml-1">({cogsPct.toFixed(0)}%)</span>
              </td>
              <td className="px-4 py-3 text-right text-[#1A1A18]">{avgMer.toFixed(2)}x</td>
              <td className="px-4 py-3 text-right text-[#1A1A18]">${fmt(avgCpa)}</td>
              <td className="px-4 py-3 text-right text-[#1A1A18]">{totals.orders}</td>
              <td className="px-4 py-3 text-right text-[#1A1A18]">{totals.newSubscribers}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
