import { useState } from "react";
import type { AdminView } from "../../types";

const NAV_ITEMS: { view: AdminView; label: string; icon: string }[] = [
  { view: "dashboard", label: "Dashboard", icon: "📊" },
  { view: "products", label: "Productos", icon: "👕" },
  { view: "sales", label: "Ventas", icon: "💰" },
  { view: "new-sale", label: "Nueva Venta", icon: "🛒" },
  { view: "clients", label: "Clientes & Fiado", icon: "📒" },
  { view: "calculator", label: "Calculadora", icon: "🧮" },
  { view: "expenses", label: "Gastos", icon: "🧾" },
];

export default function AdminLayout({
  activeView,
  onViewChange,
  onLogout,
  children,
}: {
  activeView: AdminView;
  onViewChange: (v: AdminView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-full flex bg-[#0f0f0f] text-[#FAF8F2]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-[#111] border-r border-[#222] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#222]">
          <p className="font-fraunces font-black text-2xl leading-none">
            ONDA<br />
            <span className="text-[#E8143A]">CHICA</span>
          </p>
          <p className="font-outfit text-[10px] uppercase tracking-[0.2em] text-[#555] mt-1">
            Panel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ view, label, icon }) => (
            <button
              key={view}
              onClick={() => { onViewChange(view); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left font-outfit text-sm transition-colors rounded-sm ${
                activeView === view
                  ? "bg-[#E8143A] text-white font-semibold"
                  : "text-[#999] hover:text-[#FAF8F2] hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#222] space-y-0.5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left font-outfit text-sm text-[#555] hover:text-[#FAF8F2] hover:bg-[#1a1a1a] rounded-sm transition-colors"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[#111] border-b border-[#222] flex items-center gap-4 px-4 md:px-6 sticky top-0 z-10">
          <button
            className="md:hidden p-1 text-[#999] hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-outfit font-semibold text-sm capitalize">
            {NAV_ITEMS.find((n) => n.view === activeView)?.label}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
