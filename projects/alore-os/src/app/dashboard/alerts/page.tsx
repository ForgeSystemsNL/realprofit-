"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

interface Alert {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  date: string;
  read: boolean;
}

interface AlertSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  threshold?: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    type: "danger",
    title: "ROAS onder 1.0 — Bundle deal UGC v1",
    description: "Deze campagne draait al 5 dagen met een ROAS van 0.7. Directe actie vereist.",
    metric: "ROAS 0.7x",
    date: "2024-01-18",
    read: false,
  },
  {
    id: "a2",
    type: "danger",
    title: "CPA boven €80 — Retargeting Broad",
    description: "CPA is gestegen naar €94. Budget limiet bijna bereikt.",
    metric: "CPA €94",
    date: "2024-01-18",
    read: false,
  },
  {
    id: "a3",
    type: "warning",
    title: "Winstmarge gedaald onder 25%",
    description: "Huidige marge is 23.7%. Controleer variabele kosten en COGS.",
    metric: "Marge 23.7%",
    date: "2024-01-17",
    read: false,
  },
  {
    id: "a4",
    type: "warning",
    title: "2 klanten at risk — geen order >45 dagen",
    description: "Overweeg een win-back e-mail of persoonlijk bericht.",
    date: "2024-01-17",
    read: true,
  },
  {
    id: "a5",
    type: "info",
    title: "Collageen Serum UGC v3 — nieuwe top performer",
    description: "ROAS gestegen naar 3.8x. Overweeg budget te verhogen.",
    metric: "ROAS 3.8x",
    date: "2024-01-16",
    read: true,
  },
  {
    id: "a6",
    type: "info",
    title: "E-mail flow ROAS boven 7x",
    description: "Welcome flow presteert uitzonderlijk. Meer subscribers = meer omzet.",
    metric: "ROAS 7.4x",
    date: "2024-01-15",
    read: true,
  },
  {
    id: "a7",
    type: "warning",
    title: "Ad spend +18% week-over-week",
    description: "Totale spend gestegen van €2,400 naar €2,840 zonder evenredige omzetgroei.",
    metric: "+18%",
    date: "2024-01-15",
    read: true,
  },
];

const MOCK_SETTINGS: AlertSetting[] = [
  { id: "s1", label: "ROAS onder drempel", description: "Alert wanneer campagne ROAS onder 1.0 zakt", enabled: true, threshold: "< 1.0x" },
  { id: "s2", label: "CPA boven limiet", description: "Alert wanneer CPA boven €80 stijgt", enabled: true, threshold: "> €80" },
  { id: "s3", label: "Marge daling", description: "Alert wanneer winstmarge onder 25% daalt", enabled: true, threshold: "< 25%" },
  { id: "s4", label: "Klanten at risk", description: "Alert wanneer klanten >45 dagen geen order", enabled: true, threshold: "> 45 dagen" },
  { id: "s5", label: "Budget overschrijding", description: "Alert bij >15% week-over-week spend stijging", enabled: false, threshold: "> 15%" },
  { id: "s6", label: "Nieuwe top performer", description: "Melding wanneer campagne ROAS boven 3.0 stijgt", enabled: true, threshold: "> 3.0x" },
  { id: "s7", label: "Dagelijkse samenvatting", description: "Dagelijkse e-mail met alle actieve alerts", enabled: false },
];

const TYPE_STYLES = {
  danger: { border: "border-l-[#8B2020]", bg: "bg-[#8B2020]/5", badge: "bg-[#8B2020]/10 text-[#8B2020]", label: "Kritiek" },
  warning: { border: "border-l-[#8B6020]", bg: "bg-[#8B6020]/5", badge: "bg-[#8B6020]/10 text-[#8B6020]", label: "Waarschuwing" },
  info: { border: "border-l-[#1A4B6B]", bg: "bg-[#1A4B6B]/5", badge: "bg-[#1A4B6B]/10 text-[#1A4B6B]", label: "Info" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  const [tab, setTab] = useState<"history" | "settings">("history");
  const [settings, setSettings] = useState(MOCK_SETTINGS);

  const unread = MOCK_ALERTS.filter((a) => !a.read).length;

  function toggleSetting(id: string) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[#1A1A18]">Alerts</h1>
        <p className="text-sm text-[#8C8A84] mt-1">
          {unread} ongelezen alerts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F5F0] rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-white text-[#1A1A18] shadow-sm"
              : "text-[#8C8A84] hover:text-[#1A1A18]"
          }`}
        >
          Geschiedenis
          {unread > 0 && (
            <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-[#8B2020] text-white">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "settings"
              ? "bg-white text-[#1A1A18] shadow-sm"
              : "text-[#8C8A84] hover:text-[#1A1A18]"
          }`}
        >
          Instellingen
        </button>
      </div>

      {/* History tab */}
      {tab === "history" && (
        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => {
            const style = TYPE_STYLES[alert.type];
            return (
              <div
                key={alert.id}
                className={`border border-[#E8E6E1] ${style.border} border-l-[3px] rounded-xl p-5 ${
                  !alert.read ? style.bg : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {style.label}
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-[#8B2020]" />
                      )}
                    </div>
                    <p className={`text-sm ${!alert.read ? "font-medium" : ""} text-[#1A1A18]`}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-[#8C8A84] mt-1">{alert.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {alert.metric && (
                      <p className="text-sm font-semibold tabular-nums text-[#1A1A18]">
                        {alert.metric}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8C8A84] mt-1">
                      {new Date(alert.date).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E6E1] text-left">
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider">
                  Drempel
                </th>
                <th className="px-5 py-3 text-[11px] font-medium text-[#8C8A84] uppercase tracking-wider text-right">
                  Actief
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} className="border-b border-[#E8E6E1] last:border-0">
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#1A1A18]">{s.label}</p>
                    <p className="text-xs text-[#8C8A84] mt-0.5">{s.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    {s.threshold ? (
                      <span className="text-xs font-medium text-[#1A1A18] bg-[#F5F5F0] px-2 py-1 rounded">
                        {s.threshold}
                      </span>
                    ) : (
                      <span className="text-xs text-[#8C8A84]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleSetting(s.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        s.enabled ? "bg-[#1A6B3C]" : "bg-[#E8E6E1]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                          s.enabled ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
