"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Creative {
  id: string;
  name: string;
  type: string;
  hook: string;
  angle: string;
  status: string;
  ctr: number;
  cpa: number;
  campaign: string;
}

interface MockupConfig {
  gradient: string;
  overlayContent: React.ReactNode;
}

const CREATIVES: Creative[] = [
  { id: "cr1", name: "UGC v3 — Ochtend routine", type: "UGC", hook: "Ik gebruik dit elke ochtend al 6 maanden", angle: "Routine", status: "Winner", ctr: 3.2, cpa: 24, campaign: "Collageen Serum — UGC v3" },
  { id: "cr2", name: "Static — Voor na vergelijking", type: "Static", hook: "Zo ziet je huid eruit na 30 dagen", angle: "Social proof", status: "Winner", ctr: 2.8, cpa: 28, campaign: "Anti-aging — Social proof" },
  { id: "cr3", name: "UGC v1 — Ingrediënten uitleg", type: "UGC", hook: "Dit zit er in en daarom werkt het", angle: "Science", status: "Testing", ctr: 1.4, cpa: 44, campaign: "Routine — Statisch" },
  { id: "cr4", name: "Video — Unboxing", type: "Video", hook: "Ik bestelde dit en dit kreeg ik...", angle: "Lifestyle", status: "Testing", ctr: 1.9, cpa: 38, campaign: "Collageen Serum — UGC v3" },
  { id: "cr5", name: "Static — Bundel aanbieding", type: "Static", hook: "Bespaar 30% op je skincareroutine", angle: "Offer", status: "Dead", ctr: 0.6, cpa: 89, campaign: "Bundle deal — UGC v1" },
  { id: "cr6", name: "UGC v2 — Klantreview", type: "UGC", hook: "Ik was sceptisch maar dit veranderde alles", angle: "Social proof", status: "Active", ctr: 2.1, cpa: 33, campaign: "Anti-aging — Social proof" },
];

const TYPE_FILTERS = ["All", "UGC", "Static", "Video"] as const;
const STATUS_FILTERS = ["All", "Winner", "Active", "Testing", "Dead"] as const;

// ---------------------------------------------------------------------------
// Mockup configs per creative
// ---------------------------------------------------------------------------

function getMockup(id: string): MockupConfig {
  switch (id) {
    case "cr1":
      return {
        gradient: "linear-gradient(135deg, #F5E6D3 0%, #E8C4B8 100%)",
        overlayContent: (
          <>
            <span className="absolute top-3 left-3 text-[10px] text-[#1A1A18]/50 font-medium">@ugc_creator</span>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
              <p className="text-white text-xs leading-relaxed">&ldquo;Ik gebruik dit elke ochtend al 6 maanden&rdquo;</p>
            </div>
          </>
        ),
      };
    case "cr2":
      return {
        gradient: "#FAF7F2",
        overlayContent: (
          <>
            <span className="absolute top-3 left-0 right-0 text-center text-[10px] text-[#8C8A84] tracking-[0.15em] uppercase">RealProfit</span>
            <div className="flex items-center justify-center gap-3 h-full">
              <span className="text-[#1A1A18] text-sm font-medium">VOOR</span>
              <span className="text-[#8C8A84] text-lg">&rarr;</span>
              <span className="text-[#1A1A18] text-sm font-medium">NA</span>
            </div>
            <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-[#8C8A84]">30 dagen resultaat</span>
          </>
        ),
      };
    case "cr3":
      return {
        gradient: "linear-gradient(135deg, #D4E8D0 0%, #B8D4B0 100%)",
        overlayContent: (
          <>
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="flex gap-1.5">
                {["Retinol", "Vit C", "Niacinamide"].map((i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-[#1A1A18]/70">{i}</span>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/30 to-transparent">
              <p className="text-white text-xs leading-relaxed">&ldquo;Dit zit er in en daarom werkt het&rdquo;</p>
            </div>
          </>
        ),
      };
    case "cr4":
      return {
        gradient: "#1A1A1A",
        overlayContent: (
          <>
            <div className="flex items-center justify-center h-full">
              <div className="w-[60px] h-[60px] rounded-full border-2 border-white/80 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white/80 border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
            <span className="absolute bottom-3 right-3 text-[10px] text-white/40 font-medium tabular-nums">0:45</span>
            <div className="absolute bottom-0 left-0 right-0 p-3 pb-6 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white/80 text-xs">&ldquo;Ik bestelde dit en dit kreeg ik...&rdquo;</p>
            </div>
          </>
        ),
      };
    case "cr5":
      return {
        gradient: "#E8E4DC",
        overlayContent: (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <span className="text-[#1A1A18]/30 text-xs line-through">&euro;89,95</span>
            <span className="text-[#1A1A18]/60 text-2xl font-semibold">30% KORTING</span>
            <span className="text-[#1A1A18]/30 text-[10px]">Bundel aanbieding</span>
          </div>
        ),
      };
    case "cr6":
      return {
        gradient: "linear-gradient(135deg, #F2E0E0 0%, #E8C8C8 100%)",
        overlayContent: (
          <>
            <div className="flex items-center justify-center h-full px-4">
              <p className="text-[#1A1A18]/70 text-sm text-center leading-relaxed">
                &ldquo;Ik was sceptisch maar dit veranderde alles&rdquo;
              </p>
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-[#8B6020] text-xs">&#9733;</span>
              ))}
            </div>
          </>
        ),
      };
    default:
      return {
        gradient: "#F5F5F0",
        overlayContent: null,
      };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CreativesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [previewCreative, setPreviewCreative] = useState<Creative | null>(null);

  const filtered = CREATIVES.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    return true;
  });

  const winners = CREATIVES.filter((c) => c.status === "Winner").length;
  const testing = CREATIVES.filter((c) => c.status === "Testing").length;
  const dead = CREATIVES.filter((c) => c.status === "Dead").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Creatives</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-[#1A6B3C]">{winners} Winners</span>
          <span className="text-[#1A4B6B]">{testing} Testing</span>
          <span className="text-[#8B2020]">{dead} Dead</span>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 mb-3">
        <span className="text-xs text-[#8C8A84] self-center mr-1">Type:</span>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              typeFilter === f
                ? "bg-[#1A1A18] text-white"
                : "text-[#8C8A84] hover:text-[#1A1A18] hover:bg-[#F5F5F0]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-8">
        <span className="text-xs text-[#8C8A84] self-center mr-1">Status:</span>
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

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CreativeCard key={c.id} creative={c} onPreview={() => setPreviewCreative(c)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-[#8C8A84] py-12">
            Geen creatives gevonden
          </p>
        )}
      </div>

      {/* Preview Modal */}
      {previewCreative && (
        <PreviewModal creative={previewCreative} onClose={() => setPreviewCreative(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function AdMockup({ creativeId, height }: { creativeId: string; height: string }) {
  const mockup = getMockup(creativeId);

  return (
    <div
      className={`relative w-full ${height} rounded-t-lg overflow-hidden`}
      style={{ background: mockup.gradient }}
    >
      {mockup.overlayContent}
    </div>
  );
}

function CreativeCard({ creative: c, onPreview }: { creative: Creative; onPreview: () => void }) {
  const isWinner = c.status === "Winner";
  const isDead = c.status === "Dead";

  const typeBadgeColors: Record<string, string> = {
    UGC: "text-[#6B1A6B] bg-[#F5E8F5]",
    Static: "text-[#1A4B6B] bg-[#E8EFF5]",
    Video: "text-[#8B6020] bg-[#FEF3E2]",
  };

  const statusBadgeColors: Record<string, string> = {
    Winner: "text-[#1A6B3C] bg-[#E8F5EE]",
    Active: "text-[#1A6B3C] bg-[#E8F5EE]",
    Testing: "text-[#1A4B6B] bg-[#E8EFF5]",
    Dead: "text-[#8B2020] bg-[#FDEAEA]",
  };

  return (
    <div
      className={`rounded-lg border overflow-hidden flex flex-col ${
        isWinner
          ? "border-[#1A6B3C]/30 bg-[#F0F9F4]"
          : "bg-white border-[#E8E6E1]"
      } ${isDead ? "opacity-50" : ""}`}
    >
      {/* Ad mockup visual */}
      <AdMockup creativeId={c.id} height="h-[180px]" />

      {/* Card content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Type + status badges */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded ${typeBadgeColors[c.type] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
            {c.type}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeColors[c.status] ?? "text-[#8C8A84] bg-[#F5F5F0]"}`}>
            {c.status}
          </span>
        </div>

        {/* Hook */}
        <p className="text-sm text-[#1A1A18]/90 leading-relaxed">
          &ldquo;{c.hook}&rdquo;
        </p>

        {/* Angle */}
        <span className="text-xs text-[#8C8A84] bg-[#F5F5F0] px-2 py-0.5 rounded self-start">
          {c.angle}
        </span>

        {/* Metrics */}
        <div className="flex gap-6 pt-2 border-t border-[#E8E6E1]">
          <div>
            <p className="text-[10px] text-[#8C8A84] uppercase">CTR</p>
            <p className={`text-sm font-semibold tabular-nums ${c.ctr >= 2.5 ? "text-[#1A6B3C]" : c.ctr >= 1.5 ? "text-[#1A1A18]" : "text-[#8B2020]"}`}>
              {c.ctr.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#8C8A84] uppercase">CPA</p>
            <p className={`text-sm font-semibold tabular-nums ${c.cpa < 30 ? "text-[#1A6B3C]" : c.cpa < 45 ? "text-[#1A1A18]" : "text-[#8B2020]"}`}>
              ${c.cpa}
            </p>
          </div>
        </div>

        {/* Campaign + Fullscreen button */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#8C8A84]">{c.campaign}</p>
          <button
            onClick={onPreview}
            className="text-xs text-[#1A4B6B] hover:text-[#1A1A18] transition-colors font-medium"
          >
            Volledig scherm
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ creative, onClose }: { creative: Creative; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[400px] mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-light transition-colors"
        >
          &times;
        </button>

        {/* Large mockup */}
        <div className="rounded-lg overflow-hidden">
          <AdMockup creativeId={creative.id} height="h-[400px]" />
        </div>

        {/* Info bar below */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <span className="text-white/60">CTR: <span className="text-white font-medium tabular-nums">{creative.ctr.toFixed(1)}%</span></span>
            <span className="text-white/60">CPA: <span className="text-white font-medium tabular-nums">${creative.cpa}</span></span>
          </div>
          <span className="text-white/40 text-xs">{creative.type} &middot; {creative.status}</span>
        </div>
      </div>
    </div>
  );
}
