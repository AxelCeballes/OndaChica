import { useState } from "react";
import type { AppStore } from "../useStore";

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

function YellowCircle({ className }: { className?: string }) {
  return <div className={`rounded-full bg-[#FFD600] ${className}`} aria-hidden />;
}
function ZigZag({ className, color = "#FFD600" }: { className?: string; color?: string }) {
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
function DotGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      {[0, 20, 40, 60].flatMap((y) =>
        [0, 20, 40, 60].map((x) => (
          <circle key={`${x}-${y}`} cx={x + 10} cy={y + 10} r="3" fill="#111" />
        ))
      )}
    </svg>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const { products } = store;
  const activeProducts = products.filter((p) => p.active);

  const filtered =
    activeCategory === "Todos"
      ? activeProducts
      : activeProducts.filter((p) => {
          const cats = CAT_MAP[activeCategory];
          return cats ? cats.includes(p.category) : p.category === activeCategory;
        });

  const cartTotal = cart.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  function addToCart(productId: string, productName: string, unitPrice: number) {
    const size = selectedSizes[productId] || "M";
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { productId, productName, size, qty: 1, unitPrice }];
    });
    setCartOpen(true);
  }

  function removeFromCart(productId: string, size: string) {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }

  function sendWhatsApp() {
    const lines = cart
      .map((i) => `• ${i.productName} (Talle ${i.size}) x${i.qty} — ${$(i.unitPrice * i.qty)}`)
      .join("\n");
    const msg = `Hola! Quería hacer este pedido:\n\n${lines}\n\nTotal aproximado: ${$(cartTotal)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const CATEGORIES = ["Todos", ...Object.keys(CAT_MAP)];

  return (
    <div className="min-h-full bg-[#FAF8F2] text-[#111] overflow-x-hidden font-outfit">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#FAF8F2] border-b-2 border-[#111] flex items-center justify-between px-6 md:px-12 h-16">
        <div className="font-fraunces font-black text-2xl tracking-tight leading-none">
          ONDA<br />
          <span className="text-[#E8143A]">CHICA</span>
        </div>

        <ul className="hidden md:flex gap-8 font-outfit font-medium text-sm tracking-widest uppercase">
          {["Colecciones", "Novedades", "Sale", "Nosotras"].map((l) => (
            <li key={l}>
              <button className="hover:text-[#E8143A] transition-colors duration-200">{l}</button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 hover:text-[#E8143A] transition-colors"
            aria-label={`Carrito, ${cartCount} artículos`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E8143A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={onAdminClick}
            className="hidden md:block font-outfit text-xs uppercase tracking-widest border-2 border-[#111] px-3 py-1.5 hover:bg-[#111] hover:text-white transition-colors"
          >
            Admin
          </button>
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {menuOpen && (
        <div className="md:hidden bg-[#111] text-[#FAF8F2] px-8 py-6 z-40">
          <ul className="flex flex-col gap-4 font-outfit font-semibold text-lg tracking-widest uppercase">
            {["Colecciones", "Novedades", "Sale", "Nosotras"].map((l) => (
              <li key={l}>
                <button onClick={() => setMenuOpen(false)} className="hover:text-[#FFD600] transition-colors">
                  {l}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => { setMenuOpen(false); onAdminClick(); }} className="hover:text-[#FFD600] transition-colors">
                Admin
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[90vh] grid grid-cols-1 md:grid-cols-2">
        <div className="relative flex flex-col justify-center px-8 md:px-16 py-20 z-10">
          <YellowCircle className="absolute top-8 right-8 w-16 h-16 opacity-80" />
          <DotGrid className="absolute bottom-16 left-4 w-20 h-20 opacity-40" />

          <p className="font-outfit font-semibold tracking-[0.25em] text-xs uppercase text-[#E8143A] mb-4">
            Colección Verano 2026
          </p>
          <h1 className="font-fraunces font-black text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] tracking-tight mb-6">
            LA MODA<br />
            <span className="italic text-[#E8143A]">ES TU</span><br />
            ONDA.
          </h1>
          <ZigZag className="w-32 mb-6" />
          <p className="font-outfit text-base text-[#444] max-w-xs leading-relaxed mb-10">
            Piezas únicas con actitud, color y la vibra latina que te define. Venta minorista y mayorista.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#E8143A] text-white font-outfit font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#111] transition-colors duration-200"
            >
              Ver Colección
            </button>
            <button className="border-2 border-[#111] font-outfit font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#FFD600] transition-colors duration-200">
              Sale
            </button>
          </div>
        </div>

        <div className="relative bg-[#f0e8da] min-h-[60vw] md:min-h-0 overflow-hidden">
          <img
            src={HERO_IMG}
            alt="Modelo con vestido, actitud urbana"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FFD600] opacity-70 pointer-events-none" />
          <div className="absolute top-8 -right-4 w-24 h-24 rounded-full border-4 border-[#FFD600] opacity-80 pointer-events-none" />
          <div className="absolute bottom-8 left-8 bg-[#FAF8F2] border-2 border-[#111] px-5 py-3">
            <p className="font-fraunces font-black text-xl">¡Hasta 40% OFF!</p>
            <p className="font-outfit text-xs uppercase tracking-widest text-[#E8143A] font-semibold">En selección de sale</p>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENT */}
      <div className="bg-[#111] text-[#FFD600] py-3 px-4 text-center font-outfit font-semibold text-xs tracking-[0.3em] uppercase">
        <span className="inline-flex flex-wrap justify-center gap-8 md:gap-16">
          <span>✦ Envío gratis en compras +$15.000</span>
          <span>✦ Cambios sin costo</span>
          <span>✦ 3 cuotas sin interés</span>
          <span>✦ Nuevas prendas cada semana</span>
        </span>
      </div>

      {/* CATEGORÍAS */}
      <section className="py-20 px-6 md:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-outfit text-xs uppercase tracking-[0.3em] text-[#E8143A] font-semibold mb-2">Explorá</p>
            <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight">Categorías</h2>
          </div>
          <ZigZag className="w-24 hidden md:block" color="#E8143A" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CAT_IMGS).map(([label, img], i) => (
            <button
              key={label}
              className="group relative aspect-[3/4] overflow-hidden text-left"
              onClick={() => {
                setActiveCategory(label);
                document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 bg-[#E8143A]" />
              <div
                className="absolute top-3 right-3 w-8 h-8"
                style={{ backgroundColor: i % 2 === 0 ? "#FFD600" : "#FAF8F2" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-fraunces font-black text-xl text-white leading-tight">{label}</h3>
                <p className="font-outfit text-xs text-white/80 uppercase tracking-widest mt-1 group-hover:underline">Ver más →</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="py-20 px-6 md:px-12 bg-[#F0EDE6]">
        <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between mb-10">
          <div>
            <p className="font-outfit text-xs uppercase tracking-[0.3em] text-[#E8143A] font-semibold mb-2">Lo más querido</p>
            <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight">Piezas Destacadas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-outfit text-xs font-semibold uppercase tracking-widest px-4 py-2 border-2 border-[#111] transition-all duration-150 ${activeCategory === cat ? "bg-[#111] text-[#FAF8F2]" : "bg-transparent hover:bg-[#FFD600]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-20 text-[#888] font-outfit">No hay productos en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((product) => {
              const sizes = Object.keys(product.stock).filter((s) => product.stock[s] > 0);
              const selectedSize = selectedSizes[product.id] || sizes[0] || "";
              const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);

              return (
                <div key={product.id} className="group">
                  <div className="relative aspect-[3/4] bg-[#e8e3da] overflow-hidden mb-3">
                    <img
                      src={`https://images.unsplash.com/photo-1583433306546-ded68847fd0d?w=600&h=750&fit=crop&auto=format&sig=${product.id}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {totalStock === 0 && (
                      <div className="absolute top-3 left-3 bg-[#111] text-white font-outfit font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                        Sin stock
                      </div>
                    )}
                    {totalStock > 0 && totalStock <= product.minStock && (
                      <div className="absolute top-3 left-3 bg-[#FFD600] text-[#111] font-outfit font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                        ⚠ Últimas unidades
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id, product.name, product.salePrice)}
                      disabled={totalStock === 0}
                      className="absolute bottom-0 left-0 right-0 bg-[#111] text-[#FAF8F2] font-outfit font-bold text-xs uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      + Agregar al pedido
                    </button>
                  </div>
                  <h3 className="font-fraunces font-bold text-lg leading-tight mb-1">{product.name}</h3>
                  <p className="font-outfit font-semibold text-[#E8143A] text-base mb-2">{$(product.salePrice)}</p>
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: s }))}
                          className={`text-[10px] font-outfit font-semibold px-2 py-0.5 border border-[#111] transition-colors ${selectedSize === s ? "bg-[#111] text-white" : "hover:bg-[#FFD600]"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PROMO BANNER */}
      <section className="relative overflow-hidden bg-[#E8143A] py-24 px-6 md:px-16">
        <YellowCircle className="absolute -top-12 -right-12 w-56 h-56 opacity-30" />
        <YellowCircle className="absolute -bottom-20 -left-16 w-72 h-72 opacity-20" />
        <DotGrid className="absolute top-8 left-8 w-24 h-24 opacity-30" />
        <div className="relative z-10 max-w-2xl">
          <p className="font-outfit text-xs uppercase tracking-[0.35em] text-[#FFD600] font-semibold mb-4">Oferta de temporada</p>
          <h2 className="font-fraunces font-black text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] text-white mb-6">
            NUEVA<br /><span className="italic">COLECCIÓN</span><br />YA DISPONIBLE
          </h2>
          <ZigZag className="w-36 mb-8" color="#FFD600" />
          <button
            onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-block bg-[#FFD600] text-[#111] font-outfit font-black text-sm tracking-widest uppercase px-10 py-4 hover:bg-white transition-colors duration-200"
          >
            Descubrila ahora
          </button>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 px-6 md:px-12 bg-[#FFD600] relative overflow-hidden">
        <DotGrid className="absolute top-6 right-24 w-20 h-20 opacity-20" />
        <div className="max-w-xl relative z-10 mx-auto text-center">
          <h2 className="font-fraunces font-black text-4xl md:text-5xl leading-tight mb-4 text-[#111]">
            ¿Querés ser<br /><span className="italic text-[#E8143A]">la primera</span><br />en enterarte?
          </h2>
          <p className="font-outfit text-sm text-[#333] mb-8 leading-relaxed">
            Suscribite y recibí novedades, descuentos exclusivos y nuevas colecciones antes que nadie.
          </p>
          {subscribed ? (
            <div className="bg-[#111] text-[#FAF8F2] font-outfit font-bold text-sm tracking-wide px-8 py-4 inline-block">
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
                className="flex-1 bg-white border-2 border-[#111] px-5 py-4 font-outfit text-sm placeholder-[#999] focus:outline-none focus:border-[#E8143A] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#E8143A] text-white font-outfit font-black text-xs uppercase tracking-widest px-8 py-4 hover:bg-[#111] transition-colors duration-200 whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] text-[#FAF8F2] pt-16 pb-8 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <p className="font-fraunces font-black text-3xl leading-none mb-3">
              ONDA<br /><span className="text-[#E8143A]">CHICA</span>
            </p>
            <p className="font-outfit text-sm text-[#999] leading-relaxed max-w-xs">
              Boutique de ropa femenina con actitud. Buenos Aires, Argentina.
            </p>
            <div className="flex gap-4 mt-6">
              {["Instagram", "TikTok", "WhatsApp"].map((s) => (
                <button key={s} className="font-outfit text-xs uppercase tracking-widest text-[#999] hover:text-[#FFD600] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-outfit font-bold text-xs uppercase tracking-widest text-[#FFD600] mb-5">Tienda</h4>
            <ul className="space-y-3">
              {["Novedades", "Vestidos", "Buzos & Remeras", "Sale"].map((l) => (
                <li key={l}><button className="font-outfit text-sm text-[#999] hover:text-[#FAF8F2] transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-outfit font-bold text-xs uppercase tracking-widest text-[#FFD600] mb-5">Ayuda</h4>
            <ul className="space-y-3">
              {["Cómo comprar", "Cambios y devoluciones", "Envíos", "Contacto"].map((l) => (
                <li key={l}><button className="font-outfit text-sm text-[#999] hover:text-[#FAF8F2] transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#333] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-outfit text-xs text-[#666]">© 2026 Onda Chica. Todos los derechos reservados.</p>
          <ZigZag className="w-20" color="#E8143A" />
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative bg-[#FAF8F2] w-full max-w-sm flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#111]">
              <h2 className="font-fraunces font-black text-2xl">Tu Pedido</h2>
              <button onClick={() => setCartOpen(false)} className="p-1">
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
                  <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between gap-3 border-b border-[#e0dbd4] pb-4">
                    <div>
                      <p className="font-fraunces font-bold text-base">{item.productName}</p>
                      <p className="font-outfit text-xs text-[#666]">Talle {item.size} · x{item.qty}</p>
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
              <div className="px-6 py-5 border-t-2 border-[#111]">
                <div className="flex justify-between mb-5">
                  <span className="font-outfit font-semibold">Total aproximado</span>
                  <span className="font-fraunces font-black text-xl text-[#E8143A]">{$(cartTotal)}</span>
                </div>
                <button
                  onClick={sendWhatsApp}
                  className="w-full bg-[#25D366] text-white font-outfit font-black text-sm uppercase tracking-widest py-4 hover:bg-[#1da851] transition-colors flex items-center justify-center gap-2"
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
      )}
    </div>
  );
}
