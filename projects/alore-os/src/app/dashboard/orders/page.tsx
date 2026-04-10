"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Order {
  id: string;
  email: string;
  name: string;
  total: number;
  products: string[];
  status: string;
  date: string;
  source: string;
}

const ORDERS: Order[] = [
  { id: "ORD-1042", email: "l.vandam@gmail.com", name: "Linda van Dam", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-19", source: "Meta" },
  { id: "ORD-1041", email: "p.meijer@gmail.com", name: "Patricia Meijer", total: 134, products: ["Collageen Serum", "Bundle"], status: "Shipped", date: "2026-03-18", source: "Email" },
  { id: "ORD-1040", email: "k.visser@hotmail.com", name: "Karin Visser", total: 54, products: ["Collageen Serum"], status: "Processing", date: "2026-03-18", source: "Organic" },
  { id: "ORD-1039", email: "r.smit@icloud.com", name: "Rianne Smit", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-17", source: "Meta" },
  { id: "ORD-1038", email: "a.vanderBerg@gmail.com", name: "Anita van den Berg", total: 54, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-17", source: "Meta" },
  { id: "ORD-1037", email: "m.dejong@gmail.com", name: "Marieke de Jong", total: 178, products: ["Bundle", "Collageen Serum"], status: "Delivered", date: "2026-03-16", source: "Email" },
  { id: "ORD-1036", email: "nieuw@gmail.com", name: "Femke Janssen", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-15", source: "Meta" },
  { id: "ORD-1035", email: "s.bakker@hotmail.com", name: "Sandra Bakker", total: 54, products: ["Collageen Serum"], status: "Refunded", date: "2026-03-14", source: "Meta" },
  { id: "ORD-1034", email: "h.boot@gmail.com", name: "Hanna Boot", total: 134, products: ["Bundle"], status: "Delivered", date: "2026-03-13", source: "Organic" },
  { id: "ORD-1033", email: "l.vandam@gmail.com", name: "Linda van Dam", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-10", source: "Email" },
  { id: "ORD-1032", email: "p.meijer@gmail.com", name: "Patricia Meijer", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-08", source: "Meta" },
  { id: "ORD-1031", email: "t.devries@gmail.com", name: "Tineke de Vries", total: 54, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-06", source: "Meta" },
  { id: "ORD-1030", email: "r.smit@icloud.com", name: "Rianne Smit", total: 178, products: ["Bundle", "Collageen Serum"], status: "Delivered", date: "2026-03-04", source: "Email" },
  { id: "ORD-1029", email: "c.wolf@gmail.com", name: "Carla Wolf", total: 89, products: ["Collageen Serum"], status: "Delivered", date: "2026-03-02", source: "Meta" },
  { id: "ORD-1028", email: "m.dejong@gmail.com", name: "Marieke de Jong", total: 54, products: ["Collageen Serum"], status: "Delivered", date: "2026-02-28", source: "Organic" },
];

const STATUS_FILTERS = ["All", "Delivered", "Shipped", "Processing", "Refunded"] as const;
const SOURCE_FILTERS = ["All", "Meta", "Email", "Organic"] as const;

const STATUS_COLORS: Record<string, string> = {
  Delivered: "text-[#1A6B3C] bg-[#E8F5EE]",
  Shipped: "text-[#1A4B6B] bg-[#E8EFF5]",
  Processing: "text-[#8B6020] bg-[#FEF3E2]",
  Refunded: "text-[#8B2020] bg-[#FDEAEA]",
};

const SOURCE_COLORS: Record<string, string> = {
  Meta: "text-[#1A4B6B] bg-[#E8EFF5]",
  Email: "text-[#6B1A6B] bg-[#F5E8F5]",
  Organic: "text-[#8C8A84] bg-[#F5F5F0]",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");

  const filtered = ORDERS.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (sourceFilter !== "All" && o.source !== sourceFilter) return false;
    return true;
  });

  const totalRevenue = ORDERS.reduce((s, o) => s + o.total, 0);
  const aov = ORDERS.length > 0 ? totalRevenue / ORDERS.length : 0;
  const refunds = ORDERS.filter((o) => o.status === "Refunded").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-4 text-[#1A1A18]">Orders</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Totaal orders" value={ORDERS.length.toString()} />
          <SummaryCard label="Totaal revenue" value={`$${fmt(totalRevenue)}`} color="emerald" />
          <SummaryCard label="Gemiddelde AOV" value={`$${fmt(aov)}`} />
          <SummaryCard label="Refunds" value={refunds.toString()} color={refunds > 0 ? "red" : "white"} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-[#8C8A84]">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === f ? "bg-[#1A1A18] text-white" : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-[#8C8A84]">Source:</span>
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sourceFilter === f ? "bg-[#1A1A18] text-white" : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E8E6E1] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Klant</th>
              <th className="px-4 py-3">Producten</th>
              <th className="px-4 py-3 text-right">Bedrag</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Datum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-[#E8E6E1]/50">
                <td className="px-4 py-3 font-mono text-xs text-[#8C8A84]">{o.id}</td>
                <td className="px-4 py-3 text-[#1A1A18]">
                  <div>{o.name}</div>
                  <div className="text-xs text-[#8C8A84]">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-[#8C8A84]">{o.products.join(", ")}</td>
                <td className="px-4 py-3 text-right font-medium text-[#1A1A18]">${fmt(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${SOURCE_COLORS[o.source] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
                    {o.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${STATUS_COLORS[o.status] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8C8A84]">{formatDate(o.date)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[#8C8A84]">
                  Geen orders gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SummaryCard({ label, value, color = "white" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    white: "text-[#1A1A18]",
    emerald: "text-[#1A6B3C]",
    red: "text-[#8B2020]",
  };
  return (
    <div className="rounded-lg border border-[#E8E6E1] bg-white p-4">
      <p className="text-xs text-[#8C8A84] mb-1">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${colors[color] ?? "text-[#1A1A18]"}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
