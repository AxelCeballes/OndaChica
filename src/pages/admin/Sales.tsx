import type { AppStore } from "../../useStore";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

const payLabel: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  fiado: "Fiado",
};
const payColor: Record<string, string> = {
  cash: "text-green-400 bg-green-900/30",
  transfer: "text-blue-400 bg-blue-900/30",
  card: "text-purple-400 bg-purple-900/30",
  fiado: "text-[#FFD600] bg-[#FFD600]/10",
};

export default function Sales({ store }: { store: AppStore }) {
  const { sales, products } = store;

  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const totalProfit = sales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce((a, item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return a;
        return a + (item.unitPrice - prod.purchasePrice) * item.qty;
      }, 0)
    );
  }, 0);
  const fiadoTotal = sales
    .filter((s) => s.paymentMethod === "fiado")
    .reduce((a, s) => a + s.total, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ventas totales", value: $(totalRevenue) },
          { label: "Ganancia estimada", value: $(totalProfit) },
          { label: "Total en fiado", value: $(fiadoTotal) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#222] p-4">
            <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">{label}</p>
            <p className="font-fraunces font-black text-2xl text-[#FAF8F2]">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#222] overflow-x-auto">
        <table className="w-full text-sm font-outfit">
          <thead>
            <tr className="border-b border-[#222]">
              {["Fecha", "Cliente", "Productos", "Total", "Forma de pago"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#555] font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-[#222] hover:bg-[#222] transition-colors">
                <td className="px-4 py-3 text-[#999] whitespace-nowrap">{s.date}</td>
                <td className="px-4 py-3 text-[#FAF8F2]">{s.clientName}</td>
                <td className="px-4 py-3 text-[#999] max-w-[200px] truncate">
                  {s.items.map((i) => `${i.productName} x${i.qty}`).join(", ")}
                </td>
                <td className="px-4 py-3 text-[#FAF8F2] font-bold whitespace-nowrap">{$(s.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase px-2 py-0.5 font-semibold ${payColor[s.paymentMethod]}`}>
                    {payLabel[s.paymentMethod]}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#555]">No hay ventas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
