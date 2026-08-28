import { useState } from "react";
import type { AppStore } from "../../useStore";
import type { Client } from "../../types";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

export default function Clients({ store }: { store: AppStore }) {
  const { clients, fiado, addClient, addFiadoPayment, addFiadoDebt, fmtDate } = store;
  const [selected, setSelected] = useState<Client | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [debtConcept, setDebtConcept] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtMode, setDebtMode] = useState<"pay" | "add">("pay");

  const clientMovements = selected
    ? fiado.filter((f) => f.clientId === selected.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  function trustStatus(c: Client): "green" | "yellow" | "red" {
    if (c.deuda === 0) return "green";
    if (c.deuda < 30000) return "yellow";
    return "red";
  }
  const statusColor = { green: "bg-green-500", yellow: "bg-yellow-400", red: "bg-red-500" };
  const statusLabel = { green: "Al día", yellow: "Deuda baja", red: "Deuda alta" };

  function handleCreateClient() {
    if (!newName) return;
    const c: Client = {
      id: `c${Date.now()}`,
      name: newName,
      phone: newPhone,
      deuda: 0,
      createdAt: fmtDate(),
    };
    addClient(c);
    setNewName("");
    setNewPhone("");
    setShowCreate(false);
  }

  function handlePayment() {
    const amount = Number(payAmount);
    if (!selected || amount <= 0) return;
    addFiadoPayment(selected.id, amount, "Pago en efectivo");
    setPayAmount("");
    setSelected((prev) => prev ? { ...prev, deuda: Math.max(0, prev.deuda - amount) } : null);
  }

  function handleAddDebt() {
    const amount = Number(debtAmount);
    if (!selected || amount <= 0 || !debtConcept) return;
    addFiadoDebt(selected.id, amount, debtConcept);
    setDebtAmount("");
    setDebtConcept("");
    setSelected((prev) => prev ? { ...prev, deuda: prev.deuda + amount } : null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Client list */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-fraunces font-bold text-lg">Clientes</h3>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#FFD600] hover:text-[#111] transition-colors"
          >
            + Nuevo
          </button>
        </div>

        {showCreate && (
          <div className="bg-[#1a1a1a] border border-[#333] p-4 space-y-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre *"
              className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Teléfono"
              className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateClient} className="flex-1 bg-[#E8143A] text-white font-outfit text-xs uppercase tracking-widest py-2">
                Crear
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-[#333] text-[#999] font-outfit text-xs uppercase tracking-widest py-2">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {clients.map((c) => {
            const status = trustStatus(c);
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 border transition-colors ${selected?.id === c.id ? "border-[#E8143A] bg-[#E8143A]/5" : "border-[#222] bg-[#1a1a1a] hover:border-[#333]"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-outfit text-sm text-[#FAF8F2] font-medium">{c.name}</p>
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColor[status]}`} title={statusLabel[status]} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-outfit text-xs text-[#555]">{c.phone}</p>
                  {c.deuda > 0 && (
                    <p className="font-outfit text-xs text-[#E8143A] font-semibold">{$(c.deuda)}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client detail */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="bg-[#1a1a1a] border border-[#222] h-full min-h-[300px] flex items-center justify-center">
            <p className="font-outfit text-[#555] text-sm">Seleccioná un cliente para ver su fiado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client header */}
            <div className="bg-[#1a1a1a] border border-[#222] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-fraunces font-bold text-xl text-[#FAF8F2]">{selected.name}</h3>
                  <p className="font-outfit text-sm text-[#555]">{selected.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-1">Deuda actual</p>
                  <p className={`font-fraunces font-black text-3xl ${selected.deuda > 0 ? "text-[#E8143A]" : "text-green-400"}`}>
                    {$(selected.deuda)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#1a1a1a] border border-[#222] p-5">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDebtMode("pay")}
                  className={`flex-1 font-outfit text-xs uppercase tracking-widest py-2.5 border transition-colors ${debtMode === "pay" ? "bg-[#E8143A] border-[#E8143A] text-white" : "border-[#333] text-[#999] hover:text-white"}`}
                >
                  💵 Registrar pago
                </button>
                <button
                  onClick={() => setDebtMode("add")}
                  className={`flex-1 font-outfit text-xs uppercase tracking-widest py-2.5 border transition-colors ${debtMode === "add" ? "bg-[#E8143A] border-[#E8143A] text-white" : "border-[#333] text-[#999] hover:text-white"}`}
                >
                  + Agregar fiado
                </button>
              </div>

              {debtMode === "pay" ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Monto del pago"
                    className="flex-1 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
                  />
                  <button
                    onClick={handlePayment}
                    className="bg-green-700 text-white font-outfit font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-green-600 transition-colors"
                  >
                    Registrar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={debtConcept}
                    onChange={(e) => setDebtConcept(e.target.value)}
                    placeholder="Concepto (ej: 2 remeras)"
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                      placeholder="Monto"
                      className="flex-1 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
                    />
                    <button
                      onClick={handleAddDebt}
                      className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#FFD600] hover:text-[#111] transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Movement history */}
            <div className="bg-[#1a1a1a] border border-[#222] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#222]">
                <p className="font-outfit text-xs uppercase tracking-widest text-[#555]">Historial de movimientos</p>
              </div>
              {clientMovements.length === 0 ? (
                <p className="font-outfit text-sm text-[#555] text-center py-8">Sin movimientos registrados.</p>
              ) : (
                <table className="w-full text-sm font-outfit">
                  <thead>
                    <tr className="border-b border-[#222]">
                      <th className="text-left px-4 py-2.5 text-xs uppercase tracking-widest text-[#555]">Fecha</th>
                      <th className="text-left px-4 py-2.5 text-xs uppercase tracking-widest text-[#555]">Concepto</th>
                      <th className="text-right px-4 py-2.5 text-xs uppercase tracking-widest text-[#555]">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientMovements.map((m) => (
                      <tr key={m.id} className="border-b border-[#222] hover:bg-[#222] transition-colors">
                        <td className="px-4 py-3 text-[#555]">{m.date}</td>
                        <td className="px-4 py-3 text-[#FAF8F2]">{m.concept}</td>
                        <td className={`px-4 py-3 text-right font-bold ${m.amount < 0 ? "text-green-400" : "text-[#E8143A]"}`}>
                          {m.amount < 0 ? `-${$(Math.abs(m.amount))}` : $(m.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
