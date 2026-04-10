// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface FixedCost {
  name: string;
  category: string;
  amount: number;
  billing: string;
}

interface VariableCost {
  name: string;
  category: string;
  amount: number;
  note: string;
}

const FIXED_COSTS: FixedCost[] = [
  { name: "Shopify Advanced", category: "Platform", amount: 299, billing: "Monthly" },
  { name: "Klaviyo", category: "Email", amount: 150, billing: "Monthly" },
  { name: "Triple Whale", category: "Analytics", amount: 129, billing: "Monthly" },
  { name: "PageFly", category: "Apps", amount: 89, billing: "Monthly" },
  { name: "ReCharge", category: "Subscriptions", amount: 99, billing: "Monthly" },
  { name: "Postscript SMS", category: "Marketing", amount: 75, billing: "Monthly" },
  { name: "Gorgias", category: "Support", amount: 60, billing: "Monthly" },
  { name: "VA - Klantenservice", category: "Team", amount: 600, billing: "Monthly" },
  { name: "VA - Operations", category: "Team", amount: 400, billing: "Monthly" },
  { name: "Boekhouder", category: "Finance", amount: 250, billing: "Monthly" },
];

const VARIABLE_COSTS: VariableCost[] = [
  { name: "iDeal transactiekosten", category: "Payment", amount: 89, note: "1.2% van NL orders" },
  { name: "PayPal fees", category: "Payment", amount: 67, note: "2.9% + €0.35 per transactie" },
  { name: "Creditcard fees", category: "Payment", amount: 97, note: "1.8% van CC orders" },
  { name: "Chargebacks", category: "Payment", amount: 45, note: "3 disputes × €15" },
  { name: "Retourzendingen", category: "Fulfillment", amount: 180, note: "6 returns × €30 COGS" },
];

const TOTAL_FIXED = FIXED_COSTS.reduce((s, c) => s + c.amount, 0);
const TOTAL_VARIABLE = VARIABLE_COSTS.reduce((s, c) => s + c.amount, 0);
const TOTAL_ALL = TOTAL_FIXED + TOTAL_VARIABLE;
const LAST_MONTH_REVENUE = 29600;

const CATEGORY_BADGE: Record<string, string> = {
  Platform: "text-[#8C8A84] bg-[#F5F5F0]",
  Email: "text-[#1A4B6B] bg-[#E8EFF5]",
  Analytics: "text-[#1A4B6B] bg-[#E8EFF5]",
  Apps: "text-[#6B1A6B] bg-[#F5E8F5]",
  Subscriptions: "text-[#6B1A6B] bg-[#F5E8F5]",
  Marketing: "text-[#6B1A6B] bg-[#F5E8F5]",
  Support: "text-[#1A4B6B] bg-[#E8EFF5]",
  Team: "text-[#8B6020] bg-[#FEF3E2]",
  Finance: "text-[#1A6B3C] bg-[#E8F5EE]",
  Payment: "text-[#8B2020] bg-[#FDEAEA]",
  Fulfillment: "text-[#8B6020] bg-[#FEF3E2]",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CostsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Kosten</h1>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-[#8C8A84]">Vaste kosten/mo</p>
            <p className="text-lg font-semibold tabular-nums text-[#1A1A18]">&euro;{fmt(TOTAL_FIXED)}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Variabel deze maand</p>
            <p className="text-lg font-semibold tabular-nums text-[#1A1A18]">&euro;{fmt(TOTAL_VARIABLE)}</p>
          </div>
        </div>
      </div>

      {/* Fixed Costs */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Vaste kosten</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3 text-right">Bedrag</th>
                <th className="px-4 py-3 text-right">% van revenue</th>
              </tr>
            </thead>
            <tbody>
              {FIXED_COSTS.map((c) => (
                <tr key={c.name} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-3 text-[#1A1A18] font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={c.category} />
                  </td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-right text-[#8C8A84]">
                    {((c.amount / LAST_MONTH_REVENUE) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E8E6E1] bg-[#F5F5F0] font-semibold">
                <td className="px-4 py-3 text-[#1A1A18]" colSpan={2}>Totaal vaste kosten</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(TOTAL_FIXED)}</td>
                <td className="px-4 py-3 text-right text-[#8C8A84]">
                  {((TOTAL_FIXED / LAST_MONTH_REVENUE) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Variable Costs */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-[#1A1A18] mb-4">Variabele kosten</h2>
        <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3 text-right">Bedrag</th>
                <th className="px-4 py-3">Notitie</th>
              </tr>
            </thead>
            <tbody>
              {VARIABLE_COSTS.map((c) => (
                <tr key={c.name} className="border-b border-[#E8E6E1]/50">
                  <td className="px-4 py-3 text-[#1A1A18] font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={c.category} />
                  </td>
                  <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-[#8C8A84]">{c.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E8E6E1] bg-[#F5F5F0] font-semibold">
                <td className="px-4 py-3 text-[#1A1A18]" colSpan={2}>Totaal variabel</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">&euro;{fmt(TOTAL_VARIABLE)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Total Cost Summary */}
      <section className="mb-10">
        <div className="rounded-lg border border-[#E8E6E1] bg-white p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#8C8A84] mb-1">Vast</p>
              <p className="text-xl font-semibold tabular-nums text-[#1A1A18]">&euro;{fmt(TOTAL_FIXED)}/mo</p>
            </div>
            <div>
              <p className="text-xs text-[#8C8A84] mb-1">Variabel</p>
              <p className="text-xl font-semibold tabular-nums text-[#1A1A18]">&euro;{fmt(TOTAL_VARIABLE)}/mo</p>
            </div>
            <div>
              <p className="text-xs text-[#8C8A84] mb-1">Totaal</p>
              <p className="text-xl font-semibold tabular-nums text-[#1A1A18]">&euro;{fmt(TOTAL_ALL)}/mo</p>
            </div>
            <div>
              <p className="text-xs text-[#8C8A84] mb-1">% van revenue</p>
              <p className="text-xl font-semibold tabular-nums text-[#8B6020]">
                {((TOTAL_ALL / LAST_MONTH_REVENUE) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add Button */}
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-white text-sm text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors">
        <span className="w-5 h-5 rounded bg-[#F5F5F0] flex items-center justify-center text-xs font-bold text-[#8C8A84]">+</span>
        Kosten toevoegen
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_BADGE[category] ?? "text-[#8C8A84] bg-[#F5F5F0]";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${cls}`}>
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
