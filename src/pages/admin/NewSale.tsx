import { useState } from "react";
import type { AppStore } from "../../useStore";
import type { Sale, SaleItem } from "../../types";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

export default function NewSale({
  store,
  onDone,
}: {
  store: AppStore;
  onDone: () => void;
}) {
  const { products, clients, addSale, fmtDate } = store;
  const [clientMode, setClientMode] = useState<"quick" | "registered">("quick");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("cash");
  const [items, setItems] = useState<(SaleItem & { tempId: string })[]>([]);
  const [selProduct, setSelProduct] = useState("");
  const [selSize, setSelSize] = useState("");
  const [selQty, setSelQty] = useState(1);
  const [success, setSuccess] = useState(false);

  const activeProducts = products.filter((p) => p.active);
  const selectedProduct = activeProducts.find((p) => p.id === selProduct);
  const availableSizes = selectedProduct
    ? Object.entries(selectedProduct.stock)
        .filter(([, qty]) => qty > 0)
        .map(([size]) => size)
    : [];

  const total = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);

  function addItem() {
    if (!selProduct || !selSize || selQty < 1) return;
    const prod = activeProducts.find((p) => p.id === selProduct);
    if (!prod) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === selProduct && i.size === selSize);
      if (existing) {
        return prev.map((i) =>
          i.productId === selProduct && i.size === selSize
            ? { ...i, qty: i.qty + selQty }
            : i
        );
      }
      return [
        ...prev,
        {
          tempId: `${selProduct}-${selSize}-${Date.now()}`,
          productId: selProduct,
          productName: prod.name,
          size: selSize,
          qty: selQty,
          unitPrice: prod.salePrice,
        },
      ];
    });
    setSelProduct("");
    setSelSize("");
    setSelQty(1);
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  function handleSubmit() {
    if (items.length === 0) return;
    const finalClientName =
      clientMode === "registered"
        ? clients.find((c) => c.id === clientId)?.name ?? "Cliente"
        : clientName || "Mostrador";

    const sale: Sale = {
      id: `s${Date.now()}`,
      date: fmtDate(),
      clientName: finalClientName,
      clientId: clientMode === "registered" && clientId ? clientId : undefined,
      items: items.map(({ tempId: _, ...rest }) => rest),
      total,
      paymentMethod,
    };
    addSale(sale);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <h2 className="font-fraunces font-black text-2xl text-[#FAF8F2] mb-2">¡Venta registrada!</h2>
        <p className="font-outfit text-[#999] mb-6">Total: <span className="text-[#E8143A] font-bold">{$(total)}</span></p>
        <div className="flex gap-3">
          <button
            onClick={() => { setItems([]); setClientName(""); setClientId(""); setPaymentMethod("cash"); setSuccess(false); }}
            className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-6 py-3"
          >
            Nueva venta
          </button>
          <button
            onClick={onDone}
            className="border border-[#333] text-[#999] font-outfit text-xs uppercase tracking-widest px-6 py-3 hover:text-white transition-colors"
          >
            Ver ventas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: product selector */}
      <div className="space-y-4">
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <h3 className="font-fraunces font-bold text-lg mb-4">Agregar productos</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Producto</label>
              <select
                value={selProduct}
                onChange={(e) => { setSelProduct(e.target.value); setSelSize(""); }}
                className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
              >
                <option value="">Seleccionar...</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {$(p.salePrice)}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Talle</label>
                  <select
                    value={selSize}
                    onChange={(e) => setSelSize(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  >
                    <option value="">Elegir...</option>
                    {availableSizes.map((s) => (
                      <option key={s} value={s}>
                        {s} (stock: {selectedProduct.stock[s]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={selQty}
                    onChange={(e) => setSelQty(Number(e.target.value))}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  />
                </div>
              </div>
            )}

            <button
              onClick={addItem}
              disabled={!selProduct || !selSize}
              className="w-full bg-[#333] text-[#FAF8F2] font-outfit font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-[#E8143A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Agregar
            </button>
          </div>
        </div>

        {/* Client */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <h3 className="font-fraunces font-bold text-lg mb-4">Cliente</h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setClientMode("quick")}
              className={`flex-1 font-outfit text-xs uppercase tracking-widest py-2 border transition-colors ${clientMode === "quick" ? "bg-[#E8143A] border-[#E8143A] text-white" : "border-[#333] text-[#999] hover:text-white"}`}
            >
              Rápido
            </button>
            <button
              onClick={() => setClientMode("registered")}
              className={`flex-1 font-outfit text-xs uppercase tracking-widest py-2 border transition-colors ${clientMode === "registered" ? "bg-[#E8143A] border-[#E8143A] text-white" : "border-[#333] text-[#999] hover:text-white"}`}
            >
              Registrado
            </button>
          </div>

          {clientMode === "quick" ? (
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre o vacío = Mostrador"
              className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
            />
          ) : (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
            >
              <option value="">Seleccionar cliente...</option>
              {store.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.deuda > 0 ? `(debe ${$(c.deuda)})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <h3 className="font-fraunces font-bold text-lg mb-4">Forma de pago</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "cash", label: "💵 Efectivo" },
              { value: "transfer", label: "📱 Transferencia" },
              { value: "card", label: "💳 Tarjeta" },
              { value: "fiado", label: "📒 Fiado" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`py-3 font-outfit text-sm border transition-colors ${paymentMethod === value ? "bg-[#E8143A] border-[#E8143A] text-white" : "border-[#333] text-[#999] hover:border-[#555] hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {paymentMethod === "fiado" && clientMode === "quick" && (
            <p className="font-outfit text-xs text-[#FFD600] mt-2">
              ⚠ Para registrar fiado, usá un cliente registrado.
            </p>
          )}
        </div>
      </div>

      {/* Right: order summary */}
      <div>
        <div className="bg-[#1a1a1a] border border-[#222] p-5 sticky top-20">
          <h3 className="font-fraunces font-bold text-lg mb-4">Resumen del pedido</h3>

          {items.length === 0 ? (
            <p className="font-outfit text-sm text-[#555] text-center py-8">
              Agregá productos para empezar.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.tempId} className="flex items-center justify-between gap-3 pb-3 border-b border-[#222]">
                  <div>
                    <p className="font-outfit text-sm text-[#FAF8F2]">{item.productName}</p>
                    <p className="font-outfit text-xs text-[#555]">Talle {item.size} · x{item.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-fraunces font-bold">{$(item.unitPrice * item.qty)}</span>
                    <button
                      onClick={() => removeItem(item.tempId)}
                      className="text-[#555] hover:text-[#E8143A] text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-t border-[#333] mb-5">
            <span className="font-outfit font-semibold text-[#999]">Total</span>
            <span className="font-fraunces font-black text-2xl text-[#E8143A]">{$(total)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={items.length === 0}
            className="w-full bg-[#E8143A] text-white font-outfit font-black text-sm uppercase tracking-widest py-4 hover:bg-[#FFD600] hover:text-[#111] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}
