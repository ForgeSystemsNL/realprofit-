"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Campaign {
  id: number;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  orders: number;
  roas: number;
  cpa: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

// ---------------------------------------------------------------------------
// Mock data — 12 campaigns
// ---------------------------------------------------------------------------

const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Collageen Serum — UGC v3", platform: "Meta", status: "Winner", budget: 800, spend: 643, revenue: 2443, impressions: 84200, clicks: 2104, orders: 28, roas: 3.8, cpa: 23, ctr: 2.50, cpc: 0.31, cpm: 7.64 },
  { id: 2, name: "Anti-aging — Social proof v2", platform: "Meta", status: "Active", budget: 400, spend: 298, revenue: 626, impressions: 52400, clicks: 1048, orders: 9, roas: 2.1, cpa: 33, ctr: 2.00, cpc: 0.28, cpm: 5.69 },
  { id: 3, name: "Routine — Statisch v1", platform: "Meta", status: "Testing", budget: 200, spend: 87, revenue: 200, impressions: 19800, clicks: 317, orders: 2, roas: 1.4, cpa: 44, ctr: 1.60, cpc: 0.27, cpm: 4.39 },
  { id: 4, name: "Collageen — Email flow Q1", platform: "Email", status: "Winner", budget: 0, spend: 120, revenue: 890, impressions: 12400, clicks: 744, orders: 14, roas: 7.4, cpa: 9, ctr: 6.00, cpc: 0.16, cpm: 9.68 },
  { id: 5, name: "Bundle deal — UGC v1", platform: "Meta", status: "Dead", budget: 300, spend: 412, revenue: 290, impressions: 91000, clicks: 819, orders: 4, roas: 0.7, cpa: 103, ctr: 0.90, cpc: 0.50, cpm: 4.53 },
  { id: 6, name: "Skincare routine — Video v2", platform: "Meta", status: "Active", budget: 350, spend: 201, revenue: 522, impressions: 38600, clicks: 695, orders: 7, roas: 2.6, cpa: 29, ctr: 1.80, cpc: 0.29, cpm: 5.21 },
  { id: 7, name: "Collageen Serum — UGC v4", platform: "Meta", status: "Testing", budget: 200, spend: 44, revenue: 89, impressions: 9200, clicks: 147, orders: 1, roas: 2.0, cpa: 44, ctr: 1.60, cpc: 0.30, cpm: 4.78 },
  { id: 8, name: "40+ huid — Testimonial", platform: "Meta", status: "Winner", budget: 500, spend: 388, revenue: 1320, impressions: 61400, clicks: 1597, orders: 18, roas: 3.4, cpa: 22, ctr: 2.60, cpc: 0.24, cpm: 6.32 },
  { id: 9, name: "Win-back — Email Q1", platform: "Email", status: "Active", budget: 0, spend: 60, revenue: 340, impressions: 8200, clicks: 492, orders: 6, roas: 5.7, cpa: 10, ctr: 6.00, cpc: 0.12, cpm: 7.32 },
  { id: 10, name: "Bundel — Statisch v2", platform: "Meta", status: "Testing", budget: 150, spend: 62, revenue: 134, impressions: 14800, clicks: 207, orders: 2, roas: 1.8, cpa: 31, ctr: 1.40, cpc: 0.30, cpm: 4.19 },
  { id: 11, name: "Ingredient focus — UGC v1", platform: "Meta", status: "Testing", budget: 150, spend: 38, revenue: 54, impressions: 8900, clicks: 124, orders: 1, roas: 1.4, cpa: 38, ctr: 1.39, cpc: 0.31, cpm: 4.27 },
  { id: 12, name: "Zomer routine — Static", platform: "Meta", status: "Dead", budget: 200, spend: 178, revenue: 89, impressions: 44200, clicks: 398, orders: 1, roas: 0.5, cpa: 178, ctr: 0.90, cpc: 0.45, cpm: 4.03 },
];

const STATUS_FILTERS = ["All", "Active", "Winner", "Testing", "Dead"] as const;
const PLATFORM_FILTERS = ["All platforms", "Meta", "Email"] as const;

type SortKey = keyof Campaign | "trueRoas";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// True ROAS helper
// ---------------------------------------------------------------------------

function getTrueRoas(c: Campaign): number {
  const cogs = c.revenue * 0.25;
  const totalCost = c.spend + cogs;
  return totalCost > 0 ? c.revenue / totalCost : 0;
}

// ---------------------------------------------------------------------------
// Sortable columns config
// ---------------------------------------------------------------------------

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "Naam", align: "left" },
  { key: "status", label: "Status", align: "left" },
  { key: "platform", label: "Platform", align: "left" },
  { key: "spend", label: "Spend", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "roas", label: "ROAS", align: "right" },
  { key: "cpa", label: "CPA", align: "right" },
  { key: "ctr", label: "CTR", align: "right" },
  { key: "cpc", label: "CPC", align: "right" },
  { key: "cpm", label: "CPM", align: "right" },
  { key: "impressions", label: "Impressies", align: "right" },
  { key: "clicks", label: "Clicks", align: "right" },
  { key: "orders", label: "Orders", align: "right" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [platformFilter, setPlatformFilter] = useState<string>("All platforms");
  const [sortKey, setSortKey] = useState<SortKey>("roas");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showTrueRoas, setShowTrueRoas] = useState(false);

  // When toggling True ROAS, update the ROAS column label dynamically
  const columns = useMemo(() => {
    return COLUMNS.map((col) =>
      col.key === "roas" ? { ...col, label: showTrueRoas ? "True ROAS" : "ROAS" } : col
    );
  }, [showTrueRoas]);

  const filtered = useMemo(() => {
    return CAMPAIGNS.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (platformFilter !== "All platforms" && c.platform !== platformFilter) return false;
      return true;
    });
  }, [statusFilter, platformFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "trueRoas" || (sortKey === "roas" && showTrueRoas)) {
        const aVal = getTrueRoas(a);
        const bVal = getTrueRoas(b);
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aVal = a[sortKey as keyof Campaign];
      const bVal = b[sortKey as keyof Campaign];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortKey, sortDir, showTrueRoas]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  // Summary stats (from filtered set)
  const totalSpend = filtered.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = filtered.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = filtered.reduce((s, c) => s + c.orders, 0);
  const avgRoas = filtered.length > 0 ? filtered.reduce((s, c) => s + c.roas, 0) / filtered.length : 0;
  const avgTrueRoas = filtered.length > 0 ? filtered.reduce((s, c) => s + getTrueRoas(c), 0) / filtered.length : 0;
  const activeCampaigns = filtered.filter((c) => c.status === "Active" || c.status === "Winner" || c.status === "Testing").length;

  // Totals row
  const totals = useMemo(() => {
    if (filtered.length === 0) return null;
    const len = filtered.length;
    return {
      spend: filtered.reduce((s, c) => s + c.spend, 0),
      revenue: filtered.reduce((s, c) => s + c.revenue, 0),
      impressions: filtered.reduce((s, c) => s + c.impressions, 0),
      clicks: filtered.reduce((s, c) => s + c.clicks, 0),
      orders: filtered.reduce((s, c) => s + c.orders, 0),
      roas: filtered.reduce((s, c) => s + c.roas, 0) / len,
      trueRoas: filtered.reduce((s, c) => s + getTrueRoas(c), 0) / len,
      cpa: filtered.reduce((s, c) => s + c.cpa, 0) / len,
      ctr: filtered.reduce((s, c) => s + c.ctr, 0) / len,
      cpc: filtered.reduce((s, c) => s + c.cpc, 0) / len,
      cpm: filtered.reduce((s, c) => s + c.cpm, 0) / len,
    };
  }, [filtered]);

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-medium text-[#1A1A18] mb-6">Campagnes</h1>

      {/* Summary bar */}
      <div className="flex items-center gap-0 mb-8 text-sm">
        <SummaryStat label="Totaal spend" value={`$${fmt(totalSpend)}`} />
        <Divider />
        <SummaryStat label="Totaal revenue" value={`$${fmt(totalRevenue)}`} color="text-[#1A6B3C]" />
        <Divider />
        <SummaryStat label={showTrueRoas ? "Gem. True ROAS" : "Gem. ROAS"} value={`${(showTrueRoas ? avgTrueRoas : avgRoas).toFixed(2)}x`} />
        <Divider />
        <SummaryStat label="Totaal orders" value={totalOrders.toString()} />
        <Divider />
        <SummaryStat label="Actieve campagnes" value={activeCampaigns.toString()} />
      </div>

      {/* Filter row 1: Status */}
      <div className="flex gap-2 mb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === f
                ? "bg-[#1A1A18] text-white"
                : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Filter row 2: Platform + True ROAS toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {PLATFORM_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setPlatformFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                platformFilter === f
                  ? "bg-[#1A1A18] text-white"
                  : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* True ROAS toggle */}
        <button
          onClick={() => setShowTrueRoas((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
            showTrueRoas
              ? "bg-[#1A6B3C] text-white border-[#1A6B3C]"
              : "bg-white text-[#8C8A84] border-[#E8E6E1] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
          }`}
        >
          <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${showTrueRoas ? "border-white" : "border-[#8C8A84]"}`}>
            {showTrueRoas && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </span>
          True ROAS
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E8E6E1] bg-white">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-[#8C8A84]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 font-medium cursor-pointer select-none hover:text-[#1A1A18] transition-colors ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.key === "roas" ? "w-[160px]" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-[10px] text-[#1A1A18]">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <CampaignRow key={c.id} campaign={c} showTrueRoas={showTrueRoas} />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-[#8C8A84]">
                  Geen campagnes gevonden
                </td>
              </tr>
            )}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="border-t-2 border-[#0F0F0D] bg-white font-semibold text-[#1A1A18]">
                <td className="px-4 py-3">Totaal / Gem.</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right">${fmt(totals.spend)}</td>
                <td className="px-4 py-3 text-right">${fmt(totals.revenue)}</td>
                <td className="px-4 py-3 text-right">
                  {(showTrueRoas ? totals.trueRoas : totals.roas).toFixed(2)}x
                </td>
                <td className="px-4 py-3 text-right">${fmt(totals.cpa)}</td>
                <td className="px-4 py-3 text-right">{totals.ctr.toFixed(2)}%</td>
                <td className="px-4 py-3 text-right">${totals.cpc.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">${totals.cpm.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{totals.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{totals.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{totals.orders.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CampaignRow({ campaign: c, showTrueRoas }: { campaign: Campaign; showTrueRoas: boolean }) {
  const isWinner = c.status === "Winner";
  const isDead = c.status === "Dead";

  const displayRoas = showTrueRoas ? getTrueRoas(c) : c.roas;
  const roasThresholdHigh = showTrueRoas ? 2.5 : 3;
  const roasThresholdMid = showTrueRoas ? 1.8 : 2;

  const roasTextColor = displayRoas >= roasThresholdHigh ? "text-[#1A6B3C]" : displayRoas >= roasThresholdMid ? "text-[#8B6020]" : "text-[#8B2020]";
  const roasBarColor = displayRoas >= roasThresholdHigh ? "bg-[#1A6B3C]" : displayRoas >= roasThresholdMid ? "bg-[#8B6020]" : "bg-[#8B2020]";
  const roasWidth = Math.min((displayRoas / 5) * 100, 100);

  const cpaColor = c.cpa < 25 ? "text-[#1A6B3C]" : c.cpa < 40 ? "text-[#8B6020]" : "text-[#8B2020]";
  const ctrColor = c.ctr > 2 ? "text-[#1A6B3C]" : c.ctr > 1.5 ? "text-[#8B6020]" : "text-[#8B2020]";

  return (
    <tr
      className={`border-b border-[#E8E6E1] ${
        isWinner ? "bg-[#F0FDF4]" : ""
      } ${isDead ? "opacity-50" : ""}`}
    >
      <td className="px-4 py-3 font-medium text-[#1A1A18]">{c.name}</td>
      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
      <td className="px-4 py-3 text-[#8C8A84]">{c.platform}</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">${fmt(c.spend)}</td>
      <td className="px-4 py-3 text-right text-[#1A6B3C]">${fmt(c.revenue)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <span className={`text-sm font-semibold w-12 text-right ${roasTextColor}`}>{displayRoas.toFixed(1)}x</span>
          <div className="w-16 h-1.5 rounded-full bg-[#E8E6E1] overflow-hidden">
            <div className={`h-full rounded-full ${roasBarColor}`} style={{ width: `${roasWidth}%` }} />
          </div>
        </div>
      </td>
      <td className={`px-4 py-3 text-right font-medium ${cpaColor}`}>${fmt(c.cpa)}</td>
      <td className={`px-4 py-3 text-right font-medium ${ctrColor}`}>{c.ctr.toFixed(2)}%</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">${c.cpc.toFixed(2)}</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">${c.cpm.toFixed(2)}</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">{c.impressions.toLocaleString()}</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">{c.clicks.toLocaleString()}</td>
      <td className="px-4 py-3 text-right text-[#1A1A18]">{c.orders}</td>
    </tr>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="px-5">
      <p className="text-xs text-[#8C8A84]">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${color ?? "text-[#1A1A18]"}`}>
        {value}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-9 bg-[#E8E6E1]" />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "text-[#1A6B3C] bg-[#E8F5EE]",
    Winner: "text-[#1A6B3C] bg-[#E8F5EE]",
    Paused: "text-[#8B6020] bg-[#FEF3E2]",
    Testing: "text-[#1A4B6B] bg-[#E8EFF5]",
    Dead: "text-[#8B2020] bg-[#FDEAEA]",
  };
  const cls = colors[status] ?? "text-[#8C8A84] bg-[#F5F5F0]";

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
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
