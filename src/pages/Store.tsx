import { useEffect, useState } from "react";
import type { AppStore } from "../useStore";
import { useReveal } from "../hooks/useReveal";

const $ = (n: number) => `$${n.toLocaleString("es-AR")}`;

const HERO_IMG =
  "https://images.unsplash.com/photo-1611524001023-3b3be17b3030?w=900&h=1100&fit=crop&auto=format";
const CAT_IMGS: Record<string, string> = {
  Vestidos: "https://images.unsplash.com/photo-1583433306546-ded68847fd0d?w=400&h=530&fit=crop&auto=format",
  "Tops & Remeras": "https://images.unsplash.com/photo-1596484552993-aec4311d3381?w=400&h=530&fit=crop&auto=format",
  Buzos: "https://images.unsplash.com/photo-1640921734615-aeb4efe3e614?w=400&h=530&fit=crop&auto=format",
  Pantalones: "https://images.unsplash.com/photo-1745340706511-7e9cba5d5305?w=400&h=530&fit=crop&auto=format",
};
const CAT_MAP: Record<string, string[]> = {
  Vestidos: ["Vestidos"],
  "Tops & Remeras": ["Remeras", "Tops"],
  Buzos: ["Buzos"],
  Pantalones: ["Pantalones"],
};
const CATEGORIES = ["Todos", ...Object.keys(CAT_MAP)];

const SIZE_GUIDE = [
  { size: "XS", busto: "82-86", cintura: "62-66", cadera: "88-92" },
  { size: "S", busto: "86-90", cintura: "66-70", cadera: "92-96" },
  { size: "M", busto: "90-94", cintura: "70-74", cadera: "96-100" },
  { size: "L", busto: "94-98", cintura: "74-78", cadera: "100-104" },
  { size: "XL", busto: "98-104", cintura: "78-84", cadera: "104-110" },
  { size: "XXL", busto: "104-110", cintura: "84-90", cadera: "110-116" },
];

const ANNOUNCEMENTS = [
  "Envío gratis en compras +$15.000",
  "Cambios sin costo",
  "3 cuotas sin interés",
  "Nuevas prendas cada semana",
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "novedades", label: "Novedades" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

type SortBy = "destacados" | "novedades" | "precio-asc" | "precio-desc";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem("oc_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function Circle({ className, filled = false, color = "#111" }: { className?: string; filled?: boolean; color?: string }) {
  return filled ? (
    <div className={`rounded-full ${className}`} style={{ backgroundColor: color }} aria-hidden />
  ) : (
    <div className={`rounded-full border-2 ${className}`} style={{ borderColor: color }} aria-hidden />
  );
}
function ZigZag({ className, color = "#111" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 20" className={className} aria-hidden>
      <polyline
        points="0,10 15,2 30,18 45,2 60,18 75,2 90,18 105,2 120,10"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
function DotGrid({ className, color = "#111" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      {[0, 20, 40, 60].flatMap((y) =>
        [0, 20, 40, 60].map((x) => (
          <circle key={`${x}-${y}`} cx={x + 10} cy={y + 10} r="3" fill={color} />
        ))
      )}
    </svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "#E8143A" : "none"}
      stroke={filled ? "#E8143A" : "currentColor"}
      strokeWidth="2"
      className={filled ? "animate-pop-in" : ""}
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

/** Fades a section up into view the first time it scrolls into the viewport. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export default function Store({
  store,
  onAdminClick,
}: {
  store: AppStore;
  onAdminClick: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("destacados");
  const [sortOpen, setSortOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [qtyByProduct, setQtyByProduct] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    localStorage.setItem("oc_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const { products } = store;
  const activeProducts = products.filter((p) => p.active);

  const availableSizes = Array.from(
    new Set(activeProducts.flatMap((p) => Object.keys(p.stock).filter((s) => p.stock[s] > 0)))
  ).sort((a, b) => ["XS", "S", "M", "L", "XL", "XXL"].indexOf(a) - ["XS", "S", "M", "L", "XL", "XXL"].indexOf(b));

  let filtered =
    activeCategory === "Todos"
      ? activeProducts
      : activeProducts.filter((p) => {
          const cats = CAT_MAP[activeCategory];
          return cats ? cats.includes(p.category) : p.category === activeCategory;
        });

  if (sizeFilter) {
    filtered = filtered.filter((p) => (p.stock[sizeFilter] ?? 0) > 0);
  }

  filtered = [...filtered];
  if (sortBy === "precio-asc") filtered.sort((a, b) => a.salePrice - b.salePrice);
  if (sortBy === "precio-desc") filtered.sort((a, b) => b.salePrice - a.salePrice);
  if (sortBy === "novedades") filtered.reverse();

  const cartTotal = cart.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  function getQty(productId: string, max: number) {
    return Math.min(qtyByProduct[productId] || 1, Math.max(max, 1));
  }
  function setQty(productId: string, qty: number, max: number) {
    setQtyByProduct((prev) => ({ ...prev, [productId]: Math.max(1, Math.min(qty, Math.max(max, 1))) }));
  }

  function addToCart(productId: string, productName: string, unitPrice: number, size: string, qty: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { productId, productName, size, qty, unitPrice }];
    });
    setCartOpen(true);
  }

  function removeFromCart(productId: string, size: string) {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }

  function updateCartQty(productId: string, size: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size ? { ...i, qty: Math.max(1, i.qty + delta) } : i
        )
    );
  }

  function sendWhatsApp() {
    const lines = cart
      .map((i) => `• ${i.productName} (Talle ${i.size}) x${i.qty} — ${$(i.unitPrice * i.qty)}`)
      .join("\n");
    const msg = `Hola! Quería hacer este pedido:\n\n${lines}\n\nTotal aproximado: ${$(cartTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="min-h-full bg-[#FAFAF9] text-[#111] overflow-x-hidden font-outfit">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF9]/95 backdrop-blur border-b border-[#111] flex items-center justify-between px-6 md:px-12 h-16">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Onda Chic" className="h-12 w-12 object-contain" />
          <span className="font-fraunces font-black text-xl tracking-tight leading-none hidden sm:inline">
            ONDA <span className="text-[#E8143A]">CHIC</span>
          </span>
        </div>

        <ul className="hidden md:flex gap-8 font-outfit font-medium text-sm tracking-widest uppercase">
          {["Colecciones", "Novedades", "Sale", "Nosotras"].map((l) => (
            <li key={l} className="relative group">
              <button className="transition-colors duration-200 group-hover:text-[#E8143A]">{l}</button>
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#E8143A] transition-all duration-300 group-hover:w-full" />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 md:gap-3">
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="hidden md:block p-2 hover:text-[#E8143A] hover:-translate-y-0.5 transition-all"
            aria-label="Guía de talles"
            title="Guía de talles"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="7" width="18" height="10" rx="1" />
              <path d="M7 7v3M11 7v5M15 7v3M19 7v5" />
            </svg>
          </button>
          <button
            className="relative p-2 hover:text-[#E8143A] hover:-translate-y-0.5 transition-all"
            aria-label={`Favoritos, ${favorites.length} productos`}
          >
            <HeartIcon filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span key={favorites.length} className="absolute -top-1 -right-1 bg-[#111] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pop-in">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 hover:text-[#E8143A] hover:-translate-y-0.5 transition-all"
            aria-label={`Carrito, ${cartCount} artículos`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span key={cartCount} className="absolute -top-1 -right-1 bg-[#E8143A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pop-in">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={onAdminClick}
            className="hidden md:block font-outfit text-xs uppercase tracking-widest border border-[#111] px-3 py-1.5 hover:bg-[#111] hover:text-white transition-colors duration-200"
          >
            Admin
          </button>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300" style={{ transform: menuOpen ? "rotate(90deg)" : "none" }}>
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden bg-[#111] text-[#FAFAF9] px-8 overflow-hidden transition-all duration-300 ease-out ${menuOpen ? "max-h-96 py-6 opacity-100" : "max-h-0 py-0 opacity-0"}`}
      >
        <ul className="flex flex-col gap-4 font-outfit font-semibold text-lg tracking-widest uppercase">
          {["Colecciones", "Novedades", "Sale", "Nosotras"].map((l) => (
            <li key={l}>
              <button onClick={() => setMenuOpen(false)} className="hover:text-[#E8143A] transition-colors">
                {l}
              </button>
            </li>
          ))}
          <li>
            <button onClick={() => { setMenuOpen(false); setSizeGuideOpen(true); }} className="hover:text-[#E8143A] transition-colors">
              Guía de talles
            </button>
          </li>
          <li>
            <button onClick={() => { setMenuOpen(false); onAdminClick(); }} className="hover:text-[#E8143A] transition-colors">
              Admin
            </button>
          </li>
        </ul>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[90vh] grid grid-cols-1 md:grid-cols-2">
        <div className="relative flex flex-col justify-center px-8 md:px-16 py-20 z-10">
          <Circle className="absolute top-8 right-8 w-16 h-16 opacity-70 animate-float" />
          <DotGrid className="absolute bottom-16 left-4 w-20 h-20 opacity-30" />

          <p
            className="font-outfit font-semibold tracking-[0.25em] text-xs uppercase text-[#E8143A] mb-4 opacity-0 animate-[fadeScaleIn_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "80ms" }}
          >
            Colección Verano 2026
          </p>
          <h1
            className="font-fraunces font-black text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] tracking-tight mb-6 opacity-0 animate-[fadeScaleIn_0.7s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "200ms" }}
          >
            LA MODA<br />
            <span className="italic text-[#E8143A]">ES TU</span><br />
            ONDA.
          </h1>
          <ZigZag className="w-32 mb-6 opacity-0 animate-[fadeScaleIn_0.6s_ease_forwards]" style={{ animationDelay: "380ms" } as React.CSSProperties} />
          <p
            className="font-outfit text-base text-[#444] max-w-xs leading-relaxed mb-10 opacity-0 animate-[fadeScaleIn_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "440ms" }}
          >
            Piezas únicas con actitud, color y la vibra latina que te define. Venta minorista y mayorista.
          </p>
          <div
            className="flex flex-wrap gap-4 opacity-0 animate-[fadeScaleIn_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ animationDelay: "540ms" }}
          >
            <button
              onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#111] text-white font-outfit font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#E8143A] hover:-translate-y-0.5 transition-all duration-200"
            >
              Ver Colección
            </button>
            <button
              onClick={() => { setActiveCategory("Todos"); document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }); }}
              className="border border-[#111] font-outfit font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#111] hover:text-white hover:-translate-y-0.5 transition-all duration-200"
            >
              Sale
            </button>
          </div>
        </div>

        <div className="relative bg-[#EFEDE8] min-h-[60vw] md:min-h-0 overflow-hidden">
          <img
            src={HERO_IMG}
            alt="Modelo con vestido, actitud urbana"
            className="absolute inset-0 w-full h-full object-cover object-top scale-105 animate-[fadeScaleIn_1s_cubic-bezier(0.22,1,0.36,1)_forwards]"
          />
          <Circle filled className="absolute bottom-0 right-0 w-32 h-32 opacity-90 animate-float-slow" color="#111" />
          <Circle className="absolute top-8 -right-4 w-24 h-24 opacity-90 animate-float" color="#FAFAF9" />
          <div className="absolute bottom-8 left-8 bg-[#FAFAF9] border border-[#111] px-5 py-3 shadow-lg">
            <p className="font-fraunces font-black text-xl">¡Hasta 40% OFF!</p>
            <p className="font-outfit text-xs uppercase tracking-widest text-[#E8143A] font-semibold">En selección de sale</p>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENT — animated ticker */}
      <div className="bg-[#111] text-[#FAFAF9] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span key={i} className="mx-8 font-outfit font-semibold text-xs tracking-[0.3em] uppercase">
              ✦ {a}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORÍAS */}
      <section className="py-20 px-6 md:px-12">
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <p className="font-outfit text-xs uppercase tracking-[0.3em] text-[#E8143A] font-semibold mb-2">Explorá</p>
            <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight">Categorías</h2>
          </div>
          <ZigZag className="w-24 hidden md:block" color="#E8143A" />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CAT_IMGS).map(([label, img], i) => (
            <Reveal key={label} delay={i * 80}>
              <button
                className="group relative aspect-[3/4] overflow-hidden text-left w-full"
                onClick={() => {
                  setActiveCategory(label);
                  document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="font-fraunces font-black text-xl text-white leading-tight">{label}</h3>
                  <p className="font-outfit text-xs text-white/80 uppercase tracking-widest mt-1 flex items-center gap-1">
                    Ver más
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="py-20 px-6 md:px-12 bg-[#F4F3F0]">
        <Reveal className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-outfit text-xs uppercase tracking-[0.3em] text-[#E8143A] font-semibold mb-2">Lo más querido</p>
              <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight">Piezas Destacadas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-outfit text-xs font-semibold uppercase tracking-widest px-4 py-2 border border-[#111] transition-all duration-200 ${activeCategory === cat ? "bg-[#111] text-[#FAFAF9] scale-105" : "bg-transparent hover:bg-[#111] hover:text-white"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros: talle + orden */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#e2ded5]">
            <span className="font-outfit text-xs uppercase tracking-widest text-[#666] font-semibold mr-1">Talle:</span>
            <button
              onClick={() => setSizeFilter(null)}
              className={`text-xs font-outfit font-semibold px-3 py-1.5 border border-[#111] transition-all duration-150 ${!sizeFilter ? "bg-[#111] text-white" : "hover:bg-[#111]/10"}`}
            >
              Todos
            </button>
            {availableSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSizeFilter(s === sizeFilter ? null : s)}
                className={`text-xs font-outfit font-semibold px-3 py-1.5 border border-[#111] transition-all duration-150 ${sizeFilter === s ? "bg-[#111] text-white" : "hover:bg-[#111]/10"}`}
              >
                {s}
              </button>
            ))}

            <div className="relative ml-auto">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 text-xs font-outfit font-semibold px-3 py-1.5 border border-[#111] hover:bg-[#111]/10 transition-colors"
              >
                Ordenar: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}>
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#111] shadow-lg z-20 min-w-[200px] animate-fade-scale-in origin-top-right">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setSortBy(o.value); setSortOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-xs font-outfit font-medium hover:bg-[#F4F3F0] transition-colors ${sortBy === o.value ? "text-[#E8143A] font-semibold" : ""}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <p className="text-center py-20 text-[#888] font-outfit">No hay productos que coincidan con estos filtros.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((product, i) => {
              const sizes = Object.keys(product.stock).filter((s) => product.stock[s] > 0);
              const selectedSize = selectedSizes[product.id] || sizes[0] || "";
              const stockForSize = selectedSize ? product.stock[selectedSize] ?? 0 : 0;
              const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);
              const qty = getQty(product.id, stockForSize);
              const isFav = favorites.includes(product.id);

              return (
                <Reveal key={product.id} delay={(i % 6) * 70}>
                  <div className="group">
                    <div className="relative aspect-[3/4] bg-[#e8e6e0] overflow-hidden mb-3">
                      <img
                        src={`https://images.unsplash.com/photo-1583433306546-ded68847fd0d?w=600&h=750&fit=crop&auto=format&sig=${product.id}`}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:scale-110 transition-transform duration-200"
                        aria-label="Favorito"
                      >
                        <HeartIcon filled={isFav} />
                      </button>
                      {totalStock === 0 && (
                        <div className="absolute top-3 left-3 bg-[#111] text-white font-outfit font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                          Sin stock
                        </div>
                      )}
                      {totalStock > 0 && totalStock <= product.minStock && (
                        <div className="absolute top-3 left-3 bg-[#E8143A] text-white font-outfit font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                          Últimas unidades
                        </div>
                      )}
                      <button
                        onClick={() => addToCart(product.id, product.name, product.salePrice, selectedSize, qty)}
                        disabled={totalStock === 0}
                        className="absolute bottom-0 left-0 right-0 bg-[#111] text-[#FAFAF9] font-outfit font-bold text-xs uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#E8143A] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        + Agregar al pedido
                      </button>
                    </div>
                    <h3 className="font-fraunces font-bold text-lg leading-tight mb-1">{product.name}</h3>
                    <p className="font-outfit font-semibold text-[#E8143A] text-base mb-2">{$(product.salePrice)}</p>
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))}
                            className={`text-[10px] font-outfit font-semibold px-2 py-0.5 border border-[#111] transition-all duration-150 ${selectedSize === s ? "bg-[#111] text-white scale-105" : "hover:bg-[#111]/10"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {stockForSize > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(product.id, qty - 1, stockForSize)}
                          className="w-6 h-6 flex items-center justify-center border border-[#111] text-xs font-bold hover:bg-[#111] hover:text-white transition-colors"
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="font-outfit text-xs font-semibold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => setQty(product.id, qty + 1, stockForSize)}
                          className="w-6 h-6 flex items-center justify-center border border-[#111] text-xs font-bold hover:bg-[#111] hover:text-white transition-colors"
                          aria-label="Sumar"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* PROMO BANNER */}
      <Reveal>
        <section className="relative overflow-hidden bg-[#111] py-24 px-6 md:px-16">
          <Circle className="absolute -top-12 -right-12 w-56 h-56 opacity-20 animate-float-slow" color="#FAFAF9" />
          <Circle className="absolute -bottom-20 -left-16 w-72 h-72 opacity-10 animate-float" color="#FAFAF9" />
          <DotGrid className="absolute top-8 left-8 w-24 h-24 opacity-20" color="#FAFAF9" />
          <div className="relative z-10 max-w-2xl">
            <p className="font-outfit text-xs uppercase tracking-[0.35em] text-[#E8143A] font-semibold mb-4">Oferta de temporada</p>
            <h2 className="font-fraunces font-black text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] text-white mb-6">
              NUEVA<br /><span className="italic text-[#E8143A]">COLECCIÓN</span><br />YA DISPONIBLE
            </h2>
            <ZigZag className="w-36 mb-8" color="#FAFAF9" />
            <button
              onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-block bg-[#FAFAF9] text-[#111] font-outfit font-black text-sm tracking-widest uppercase px-10 py-4 hover:bg-[#E8143A] hover:text-white hover:-translate-y-0.5 transition-all duration-200"
            >
              Descubrila ahora
            </button>
          </div>
        </section>
      </Reveal>

      {/* NEWSLETTER */}
      <Reveal>
        <section className="py-24 px-6 md:px-12 bg-[#F4F3F0] relative overflow-hidden">
          <DotGrid className="absolute top-6 right-24 w-20 h-20 opacity-20" />
          <div className="max-w-xl relative z-10 mx-auto text-center">
            <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight mb-4 text-[#111]">
              ¿Querés ser<br /><span className="italic text-[#E8143A]">la primera</span><br />en enterarte?
            </h2>
            <p className="font-outfit text-sm text-[#555] mb-8 leading-relaxed">
              Suscribite y recibí novedades, descuentos exclusivos y nuevas colecciones antes que nadie.
            </p>
            {subscribed ? (
              <div className="bg-[#111] text-[#FAFAF9] font-outfit font-bold text-sm tracking-wide px-8 py-4 inline-block animate-fade-scale-in">
                ¡Gracias! Ya sos parte de la onda ✦
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) { setSubscribed(true); setEmail(""); } }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 bg-white border border-[#111] px-5 py-4 font-outfit text-sm placeholder-[#999] focus:outline-none focus:border-[#E8143A] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#111] text-white font-outfit font-black text-xs uppercase tracking-widest px-8 py-4 hover:bg-[#E8143A] transition-colors duration-200 whitespace-nowrap"
                >
                  Suscribirme
                </button>
              </form>
            )}
          </div>
        </section>
      </Reveal>

      {/* FOOTER */}
      <footer className="bg-[#111] text-[#FAFAF9] pt-16 pb-8 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <img src="/logo.png" alt="Onda Chic" className="h-20 w-20 object-contain mb-3" />
            <p className="font-outfit text-sm text-[#999] leading-relaxed max-w-xs">
              Boutique de ropa y accesorios con actitud. Buenos Aires, Argentina.
            </p>
            <div className="flex gap-4 mt-6">
              {["Instagram", "TikTok", "WhatsApp"].map((s) => (
                <button key={s} className="font-outfit text-xs uppercase tracking-widest text-[#999] hover:text-[#E8143A] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-outfit font-bold text-xs uppercase tracking-widest text-[#E8143A] mb-5">Tienda</h4>
            <ul className="space-y-3">
              {["Novedades", "Vestidos", "Buzos & Remeras", "Sale"].map((l) => (
                <li key={l}><button className="font-outfit text-sm text-[#999] hover:text-[#FAFAF9] transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-outfit font-bold text-xs uppercase tracking-widest text-[#E8143A] mb-5">Ayuda</h4>
            <ul className="space-y-3">
              {["Cómo comprar", "Cambios y devoluciones", "Envíos", "Contacto"].map((l) => (
                <li key={l}>
                  <button
                    onClick={() => l === "Cómo comprar" && setSizeGuideOpen(true)}
                    className="font-outfit text-sm text-[#999] hover:text-[#FAFAF9] transition-colors"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#333] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-outfit text-xs text-[#666]">© 2026 Onda Chic. Todos los derechos reservados.</p>
          <ZigZag className="w-20" color="#E8143A" />
        </div>
      </footer>

      {/* GUÍA DE TALLES */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSizeGuideOpen(false)} />
          <div className="relative bg-white max-w-lg w-full p-8 shadow-2xl animate-fade-scale-in max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 p-1 hover:text-[#E8143A] transition-colors"
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h2 className="font-fraunces font-black text-3xl mb-2">Guía de Talles</h2>
            <p className="font-outfit text-sm text-[#666] mb-6">Medidas orientativas en centímetros. Cada prenda puede variar levemente según el corte.</p>
            <table className="w-full text-sm font-outfit">
              <thead>
                <tr className="border-b-2 border-[#111]">
                  <th className="text-left py-2 font-bold uppercase text-xs tracking-widest">Talle</th>
                  <th className="text-left py-2 font-bold uppercase text-xs tracking-widest">Busto</th>
                  <th className="text-left py-2 font-bold uppercase text-xs tracking-widest">Cintura</th>
                  <th className="text-left py-2 font-bold uppercase text-xs tracking-widest">Cadera</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.size} className="border-b border-[#eee] hover:bg-[#F4F3F0] transition-colors">
                    <td className="py-2.5 font-bold">{row.size}</td>
                    <td className="py-2.5 text-[#555]">{row.busto} cm</td>
                    <td className="py-2.5 text-[#555]">{row.cintura} cm</td>
                    <td className="py-2.5 text-[#555]">{row.cadera} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
        <div
          className={`relative bg-[#FAFAF9] w-full max-w-sm flex flex-col h-full shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
            <h2 className="font-fraunces font-black text-2xl">Tu Pedido</h2>
            <button onClick={() => setCartOpen(false)} className="p-1 hover:text-[#E8143A] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-[#999] font-outfit mt-12">Tu carrito está vacío.</p>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between gap-3 border-b border-[#e0ded8] pb-4 animate-fade-scale-in">
                  <div>
                    <p className="font-fraunces font-bold text-base">{item.productName}</p>
                    <p className="font-outfit text-xs text-[#666]">Talle {item.size}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => updateCartQty(item.productId, item.size, -1)}
                        className="w-5 h-5 flex items-center justify-center border border-[#111] text-[10px] font-bold hover:bg-[#111] hover:text-white transition-colors"
                      >
                        −
                      </button>
                      <span className="font-outfit text-xs font-semibold w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.size, 1)}
                        className="w-5 h-5 flex items-center justify-center border border-[#111] text-[10px] font-bold hover:bg-[#111] hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-outfit font-semibold text-[#E8143A] text-sm mt-1">{$(item.unitPrice * item.qty)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="text-[#999] hover:text-[#E8143A] transition-colors text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="px-6 py-5 border-t border-[#111]">
              <div className="flex justify-between mb-5">
                <span className="font-outfit font-semibold">Total aproximado</span>
                <span className="font-fraunces font-black text-xl text-[#E8143A]">{$(cartTotal)}</span>
              </div>
              <button
                onClick={sendWhatsApp}
                className="w-full bg-[#25D366] text-white font-outfit font-black text-sm uppercase tracking-widest py-4 hover:bg-[#1da851] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Enviar por WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
