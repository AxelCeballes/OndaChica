import { useState } from "react";
import type { AppStore } from "../../useStore";
import type { Expense } from "../../types";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

const EXPENSE_CATEGORIES = [
  "Transporte", "Comida", "Bolsas", "Packaging",
  "Publicidad", "Envíos", "Alquiler", "Servicios", "Otro",
];

export default function Expenses({ store }: { store: AppStore }) {
  const { expenses, addExpense, fmtDate } = store;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Transporte", description: "", amount: "" });

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  });
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  function handleCreate() {
    if (!form.description || !form.amount) return;
    const e: Expense = {
      id: `e${Date.now()}`,
      date: fmtDate(),
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
    };
    addExpense(e);
    setForm({ category: "Transporte", description: "", amount: "" });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-[#1a1a1a] border border-[#E8143A]/30 px-5 py-4 inline-block">
          <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-1">Total gastos registrados</p>
          <p className="font-fraunces font-black text-3xl text-[#E8143A]">{$(total)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-[#FFD600] hover:text-[#111] transition-colors"
        >
          + Nuevo gasto
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-[#333] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
            >
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción *"
              className="bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Monto *"
                className="flex-1 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
              />
              <button
                onClick={handleCreate}
                className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#FFD600] hover:text-[#111] transition-colors whitespace-nowrap"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By category */}
        <div className="bg-[#1a1a1a] border border-[#222] p-5">
          <p className="font-outfit text-xs uppercase tracking-widest text-[#555] mb-4">Por categoría</p>
          <div className="space-y-3">
            {topCategories.map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex justify-between font-outfit text-sm mb-1">
                  <span className="text-[#999]">{cat}</span>
                  <span className="text-[#FAF8F2]">{$(amt)}</span>
                </div>
                <div className="w-full bg-[#333] h-1">
                  <div
                    className="h-1 bg-[#E8143A]"
                    style={{ width: `${(amt / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense list */}
        <div className="md:col-span-2 bg-[#1a1a1a] border border-[#222] overflow-x-auto">
          <table className="w-full text-sm font-outfit">
            <thead>
              <tr className="border-b border-[#222]">
                {["Fecha", "Categoría", "Descripción", "Monto"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#555] font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-[#222] hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 text-[#555] whitespace-nowrap">{e.date}</td>
                  <td className="px-4 py-3 text-[#999]">{e.category}</td>
                  <td className="px-4 py-3 text-[#FAF8F2]">{e.description}</td>
                  <td className="px-4 py-3 text-[#E8143A] font-semibold whitespace-nowrap">{$(e.amount)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#555]">No hay gastos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
