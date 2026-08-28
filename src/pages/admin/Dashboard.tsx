import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { AppStore } from "../../useStore";
import type { AdminView } from "../../types";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

function KpiCard({
  label,
  value,
  sub,
  accent,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`p-5 border ${alert ? "border-[#FFD600] bg-[#FFD600]/5" : accent ? "border-[#E8143A] bg-[#E8143A]/5" : "border-[#222] bg-[#1a1a1a]"}`}
    >
      <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-2">{label}</p>
      <p className={`font-fraunces font-black text-3xl ${accent ? "text-[#E8143A]" : alert ? "text-[#FFD600]" : "text-[#FAF8F2]"}`}>
        {value}
      </p>
      {sub && <p className="font-outfit text-xs text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({
  store,
  onViewChange,
}: {
  store: AppStore;
  onViewChange: (v: AdminView) => void;
}) {
  const { stats, last7, sales, products } = store;

  // Category breakdown for bar chart
  const catMap: Record<string, number> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category ?? "Otro";
      catMap[cat] = (catMap[cat] ?? 0) + item.unitPrice * item.qty;
    });
  });
  const catData = Object.entries(catMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Recent sales
  const recent = sales.slice(0, 5);

  const payMethodLabel: Record<string, string> = {
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta",
    fiado: "Fiado",
  };

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Ventas hoy" value={$(stats.todayTotal)} sub={`${stats.todaySalesCount} transacciones`} accent />
        <KpiCard label="Ganancia hoy" value={$(stats.todayProfit)} />
        <KpiCard label="Fiado total" value={$(stats.totalFiado)} sub="Dinero en calle" />
        <KpiCard label="Total en stock" value={stats.totalStock.toString()} sub="unidades" />
        <KpiCard label="Stock bajo" value={stats.lowStockCount.toString()} sub="productos" alert={stats.lowStockCount > 0} />
        <KpiCard label="Clientes" value={store.clients.length.toString()} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales area chart */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-4">
            Ventas últimos 7 días
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8143A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8143A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 0 }}
                labelStyle={{ color: "#999", fontSize: 11 }}
                formatter={(v: number) => [$(v), "Total"]}
              />
              <Area type="monotone" dataKey="total" stroke="#E8143A" strokeWidth={2} fill="url(#colorTotal)" dot={{ fill: "#E8143A", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category bar chart */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-4">
            Ventas por categoría
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#999", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 0 }}
                formatter={(v: number) => [$(v), "Ventas"]}
              />
              <Bar dataKey="total" radius={0}>
                {catData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#E8143A" : i === 1 ? "#FFD600" : "#333"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent sales + Low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-outfit text-xs uppercase tracking-widest text-[#555]">Últimas ventas</p>
            <button onClick={() => onViewChange("sales")} className="font-outfit text-xs text-[#E8143A] hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 pb-3 border-b border-[#222] last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-outfit text-sm text-[#FAF8F2] truncate">{s.clientName}</p>
                  <p className="font-outfit text-xs text-[#555]">{s.items.map((i) => i.productName).join(", ")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-fraunces font-bold text-base">{$(s.total)}</p>
                  <span className={`font-outfit text-[10px] uppercase px-2 py-0.5 ${s.paymentMethod === "fiado" ? "bg-[#FFD600]/20 text-[#FFD600]" : "bg-[#333] text-[#999]"}`}>
                    {payMethodLabel[s.paymentMethod]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-outfit text-xs uppercase tracking-widest text-[#555]">⚠ Stock bajo</p>
            <button onClick={() => onViewChange("products")} className="font-outfit text-xs text-[#E8143A] hover:underline">
              Ver productos →
            </button>
          </div>
          <div className="space-y-3">
            {products
              .filter((p) => Object.values(p.stock).some((v) => v <= p.minStock))
              .slice(0, 6)
              .map((p) => {
                const lowSizes = Object.entries(p.stock)
                  .filter(([, qty]) => qty <= p.minStock)
                  .map(([size, qty]) => `${size}: ${qty}`);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 pb-3 border-b border-[#222] last:border-0 last:pb-0">
                    <div>
                      <p className="font-outfit text-sm text-[#FAF8F2]">{p.name}</p>
                      <p className="font-outfit text-xs text-[#FFD600]">{lowSizes.join(" · ")}</p>
                    </div>
                    <span className="font-outfit text-[10px] uppercase tracking-wide text-[#FFD600] bg-[#FFD600]/10 px-2 py-0.5">
                      BAJO
                    </span>
                  </div>
                );
              })}
            {stats.lowStockCount === 0 && (
              <p className="font-outfit text-sm text-[#555] text-center py-6">Todo el stock está bien ✓</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
