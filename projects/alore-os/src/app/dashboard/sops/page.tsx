"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Sop {
  id: number;
  category: string;
  title: string;
  status: string;
  steps: number;
  lastUpdated: string;
  description: string;
}

const SOPS: Sop[] = [
  { id: 1, category: "Ads", title: "Meta campagne lanceren", status: "Live", steps: 7, lastUpdated: "2026-03-10", description: "Checklist voor het live zetten van een nieuwe Meta campagne inclusief creative review, targeting en budgetinstelling." },
  { id: 2, category: "Ads", title: "Creative briefing — UGC", status: "Live", steps: 5, lastUpdated: "2026-03-08", description: "Standaard briefing format voor UGC creators. Hook, angle, dos and don'ts, en deliverables." },
  { id: 3, category: "Retention", title: "At-risk klant reactivatie", status: "Live", steps: 4, lastUpdated: "2026-03-01", description: "Flow voor klanten die >45 dagen niet besteld hebben. Klaviyo sequence + handmatige opvolging." },
  { id: 4, category: "Retention", title: "Subscription churn opvolging", status: "Live", steps: 3, lastUpdated: "2026-02-20", description: "Wat te doen als iemand een abonnement opzegt. Exit survey, win-back offer, offboarding." },
  { id: 5, category: "Fulfillment", title: "Order fulfillment checklist", status: "Live", steps: 6, lastUpdated: "2026-03-05", description: "Van Shopify order tot verzending. Verpakking, tracking mail, kwaliteitscheck." },
  { id: 6, category: "Reporting", title: "Weekly KPI review", status: "Draft", steps: 4, lastUpdated: "2026-03-15", description: "Elke maandag: KPI's reviewen, winners schalen, verliezers pauzeren, acties bepalen voor de week." },
  { id: 7, category: "Reporting", title: "Maandelijkse P&L review", status: "Draft", steps: 5, lastUpdated: "2026-03-01", description: "Maandelijkse financiële review: revenue, COGS, ad spend, netto marge, LTV vs CAC." },
];

const FILTERS = ["All", "Ads", "Retention", "Fulfillment", "Reporting"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Ads: "text-[#6B1A6B] bg-[#F5E8F5]",
  Retention: "text-[#1A4B6B] bg-[#E8EFF5]",
  Fulfillment: "text-[#1A4B6B] bg-[#E8EFF5]",
  Reporting: "text-[#8B6020] bg-[#FEF3E2]",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SopsPage() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All"
    ? SOPS
    : SOPS.filter((s) => s.category === filter);

  const liveCount = SOPS.filter((s) => s.status === "Live").length;
  const draftCount = SOPS.filter((s) => s.status === "Draft").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">SOPs</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-[#1A6B3C]">{liveCount} Live</span>
          <span className="text-[#8B6020]">{draftCount} Draft</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? "bg-[#1A1A18] text-white"
                : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((sop) => (
          <SopCard key={sop.id} sop={sop} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-[#8C8A84] py-12">
            Geen SOPs gevonden
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SopCard({ sop }: { sop: Sop }) {
  const isLive = sop.status === "Live";

  return (
    <div className="rounded-lg border border-[#E8E6E1] bg-white p-5 flex flex-col gap-3 hover:border-[#C8C6C1] transition-colors cursor-pointer">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[sop.category] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
          {sop.category}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          isLive ? "text-[#1A6B3C] bg-[#E8F5EE]" : "text-[#8B6020] bg-[#FEF3E2]"
        }`}>
          {sop.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-[#1A1A18]">{sop.title}</h3>

      {/* Description */}
      <p className="text-sm text-[#8C8A84] leading-relaxed">{sop.description}</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E8E6E1] text-xs text-[#8C8A84]">
        <span>{sop.steps} stappen</span>
        <span>{formatDate(sop.lastUpdated)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
