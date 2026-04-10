import type { Customer } from "@/lib/notion";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CUSTOMERS: Customer[] = [
  { id: "c1", email: "m.dejong@gmail.com", name: "Marloes de Jong", totalOrders: 3, totalSpent: 187, firstOrderAt: "2025-08-12", tags: ["at-risk"] },
  { id: "c2", email: "s.bakker@hotmail.com", name: "Sanne Bakker", totalOrders: 1, totalSpent: 54, firstOrderAt: "2025-11-03", tags: ["at-risk"] },
  { id: "c3", email: "l.vanderberg@gmail.com", name: "Lisa van der Berg", totalOrders: 12, totalSpent: 842, firstOrderAt: "2024-11-22", tags: ["vip"] },
  { id: "c4", email: "a.devries@outlook.com", name: "Anna de Vries", totalOrders: 2, totalSpent: 128, firstOrderAt: "2025-09-14", tags: ["subscriber"] },
  { id: "c5", email: "k.jansen@gmail.com", name: "Kim Jansen", totalOrders: 7, totalSpent: 493, firstOrderAt: "2025-01-08", tags: ["vip", "subscriber"] },
];

const SEGMENT_STYLES: Record<string, string> = {
  "at-risk": "text-[#8B2020] bg-[#FDEAEA]",
  vip: "text-[#8B6020] bg-[#FEF3E2]",
  subscriber: "text-[#1A4B6B] bg-[#E8EFF5]",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CustomersPage() {
  const totalCustomers = CUSTOMERS.length;
  const totalRevenue = CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Klanten</h1>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-[#8C8A84]">Totaal klanten</p>
            <p className="text-lg font-medium text-[#1A1A18]">{totalCustomers}</p>
          </div>
          <div>
            <p className="text-xs text-[#8C8A84]">Totaal besteed</p>
            <p className="text-lg font-medium text-[#1A6B3C]">${fmt(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E8E6E1]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-left text-[#8C8A84]">
              <th className="px-4 py-3">Naam</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Segmenten</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Besteed</th>
              <th className="px-4 py-3">Eerste bestelling</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => (
              <tr key={c.id} className="border-b border-[#E8E6E1]/50">
                <td className="px-4 py-3 font-medium text-[#1A1A18]">{c.name}</td>
                <td className="px-4 py-3 text-[#8C8A84]">{c.email}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          SEGMENT_STYLES[tag] ?? "text-[#8C8A84] bg-[#E8E6E1]/50"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">{c.totalOrders}</td>
                <td className="px-4 py-3 text-right text-[#1A1A18]">${fmt(c.totalSpent)}</td>
                <td className="px-4 py-3 text-[#8C8A84]">{c.firstOrderAt ?? "—"}</td>
              </tr>
            ))}
          </tbody>
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
