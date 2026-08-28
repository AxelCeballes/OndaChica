import { useState } from "react";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

export default function Calculator() {
  // Price calculator
  const [purchase, setPurchase] = useState(0);
  const [transport, setTransport] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [margin, setMargin] = useState(50);

  const realCost = purchase + transport + otherCosts;
  const suggested = realCost * (1 + margin / 100);
  const profit = suggested - realCost;

  // Trip calculator
  const [tripItems, setTripItems] = useState([{ description: "Ropa", amount: 0 }]);
  const [tripTarget, setTripTarget] = useState(0);

  const tripTotal = tripItems.reduce((a, i) => a + i.amount, 0);
  const toRecover = tripTotal;
  const recoveryPercent = tripTarget > 0 ? Math.min(100, Math.round((tripTarget / toRecover) * 100)) : 0;

  function addTripItem() {
    setTripItems((prev) => [...prev, { description: "", amount: 0 }]);
  }
  function updateTripItem(i: number, field: "description" | "amount", val: string | number) {
    setTripItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }
  function removeTripItem(i: number) {
    setTripItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Price calculator */}
      <div className="bg-[#1a1a1a] border border-[#222] p-6">
        <h3 className="font-fraunces font-bold text-xl mb-1">Calculadora de Precio</h3>
        <p className="font-outfit text-xs text-[#555] mb-5">Calculá el precio sugerido de venta con margen de ganancia.</p>

        <div className="space-y-4">
          {[
            { label: "Precio de compra", value: purchase, set: setPurchase },
            { label: "Transporte", value: transport, set: setTransport },
            { label: "Otros gastos", value: otherCosts, set: setOtherCosts },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">{label}</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
              />
            </div>
          ))}

          <div>
            <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">
              Margen deseado: <span className="text-[#E8143A]">{margin}%</span>
            </label>
            <input
              type="range"
              min={5}
              max={200}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-[#E8143A]"
            />
            <div className="flex justify-between font-outfit text-xs text-[#555] mt-1">
              <span>5%</span><span>100%</span><span>200%</span>
            </div>
          </div>
        </div>

        {realCost > 0 && (
          <div className="mt-6 space-y-2 border-t border-[#222] pt-4">
            <div className="flex justify-between font-outfit text-sm">
              <span className="text-[#999]">Costo real</span>
              <span className="text-[#FAF8F2]">{$(realCost)}</span>
            </div>
            <div className="flex justify-between font-outfit text-sm">
              <span className="text-[#999]">Precio sugerido</span>
              <span className="font-bold text-[#FFD600] text-lg">{$(Math.round(suggested))}</span>
            </div>
            <div className="flex justify-between font-outfit text-sm">
              <span className="text-[#999]">Ganancia por unidad</span>
              <span className="text-green-400 font-semibold">{$(Math.round(profit))}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trip calculator */}
      <div className="bg-[#1a1a1a] border border-[#222] p-6">
        <h3 className="font-fraunces font-bold text-xl mb-1">Calculadora de Viaje</h3>
        <p className="font-outfit text-xs text-[#555] mb-5">Registrá los gastos del viaje y calculá cuánto tenés que vender para recuperarlos.</p>

        <div className="space-y-2 mb-3">
          {tripItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.description}
                onChange={(e) => updateTripItem(i, "description", e.target.value)}
                placeholder="Concepto"
                className="flex-1 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
              />
              <input
                type="number"
                min={0}
                value={item.amount}
                onChange={(e) => updateTripItem(i, "amount", Number(e.target.value))}
                className="w-28 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2 text-sm focus:outline-none focus:border-[#E8143A]"
              />
              {tripItems.length > 1 && (
                <button onClick={() => removeTripItem(i)} className="text-[#555] hover:text-[#E8143A] font-bold px-1">×</button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addTripItem}
          className="font-outfit text-xs text-[#555] hover:text-white border border-[#333] px-4 py-2 transition-colors mb-5"
        >
          + Agregar item
        </button>

        {tripTotal > 0 && (
          <div className="border-t border-[#222] pt-4 space-y-3">
            <div className="flex justify-between font-outfit text-sm">
              <span className="text-[#999]">Inversión total del viaje</span>
              <span className="font-fraunces font-black text-xl text-[#E8143A]">{$(tripTotal)}</span>
            </div>

            <div>
              <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">
                Ventas generadas hasta ahora
              </label>
              <input
                type="number"
                min={0}
                value={tripTarget}
                onChange={(e) => setTripTarget(Number(e.target.value))}
                className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
              />
            </div>

            {tripTarget > 0 && (
              <>
                <div className="w-full bg-[#333] h-2">
                  <div
                    className="h-2 bg-[#E8143A] transition-all duration-300"
                    style={{ width: `${Math.min(100, recoveryPercent)}%` }}
                  />
                </div>
                <p className="font-outfit text-sm text-center">
                  {recoveryPercent >= 100 ? (
                    <span className="text-green-400 font-semibold">
                      ✓ Recuperaste el 100% de la inversión. Ganancia: {$(tripTarget - toRecover)}
                    </span>
                  ) : (
                    <span className="text-[#FFD600]">
                      {recoveryPercent}% recuperado — te faltan {$(toRecover - tripTarget)} para cubrir
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
