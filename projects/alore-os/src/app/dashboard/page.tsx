import Link from "next/link";
import { getKpiEntries } from "@/lib/notion";
import { getSubscriberCount } from "@/lib/klaviyo";
import type { KpiEntry } from "@/lib/notion";

import { createServerSupabaseClient } from "@/lib/supabase-server";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_KPI: KpiEntry = {
  id: "mock",
  date: new Date().toISOString().slice(0, 10),
  revenue: 8420,
  adSpend: 2840,
  roas: 2.96,
  orders: 47,
  sessions: 0,
  conversionRate: 0,
  newSubscribers: 312,
};

interface DashboardCampaign {
  id: string;
  name: string;
  status: string;
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
}

const MOCK_CAMPAIGNS_FULL: DashboardCampaign[] = [
  { id: "m1", name: "Collageen Serum — UGC v3", status: "Winner", platform: "Meta", spend: 643, revenue: 2443, roas: 3.8 },
  { id: "m2", name: "Anti-aging — Social proof v2", status: "Active", platform: "Meta", spend: 298, revenue: 626, roas: 2.1 },
  { id: "m3", name: "Routine — Statisch v1", status: "Testing", platform: "Meta", spend: 87, revenue: 200, roas: 1.4 },
  { id: "m4", name: "Collageen — Email flow Q1", status: "Winner", platform: "Email", spend: 120, revenue: 890, roas: 7.4 },
  { id: "m5", name: "Bundle deal — UGC v1", status: "Dead", platform: "Meta", spend: 412, revenue: 290, roas: 0.7 },
  { id: "m6", name: "Skincare routine — Video v2", status: "Active", platform: "Meta", spend: 201, revenue: 522, roas: 2.6 },
  { id: "m7", name: "Collageen Serum — UGC v4", status: "Testing", platform: "Meta", spend: 44, revenue: 89, roas: 2.0 },
  { id: "m8", name: "40+ huid — Testimonial", status: "Winner", platform: "Meta", spend: 388, revenue: 1320, roas: 3.4 },
  { id: "m9", name: "Win-back — Email Q1", status: "Active", platform: "Email", spend: 60, revenue: 340, roas: 5.7 },
  { id: "m10", name: "Bundel — Statisch v2", status: "Testing", platform: "Meta", spend: 62, revenue: 134, roas: 1.8 },
  { id: "m11", name: "Ingredient focus — UGC v1", status: "Testing", platform: "Meta", spend: 38, revenue: 54, roas: 1.4 },
  { id: "m12", name: "Zomer routine — Static", status: "Dead", platform: "Meta", spend: 178, revenue: 89, roas: 0.5 },
];


const MOCK_SUBSCRIBER_COUNT = 312;

const WEEKLY_REVENUE = [4200, 5800, 4900, 7200, 6800, 8420];
const WEEKLY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za"];

// Cost breakdown mock
const COST_BREAKDOWN = [
  { label: "Ad Spend", amount: 2840, pct: 33.7 },
  { label: "COGS", amount: 2105, pct: 25.0 },
  { label: "Payment fees", amount: 253, pct: 3.0 },
  { label: "Chargebacks", amount: 45, pct: 0.5 },
  { label: "Apps & tools", amount: 380, pct: 4.5 },
  { label: "VA costs", amount: 800, pct: 9.5 },
];

const TOTAL_COSTS = COST_BREAKDOWN.reduce((s, c) => s + c.amount, 0);

// ---------------------------------------------------------------------------
// Data fetching with fallback
// ---------------------------------------------------------------------------

async function fetchDashboardData() {
  const today = new Date().toISOString().slice(0, 10);
  const useMock = !process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === "your_notion_api_key_here";

  if (useMock) {
    return {
      kpi: MOCK_KPI,
      subscriberCount: MOCK_SUBSCRIBER_COUNT,
    };
  }

  try {
    const [kpiEntries, subscriberCount] = await Promise.all([
      getKpiEntries({ start: today, end: today }),
      getSubscriberCount().catch(() => 0),
    ]);

    const kpi: KpiEntry = kpiEntries[0] ?? MOCK_KPI;

    return { kpi, subscriberCount };
  } catch {
    return {
      kpi: MOCK_KPI,
      subscriberCount: MOCK_SUBSCRIBER_COUNT,
    };
  }
}

// ---------------------------------------------------------------------------
// Health score logic
// ---------------------------------------------------------------------------

function getHealthScore(margin: number): { label: string; color: string; dotColor: string; bullets: string[] } {
  if (margin >= 30) {
    return {
      label: "Gezond",
      color: "text-[#1A6B3C]",
      dotColor: "bg-[#1A6B3C]",
      bullets: [
        "True profit margin boven 30% — sterke marge",
        "Kosten zijn onder controle",
        "Ruimte om te schalen of te herinvesteren",
      ],
    };
  }
  if (margin >= 20) {
    return {
      label: "Let op",
      color: "text-[#8B6020]",
      dotColor: "bg-[#8B6020]",
      bullets: [
        "True profit margin tussen 20-30% — acceptabel maar krap",
        "Controleer variabele kosten en COGS",
        "Overweeg prijsverhoging of kostenverlaging",
      ],
    };
  }
  return {
    label: "Kritiek",
    color: "text-[#8B2020]",
    dotColor: "bg-[#8B2020]",
    bullets: [
      "True profit margin onder 20% — actie vereist",
      "Kosten stijgen sneller dan revenue",
      "Herzie ad spend, COGS en operationele kosten",
    ],
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const { kpi, subscriberCount } = await fetchDashboardData();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  const firstName = rawName.split(" ")[0];

  const mer = kpi.adSpend > 0 ? kpi.revenue / kpi.adSpend : 0;
  const cpa = kpi.adSpend > 0 && kpi.orders > 0 ? kpi.adSpend / kpi.orders : 0;
  const trueProfit = kpi.revenue - TOTAL_COSTS;
  const trueProfitMargin = kpi.revenue > 0 ? (trueProfit / kpi.revenue) * 100 : 0;

  // Sort all 12 campaigns by ROAS descending, show top 5
  const sortedCampaigns = [...MOCK_CAMPAIGNS_FULL].sort((a, b) => b.roas - a.roas);
  const top5Campaigns = sortedCampaigns.slice(0, 5);

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  const hour = now.getHours();
  const greeting =
    hour >= 5 && hour < 12 ? "Goedemorgen" :
      hour >= 12 && hour < 18 ? "Goedemiddag" :
        hour >= 18 ? "Goedenavond" : "Goedenacht";

  const dateStr = now.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const health = getHealthScore(trueProfitMargin);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {/* <h1 className="text-2xl font-medium text-[#1A1A18]"></h1> */}
          <h1 className="text-2xl font-medium text-[#1A1A18]">RealProfit Dashboard</h1>
          <p className="text-sm text-[#8C8A84] mt-1">{greeting}, {firstName}</p>
        </div>
        <p className="text-sm text-[#8C8A84] capitalize pt-1">{dateStr}</p>
      </div>

      {/* RealProfit Hero Card + KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {/* True Profit — large card spanning col */}
        <div className="col-span-2 md:col-span-1 rounded-lg border-2 border-[#1A6B3C]/30 bg-[#F0F9F4] p-5">
          <p className="text-xs text-[#8C8A84] mb-1">RealProfit</p>
          <p className={`text-3xl font-semibold tabular-nums ${trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
            &euro;{fmt(Math.abs(trueProfit))}
          </p>
          <p className={`text-xs mt-1 ${trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
            {trueProfitMargin.toFixed(1)}% margin
          </p>
        </div>

        <MetricCard label="Revenue" value={fmt(kpi.revenue)} prefix="€" color="success" />
        <MetricCard label="Ad Spend" value={fmt(kpi.adSpend)} prefix="€" color="default" />
        <MetricCard label="MER" value={mer.toFixed(2)} suffix="x" color={mer >= 3 ? "success" : mer >= 2 ? "amber" : "danger"} />
        <MetricCard label="CPA" value={fmt(cpa)} prefix="€" color={cpa < 30 ? "success" : cpa < 50 ? "amber" : "danger"} />
        <MetricCard label="Orders" value={kpi.orders.toString()} color="default" />
        <MetricCard label="New Subscribers" value={subscriberCount.toLocaleString()} color="blue" />
      </div>

      {/* Cost Breakdown */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Kostenoverzicht babun</h2>
        <div className="rounded-lg border border-[#E8E6E1] bg-white">
          <table className="w-full text-sm">
            <tbody>
              {COST_BREAKDOWN.map((row) => (
                <tr key={row.label} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-2.5 text-[#1A1A18]">{row.label}</td>
                  <td className="px-4 py-2.5 text-right text-[#1A1A18] font-medium">&euro;{fmt(row.amount)}</td>
                  <td className="px-4 py-2.5 text-right text-[#8C8A84] w-[100px]">{row.pct.toFixed(1)}% of revenue</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#0F0F0D]">
                <td className="px-4 py-2.5 font-semibold text-[#1A1A18]">Total costs</td>
                <td className="px-4 py-2.5 text-right font-semibold text-[#1A1A18]">&euro;{fmt(TOTAL_COSTS)}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-[#8C8A84]">
                  {kpi.revenue > 0 ? ((TOTAL_COSTS / kpi.revenue) * 100).toFixed(1) : "0.0"}% of revenue
                </td>
              </tr>
              <tr className="bg-[#F0F9F4]">
                <td className="px-4 py-2.5 font-semibold text-[#1A6B3C]">RealProfit</td>
                <td className={`px-4 py-2.5 text-right font-bold ${trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
                  &euro;{fmt(Math.abs(trueProfit))}
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${trueProfit >= 0 ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
                  {trueProfitMargin.toFixed(1)}% margin
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Financial Health */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Financiële gezondheid</h2>
        <div className="rounded-lg border border-[#E8E6E1] bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-3 h-3 rounded-full ${health.dotColor}`} />
            <span className={`text-xl font-semibold tabular-nums ${health.color}`}>
              {health.label}
            </span>
            <span className="text-sm text-[#8C8A84] ml-2">
              {trueProfitMargin.toFixed(1)}% profit margin
            </span>
          </div>
          <ul className="space-y-2 mb-5">
            {health.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A18]/80">
                <span className="text-[#8C8A84] mt-0.5">—</span>
                {b}
              </li>
            ))}
          </ul>
          <a
            href="/dashboard/finance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A18] text-white text-sm hover:bg-[#0F0F0D] transition-colors"
          >
            Bekijk RealProfit rapport
            <span className="text-white/60">&rarr;</span>
          </a>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-10">
        <QuickAction label="Nieuwe campagne" icon="+" />
        <QuickAction label="Creative uploaden" icon="^" />
        <QuickAction label="KPI invoeren" icon="#" />
      </div>

      {/* Campaigns Table — Top 5 by ROAS */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Top campagnes</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right w-[180px]">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {top5Campaigns.map((c) => (
                <DashboardCampaignRow key={c.id} campaign={c} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Link
            href="/dashboard/campaigns"
            className="text-sm text-[#1A4B6B] hover:text-[#1A1A18] transition-colors font-medium"
          >
            Bekijk alle campagnes &rarr;
          </Link>
        </div>
      </section>

      {/* Revenue Chart */}
      <section>
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Weekoverzicht Revenue</h2>
        <div className="rounded-lg border border-[#E8E6E1] bg-white p-6">
          <RevenueChart data={WEEKLY_REVENUE} labels={WEEKLY_LABELS} />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  prefix,
  suffix,
  color,
}: {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  color: string;
}) {
  const valueColors: Record<string, string> = {
    default: "text-[#1A1A18]",
    success: "text-[#1A6B3C]",
    amber: "text-[#8B6020]",
    danger: "text-[#8B2020]",
    blue: "text-[#1A4B6B]",
  };

  return (
    <div className="rounded-lg border border-[#E8E6E1] bg-white p-5">
      <p className="text-xs text-[#8C8A84] mb-2">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${valueColors[color] ?? "text-[#1A1A18]"}`}>
        {prefix}
        {value}
        {suffix}
      </p>
    </div>
  );
}

function QuickAction({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-white text-sm text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors">
      <span className="w-5 h-5 rounded bg-[#F5F5F0] flex items-center justify-center text-xs font-bold text-[#8C8A84]">
        {icon}
      </span>
      {label}
    </button>
  );
}

function DashboardCampaignRow({ campaign: c }: { campaign: DashboardCampaign }) {
  const isWinner = c.status === "Winner";
  const roasColor = c.roas >= 3 ? "bg-[#1A6B3C]" : c.roas >= 2 ? "bg-[#8B6020]" : "bg-[#8B2020]";
  const roasTextColor = c.roas >= 3 ? "text-[#1A6B3C]" : c.roas >= 2 ? "text-[#8B6020]" : "text-[#8B2020]";
  const roasWidth = Math.min((c.roas / 8) * 100, 100);

  return (
    <tr className={`border-b border-[#E8E6E1] ${isWinner ? "bg-[#F0F9F4]" : ""}`}>
      <td className="px-4 py-3 text-[#1A1A18] font-medium">
        {c.name}
        {isWinner && (
          <span className="ml-2 text-xs text-[#1A6B3C] font-medium">Winner</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={c.status} />
      </td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(c.spend)}</td>
      <td className="px-4 py-3 text-right text-[#1A6B3C]">&euro;{fmt(c.revenue)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <span className={`text-sm font-semibold w-12 text-right ${roasTextColor}`}>{c.roas.toFixed(1)}x</span>
          <div className="w-20 h-2 rounded-full bg-[#E8E6E1] overflow-hidden">
            <div
              className={`h-full rounded-full ${roasColor}`}
              style={{ width: `${roasWidth}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "text-[#1A6B3C] bg-[#E8F5EE]",
    winner: "text-[#1A6B3C] bg-[#E8F5EE]",
    paused: "text-[#8B6020] bg-[#FEF3E2]",
    testing: "text-[#8B6020] bg-[#FEF3E2]",
    dead: "text-[#8B2020] bg-[#FDEAEA]",
    ended: "text-[#8C8A84] bg-[#F5F5F0]",
  };
  const cls = colors[status.toLowerCase()] ?? "text-[#8C8A84] bg-[#F5F5F0]";

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${cls}`}>
      {status}
    </span>
  );
}

function RevenueChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 500;
  const h = 120;
  const padX = 30;
  const padY = 10;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - ((v - min) / range) * innerH,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full max-w-[600px]">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A6B3C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1A6B3C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="#1A6B3C" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#1A6B3C" />
            <text x={p.x} y={p.y - 8} fill="#8C8A84" fontSize="9" textAnchor="middle">
              &euro;{(data[i] / 1000).toFixed(1)}k
            </text>
            <text x={p.x} y={h + 14} fill="#8C8A84" fontSize="9" textAnchor="middle">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
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
