// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Store {
  name: string;
  market: string;
  flag: string;
  currency: string;
  revenue: number;
  adSpend: number;
  cogs: number;
  costs: number;
  trueProfit: number;
  margin: number;
  orders: number;
  aov: number;
  status: string;
}

const STORES: Store[] = [
  { name: "RealProfit NL", market: "Netherlands", flag: "🇳🇱", currency: "EUR", revenue: 29600, adSpend: 8400, cogs: 7400, costs: 2629, trueProfit: 11171, margin: 37.7, orders: 187, aov: 158, status: "Active" },
  { name: "RealProfit UK", market: "United Kingdom", flag: "🇬🇧", currency: "GBP", revenue: 12400, adSpend: 4200, cogs: 3100, costs: 1840, trueProfit: 3260, margin: 26.3, orders: 94, aov: 132, status: "Active" },
  { name: "RealProfit US", market: "United States", flag: "🇺🇸", currency: "USD", revenue: 8200, adSpend: 3100, cogs: 2050, costs: 1240, trueProfit: 1810, margin: 22.1, orders: 61, aov: 134, status: "Growing" },
  { name: "SupplementCo NL", market: "Netherlands", flag: "🇳🇱", currency: "EUR", revenue: 4800, adSpend: 1900, cogs: 960, costs: 890, trueProfit: 1050, margin: 21.9, orders: 38, aov: 126, status: "Testing" },
];

const CURRENCY_SYMBOL: Record<string, string> = { EUR: "€", GBP: "£", USD: "$" };

const STATUS_BADGE: Record<string, string> = {
  Active: "text-[#1A6B3C] bg-[#E8F5EE]",
  Growing: "text-[#1A4B6B] bg-[#E8EFF5]",
  Testing: "text-[#8B6020] bg-[#FEF3E2]",
};

const totalRevenue = STORES.reduce((s, st) => s + st.revenue, 0);
const totalProfit = STORES.reduce((s, st) => s + st.trueProfit, 0);
const avgMargin = STORES.length > 0 ? STORES.reduce((s, st) => s + st.margin, 0) / STORES.length : 0;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StoresPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Stores</h1>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-[#8C8A84]">Total revenue</p>
            <p className="text-lg font-medium text-[#1A6B3C]">&euro;{fmt(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Total profit</p>
            <p className="text-lg font-medium text-[#1A6B3C]">&euro;{fmt(totalProfit)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Gem. margin</p>
            <p className="text-lg font-medium text-[#1A1A18]">{avgMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Consolidated RealProfit bar */}
      <section className="mb-10">
        <div className="rounded-lg border border-[#E8E6E1] bg-white p-5">
          <p className="text-xs text-[#8C8A84] mb-3">RealProfit per store</p>
          <div className="flex h-6 rounded-full overflow-hidden">
            {STORES.map((st) => {
              const widthPct = totalProfit > 0 ? (st.trueProfit / totalProfit) * 100 : 0;
              const colors = [
                "bg-[#1A6B3C]",
                "bg-[#1A6B3C]/70",
                "bg-[#1A4B6B]",
                "bg-[#8B6020]",
              ];
              const idx = STORES.indexOf(st);
              return (
                <div
                  key={st.name}
                  className={`${colors[idx % colors.length]} h-full`}
                  style={{ width: `${widthPct}%` }}
                  title={`${st.name}: €${fmt(st.trueProfit)}`}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {STORES.map((st, idx) => {
              const colors = [
                "bg-[#1A6B3C]",
                "bg-[#1A6B3C]/70",
                "bg-[#1A4B6B]",
                "bg-[#8B6020]",
              ];
              return (
                <div key={st.name} className="flex items-center gap-1.5 text-xs text-[#8C8A84]">
                  <div className={`w-2.5 h-2.5 rounded-sm ${colors[idx % colors.length]}`} />
                  {st.name}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Store Cards */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {STORES.map((st) => (
            <StoreCard key={st.name} store={st} />
          ))}
        </div>
      </section>

      {/* Consolidated P&L Table */}
      <section>
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Consolidated P&L</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Ad Spend</th>
                <th className="px-4 py-3 text-right">COGS</th>
                <th className="px-4 py-3 text-right">Costs</th>
                <th className="px-4 py-3 text-right">RealProfit</th>
                <th className="px-4 py-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {STORES.map((st) => (
                <tr key={st.name} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-3 text-[#1A1A18] font-medium">{st.flag} {st.name}</td>
                  <td className="px-4 py-3 text-right text-[#1A6B3C]">&euro;{fmt(st.revenue)}</td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(st.adSpend)}</td>
                  <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(st.cogs)}</td>
                  <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(st.costs)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${st.trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
                    &euro;{fmt(st.trueProfit)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${st.margin >= 30 ? "text-[#1A6B3C]" : st.margin >= 20 ? "text-[#8B6020]" : "text-[#8B2020]"}`}>
                    {st.margin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0F0F0D] bg-white font-semibold">
                <td className="px-4 py-3 text-[#1A1A18]">Totaal</td>
                <td className="px-4 py-3 text-right text-[#1A6B3C]">&euro;{fmt(totalRevenue)}</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(STORES.reduce((s, st) => s + st.adSpend, 0))}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(STORES.reduce((s, st) => s + st.cogs, 0))}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">&euro;{fmt(STORES.reduce((s, st) => s + st.costs, 0))}</td>
                <td className="px-4 py-3 text-right font-bold text-[#1A6B3C]">&euro;{fmt(totalProfit)}</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">
                  {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%
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

function StoreCard({ store: st }: { store: Store }) {
  const sym = CURRENCY_SYMBOL[st.currency] ?? st.currency;
  const badgeCls = STATUS_BADGE[st.status] ?? "text-[#8C8A84] bg-[#F5F5F0]";
  const marginWidth = Math.min(st.margin, 50) * 2; // scale to 100%

  return (
    <div className="rounded-lg border border-[#E8E6E1] bg-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{st.flag}</span>
          <h3 className="font-semibold text-[#1A1A18]">{st.name}</h3>
          <span className="text-xs text-[#8C8A84]">{st.market}</span>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badgeCls}`}>
          {st.status}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-[#8C8A84] uppercase">Revenue</p>
          <p className="text-sm font-semibold text-[#1A6B3C]">{sym}{fmt(st.revenue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8C8A84] uppercase">Ad Spend</p>
          <p className="text-sm font-semibold text-[#1A1A18]">{sym}{fmt(st.adSpend)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8C8A84] uppercase">RealProfit</p>
          <p className={`text-lg font-bold ${st.trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
            {sym}{fmt(st.trueProfit)}
          </p>
        </div>
      </div>

      {/* Margin bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#8C8A84]">Margin</span>
          <span className={`text-xs font-semibold ${st.margin >= 30 ? "text-[#1A6B3C]" : st.margin >= 20 ? "text-[#8B6020]" : "text-[#8B2020]"}`}>
            {st.margin.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E8E6E1] overflow-hidden">
          <div
            className={`h-full rounded-full ${st.margin >= 30 ? "bg-[#1A6B3C]" : st.margin >= 20 ? "bg-[#8B6020]" : "bg-[#8B2020]"}`}
            style={{ width: `${marginWidth}%` }}
          />
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="flex gap-6 pt-2 border-t border-[#E8E6E1]">
        <div>
          <p className="text-[10px] text-[#8C8A84] uppercase">Orders</p>
          <p className="text-sm font-semibold text-[#1A1A18]">{st.orders}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8C8A84] uppercase">AOV</p>
          <p className="text-sm font-semibold text-[#1A1A18]">{sym}{st.aov}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
