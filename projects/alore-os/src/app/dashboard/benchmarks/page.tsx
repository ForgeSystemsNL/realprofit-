// ---------------------------------------------------------------------------
// Benchmarks — /dashboard/benchmarks
// ---------------------------------------------------------------------------

const BENCHMARKS = [
  { label: "ROAS", value: 2.96, benchmark: 2.5, unit: "x", good: "above" as const },
  { label: "CPA", value: 60, benchmark: 45, unit: "€", good: "below" as const },
  { label: "CTR", value: 1.8, benchmark: 1.5, unit: "%", good: "above" as const },
  { label: "Winstmarge", value: 23.7, benchmark: 20, unit: "%", good: "above" as const },
  { label: "MER", value: 2.96, benchmark: 2.0, unit: "x", good: "above" as const },
  { label: "AOV", value: 64, benchmark: 55, unit: "€", good: "above" as const },
  { label: "E-mail ROAS", value: 6.5, benchmark: 4.0, unit: "x", good: "above" as const },
  { label: "Retentie (90d)", value: 22, benchmark: 25, unit: "%", good: "above" as const },
  { label: "COGS %", value: 31, benchmark: 35, unit: "%", good: "below" as const },
];

function getStatus(b: (typeof BENCHMARKS)[number]) {
  if (b.good === "above") return b.value >= b.benchmark ? "good" : "bad";
  return b.value <= b.benchmark ? "good" : "bad";
}

function pct(value: number, benchmark: number) {
  return Math.round((value / benchmark) * 100);
}

export default function BenchmarksPage() {
  const good = BENCHMARKS.filter((b) => getStatus(b) === "good").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Benchmarks</h1>
        <p className="text-sm text-[#8C8A84] mt-1">
          Jouw prestaties vs. skincare e-commerce gemiddelden
        </p>
      </div>

      {/* Verdict summary */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1A6B3C]/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-[#1A6B3C]">{good}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A18]">
              {good} van de {BENCHMARKS.length} benchmarks gehaald
            </p>
            <p className="text-xs text-[#8C8A84] mt-0.5">
              {good >= 7
                ? "Uitstekend — je scoort bovengemiddeld op bijna alle metrics."
                : good >= 5
                  ? "Goed — ruimte voor verbetering op een paar gebieden."
                  : "Aandacht nodig — meerdere metrics onder benchmark."}
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark cards — 3×3 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BENCHMARKS.map((b) => {
          const status = getStatus(b);
          const percentage = pct(b.value, b.benchmark);
          const barWidth = Math.min(percentage, 150); // cap visual bar

          return (
            <div
              key={b.label}
              className="bg-white border border-[#E8E6E1] rounded-xl p-5"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-[#8C8A84]">{b.label}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    status === "good"
                      ? "bg-[#1A6B3C]/10 text-[#1A6B3C]"
                      : "bg-[#8B2020]/10 text-[#8B2020]"
                  }`}
                >
                  {status === "good" ? "Boven benchmark" : "Onder benchmark"}
                </span>
              </div>

              {/* Value */}
              <p className="text-2xl font-semibold tabular-nums text-[#1A1A18]">
                {b.unit === "€" && "€"}
                {b.value}
                {b.unit === "%" && "%"}
                {b.unit === "x" && "x"}
              </p>

              {/* Comparison bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-[#8C8A84] mb-1.5">
                  <span>Jij</span>
                  <span>
                    Benchmark: {b.unit === "€" && "€"}
                    {b.benchmark}
                    {b.unit === "%" && "%"}
                    {b.unit === "x" && "x"}
                  </span>
                </div>
                <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden relative">
                  {/* Benchmark line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[#8C8A84]/40"
                    style={{ left: `${Math.min((100 / Math.max(percentage, 100)) * 100, 100)}%` }}
                  />
                  {/* Value bar */}
                  <div
                    className={`h-full rounded-full transition-all ${
                      status === "good" ? "bg-[#1A6B3C]" : "bg-[#8B2020]"
                    }`}
                    style={{ width: `${Math.min(barWidth, 100)}%` }}
                  />
                </div>
              </div>

              {/* Delta */}
              <p className={`text-xs mt-2 ${status === "good" ? "text-[#1A6B3C]" : "text-[#8B2020]"}`}>
                {status === "good" ? "+" : ""}
                {b.good === "above"
                  ? ((b.value - b.benchmark) / b.benchmark * 100).toFixed(0)
                  : ((b.benchmark - b.value) / b.benchmark * 100).toFixed(0)}
                % vs. benchmark
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
