import { useState } from "react";
import type { AppStore } from "../../useStore";
import type { Product } from "../../types";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;
const CATEGORIES = ["Remeras", "Buzos", "Vestidos", "Pantalones", "Camperas", "Shorts", "Faldas", "Interior", "Medias", "Accesorios", "Otro"];

const EMPTY: Omit<Product, "id"> = {
  name: "",
  category: "Remeras",
  purchasePrice: 0,
  salePrice: 0,
  stock: { S: 0, M: 0, L: 0, XL: 0 },
  minStock: 2,
  active: true,
};

export default function Products({ store }: { store: AppStore }) {
  const { products, addProduct, updateProduct, deleteProduct, SIZES } = store;
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  function openCreate() {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(p: Product) {
    setForm({ ...p });
    setEditing(p);
    setCreating(false);
  }

  function handleSave() {
    if (!form.name) return;
    if (creating) {
      addProduct({ ...form, id: `p${Date.now()}` });
      setCreating(false);
    } else if (editing) {
      updateProduct({ ...form, id: editing.id });
      setEditing(null);
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("¿Eliminar este producto?")) deleteProduct(id);
  }

  const showForm = creating || !!editing;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 bg-[#1a1a1a] border border-[#333] text-[#FAF8F2] font-outfit px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8143A] placeholder-[#555]"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] text-[#FAF8F2] font-outfit px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
        >
          <option value="Todos">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={openCreate}
          className="bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#FFD600] hover:text-[#111] transition-colors whitespace-nowrap"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-fraunces font-bold text-xl mb-5">
              {creating ? "Nuevo Producto" : "Editar Producto"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Nombre *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  />
                </div>
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Stock mínimo</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  />
                </div>
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Precio de compra</label>
                  <input
                    type="number"
                    min={0}
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  />
                </div>
                <div>
                  <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-1.5">Precio de venta</label>
                  <input
                    type="number"
                    min={0}
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8143A]"
                  />
                </div>
              </div>

              {form.purchasePrice > 0 && form.salePrice > 0 && (
                <p className="font-outfit text-xs text-[#FFD600]">
                  Ganancia: {$(form.salePrice - form.purchasePrice)} ({Math.round(((form.salePrice - form.purchasePrice) / form.purchasePrice) * 100)}% margen)
                </p>
              )}

              <div>
                <label className="block font-outfit text-xs uppercase tracking-widest text-[#555] mb-2">Stock por talle</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <span className="font-outfit text-xs text-[#999] w-8">{size}</span>
                      <input
                        type="number"
                        min={0}
                        value={form.stock[size] ?? 0}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            stock: { ...form.stock, [size]: Number(e.target.value) },
                          })
                        }
                        className="flex-1 bg-[#111] border border-[#333] text-[#FAF8F2] font-outfit px-2 py-1.5 text-sm focus:outline-none focus:border-[#E8143A]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-[#E8143A]"
                />
                <label htmlFor="active" className="font-outfit text-sm text-[#999]">Visible en tienda</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#E8143A] text-white font-outfit font-bold text-xs uppercase tracking-widest py-3 hover:bg-[#FFD600] hover:text-[#111] transition-colors"
              >
                {creating ? "Crear" : "Guardar"}
              </button>
              <button
                onClick={() => { setCreating(false); setEditing(null); }}
                className="flex-1 border border-[#333] text-[#999] font-outfit text-xs uppercase tracking-widest py-3 hover:border-[#555] hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#222] overflow-x-auto">
        <table className="w-full text-sm font-outfit">
          <thead>
            <tr className="border-b border-[#222]">
              {["Nombre", "Categoría", "Compra", "Venta", "Ganancia", "Stock total", "Estado", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#555] font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
              const lowStock = Object.values(p.stock).some((v) => v <= p.minStock);
              const profit = p.salePrice - p.purchasePrice;
              const margin = p.purchasePrice > 0 ? Math.round((profit / p.purchasePrice) * 100) : 0;
              return (
                <tr key={p.id} className="border-b border-[#222] hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 text-[#FAF8F2] font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[#999]">{p.category}</td>
                  <td className="px-4 py-3 text-[#999]">{$(p.purchasePrice)}</td>
                  <td className="px-4 py-3 text-[#FAF8F2]">{$(p.salePrice)}</td>
                  <td className="px-4 py-3 text-[#FFD600]">{$(profit)} <span className="text-[#555]">({margin}%)</span></td>
                  <td className="px-4 py-3">
                    <span className={`${lowStock ? "text-[#FFD600]" : "text-[#FAF8F2]"}`}>
                      {totalStock} {lowStock && "⚠"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase px-2 py-0.5 ${p.active ? "bg-green-900/40 text-green-400" : "bg-[#333] text-[#555]"}`}>
                      {p.active ? "Activo" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-[#E8143A] hover:underline">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-[#555] hover:text-red-400 hover:underline">Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#555]">No hay productos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
