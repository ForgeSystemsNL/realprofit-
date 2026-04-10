import Link from "next/link";
import UserMenu from "@/components/UserMenu";

const NAV: { href: string; label: string; icon: () => React.JSX.Element; highlight?: boolean; badge?: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/dashboard/ai", label: "AI Assistent", icon: SparklesIcon, highlight: true },
  { href: "/dashboard/campaigns", label: "Campagnes", icon: MegaphoneIcon },
  { href: "/dashboard/creatives", label: "Creatives", icon: ImageIcon },
  { href: "/dashboard/kpi", label: "KPI-rapport", icon: ChartIcon },
  { href: "/dashboard/costs", label: "Kosten", icon: ReceiptIcon },
  { href: "/dashboard/stores", label: "Winkels", icon: GlobeIcon },
  { href: "/dashboard/retention", label: "Behoud", icon: RefreshIcon },
  { href: "/dashboard/benchmarks", label: "Benchmarks", icon: TrophyIcon },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellIcon, badge: "3" },
  { href: "/dashboard/cac", label: "CAC & LTV", icon: TrendingUpIcon },
  { href: "/dashboard/automations", label: "Automations", icon: ZapIcon },
  { href: "/dashboard/sops", label: "SOPs", icon: BookIcon },
  // { href: "/dashboard/logout", label: "Logout", icon: BookIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAF8] text-[#1A1A18]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-[220px] bg-[#0F0F0D] text-white border-r border-white/10 flex flex-col z-50">
        <div className="px-5 py-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-medium tracking-tight">
              RealProfit
            </span>
          </div>
          <p className="text-[10px] text-white/30 mt-0.5">Real profit. No bullshit.</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${item.highlight
                  ? "text-[#D4A843] hover:text-[#E8C068] hover:bg-[#D4A843]/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#8B2020] text-white font-medium leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        {/* <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1A18] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              JK
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-white truncate">Joey van de Kerkhof</p>
              <p className="text-[11px] text-white/40">Admin</p>
            </div>
          </div>
        </div> */}

        {/* User menu — click to open popup with logout */}
        <UserMenu />

        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[11px] text-white/30">RealProfit v1.0</p>
        </div>

        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[11px] text-white/30">RealProfit v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[220px] flex-1 min-h-screen p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG, 18px)
// ---------------------------------------------------------------------------

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" />
      <path d="M8 10h8M8 14h4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
      <circle cx="18" cy="4" r="3" fill="#8B2020" stroke="none" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
      <path d="M19 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" />
    </svg>
  );
}
