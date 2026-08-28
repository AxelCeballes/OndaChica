import { useState, useEffect } from "react";
import type { Product, Client, Sale, FiadoMovement, Expense } from "./types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Remera Básica",
    category: "Remeras",
    purchasePrice: 8000,
    salePrice: 14000,
    stock: { S: 5, M: 8, L: 4, XL: 2 },
    minStock: 3,
    active: true,
  },
  {
    id: "p2",
    name: "Buzo Canguro",
    category: "Buzos",
    purchasePrice: 18000,
    salePrice: 30000,
    stock: { S: 3, M: 6, L: 3, XL: 1 },
    minStock: 2,
    active: true,
  },
  {
    id: "p3",
    name: "Vestido Flores",
    category: "Vestidos",
    purchasePrice: 20000,
    salePrice: 36000,
    stock: { S: 2, M: 4, L: 2 },
    minStock: 2,
    active: true,
  },
  {
    id: "p4",
    name: "Pantalón Oxford",
    category: "Pantalones",
    purchasePrice: 16000,
    salePrice: 27000,
    stock: { S: 1, M: 3, L: 4, XL: 2 },
    minStock: 2,
    active: true,
  },
  {
    id: "p5",
    name: "Campera Impermeable",
    category: "Camperas",
    purchasePrice: 35000,
    salePrice: 58000,
    stock: { S: 2, M: 2, L: 1, XL: 0 },
    minStock: 2,
    active: true,
  },
  {
    id: "p6",
    name: "Short Verano",
    category: "Shorts",
    purchasePrice: 9000,
    salePrice: 15500,
    stock: { S: 4, M: 6, L: 3 },
    minStock: 2,
    active: true,
  },
];

const today = new Date();
const fmtDate = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmtDate(d);
};

const SEED_CLIENTS: Client[] = [
  { id: "c1", name: "María González", phone: "11-5555-1234", deuda: 47000, createdAt: daysAgo(30) },
  { id: "c2", name: "Laura Martínez", phone: "11-6666-5678", deuda: 0, createdAt: daysAgo(20) },
  { id: "c3", name: "Carlos Rodríguez", phone: "11-7777-9012", deuda: 75000, createdAt: daysAgo(45) },
  { id: "c4", name: "Ana López", phone: "11-8888-3456", deuda: 15000, createdAt: daysAgo(10) },
];

const SEED_SALES: Sale[] = [
  {
    id: "s1", date: daysAgo(0), clientName: "María González", clientId: "c1",
    items: [{ productId: "p1", productName: "Remera Básica", size: "M", qty: 2, unitPrice: 14000 }],
    total: 28000, paymentMethod: "cash",
  },
  {
    id: "s2", date: daysAgo(0), clientName: "Mostrador",
    items: [{ productId: "p2", productName: "Buzo Canguro", size: "L", qty: 1, unitPrice: 30000 }],
    total: 30000, paymentMethod: "transfer",
  },
  {
    id: "s3", date: daysAgo(1), clientName: "Laura Martínez", clientId: "c2",
    items: [
      { productId: "p3", productName: "Vestido Flores", size: "S", qty: 1, unitPrice: 36000 },
      { productId: "p6", productName: "Short Verano", size: "S", qty: 1, unitPrice: 15500 },
    ],
    total: 51500, paymentMethod: "card",
  },
  {
    id: "s4", date: daysAgo(2), clientName: "Carlos Rodríguez", clientId: "c3",
    items: [{ productId: "p5", productName: "Campera Impermeable", size: "M", qty: 1, unitPrice: 58000 }],
    total: 58000, paymentMethod: "fiado",
  },
  {
    id: "s5", date: daysAgo(3), clientName: "Mostrador",
    items: [{ productId: "p4", productName: "Pantalón Oxford", size: "L", qty: 2, unitPrice: 27000 }],
    total: 54000, paymentMethod: "cash",
  },
  {
    id: "s6", date: daysAgo(4), clientName: "Ana López", clientId: "c4",
    items: [{ productId: "p1", productName: "Remera Básica", size: "L", qty: 3, unitPrice: 14000 }],
    total: 42000, paymentMethod: "fiado",
  },
  {
    id: "s7", date: daysAgo(5), clientName: "Mostrador",
    items: [{ productId: "p2", productName: "Buzo Canguro", size: "M", qty: 2, unitPrice: 30000 }],
    total: 60000, paymentMethod: "cash",
  },
  {
    id: "s8", date: daysAgo(6), clientName: "Mostrador",
    items: [{ productId: "p3", productName: "Vestido Flores", size: "M", qty: 1, unitPrice: 36000 }],
    total: 36000, paymentMethod: "transfer",
  },
];

const SEED_FIADO: FiadoMovement[] = [
  { id: "f1", clientId: "c1", date: daysAgo(10), concept: "2 Remeras Básica", amount: 28000 },
  { id: "f2", clientId: "c1", date: daysAgo(8), concept: "1 Buzo Canguro", amount: 30000 },
  { id: "f3", clientId: "c1", date: daysAgo(5), concept: "Pago parcial", amount: -11000 },
  { id: "f4", clientId: "c3", date: daysAgo(15), concept: "Campera Impermeable", amount: 58000 },
  { id: "f5", clientId: "c3", date: daysAgo(7), concept: "Pantalón Oxford x2", amount: 54000 },
  { id: "f6", clientId: "c3", date: daysAgo(3), concept: "Pago en efectivo", amount: -37000 },
  { id: "f7", clientId: "c4", date: daysAgo(10), concept: "Remera Básica x3", amount: 42000 },
  { id: "f8", clientId: "c4", date: daysAgo(5), concept: "Pago transferencia", amount: -27000 },
];

const SEED_EXPENSES: Expense[] = [
  { id: "e1", date: daysAgo(7), category: "Transporte", description: "Viaje a La Salada", amount: 32000 },
  { id: "e2", date: daysAgo(7), category: "Comida", description: "Comida en el viaje", amount: 12000 },
  { id: "e3", date: daysAgo(3), category: "Bolsas", description: "Bolsas y packaging", amount: 8500 },
  { id: "e4", date: daysAgo(1), category: "Publicidad", description: "Publicación Instagram", amount: 5000 },
];

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}

function useLocalState<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(() => load(key, seed));
  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const updated = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };
  return [value, set] as const;
}

export function useAppStore() {
  const [products, setProducts] = useLocalState<Product[]>("oc_products", SEED_PRODUCTS);
  const [clients, setClients] = useLocalState<Client[]>("oc_clients", SEED_CLIENTS);
  const [sales, setSales] = useLocalState<Sale[]>("oc_sales", SEED_SALES);
  const [fiado, setFiado] = useLocalState<FiadoMovement[]>("oc_fiado", SEED_FIADO);
  const [expenses, setExpenses] = useLocalState<Expense[]>("oc_expenses", SEED_EXPENSES);

  const addProduct = (p: Product) => setProducts((prev) => [...prev, p]);
  const updateProduct = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id));

  const addClient = (c: Client) => setClients((prev) => [...prev, c]);
  const updateClient = (c: Client) =>
    setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));

  const addSale = (s: Sale) => {
    setSales((prev) => [s, ...prev]);
    // deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = s.items.find((i) => i.productId === p.id);
        if (!item) return p;
        return {
          ...p,
          stock: {
            ...p.stock,
            [item.size]: Math.max(0, (p.stock[item.size] ?? 0) - item.qty),
          },
        };
      })
    );
    // if fiado, add debt movement and update client
    if (s.paymentMethod === "fiado" && s.clientId) {
      const mv: FiadoMovement = {
        id: `f${Date.now()}`,
        clientId: s.clientId,
        date: s.date,
        concept: s.items.map((i) => `${i.productName} x${i.qty}`).join(", "),
        amount: s.total,
      };
      setFiado((prev) => [...prev, mv]);
      setClients((prev) =>
        prev.map((c) =>
          c.id === s.clientId ? { ...c, deuda: c.deuda + s.total } : c
        )
      );
    }
  };

  const addFiadoPayment = (clientId: string, amount: number, concept: string) => {
    const mv: FiadoMovement = {
      id: `f${Date.now()}`,
      clientId,
      date: fmtDate(new Date()),
      concept,
      amount: -amount,
    };
    setFiado((prev) => [...prev, mv]);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, deuda: Math.max(0, c.deuda - amount) } : c
      )
    );
  };

  const addFiadoDebt = (clientId: string, amount: number, concept: string) => {
    const mv: FiadoMovement = {
      id: `f${Date.now()}`,
      clientId,
      date: fmtDate(new Date()),
      concept,
      amount,
    };
    setFiado((prev) => [...prev, mv]);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, deuda: c.deuda + amount } : c
      )
    );
  };

  const addExpense = (e: Expense) => setExpenses((prev) => [e, ...prev]);

  // Derived stats
  const todaySales = sales.filter((s) => s.date === fmtDate(today));
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
  const totalFiado = clients.reduce((a, c) => a + c.deuda, 0);
  const totalStock = products.reduce((a, p) => a + Object.values(p.stock).reduce((x, y) => x + y, 0), 0);
  const lowStockCount = products.filter((p) =>
    Object.values(p.stock).some((v) => v <= p.minStock)
  ).length;

  // Estimated profit for today's non-fiado sales
  const todayProfit = todaySales
    .filter((s) => s.paymentMethod !== "fiado")
    .reduce((acc, s) => {
      return (
        acc +
        s.items.reduce((a, item) => {
          const prod = products.find((p) => p.id === item.productId);
          if (!prod) return a;
          return a + (item.unitPrice - prod.purchasePrice) * item.qty;
        }, 0)
      );
    }, 0);

  // Sales for last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i);
    const daySales = sales.filter((s) => s.date === d);
    const total = daySales.reduce((a, s) => a + s.total, 0);
    return { date: d.slice(5), total };
  });

  return {
    products,
    clients,
    sales,
    fiado,
    expenses,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    addSale,
    addFiadoPayment,
    addFiadoDebt,
    addExpense,
    stats: { todayTotal, todayProfit, totalFiado, totalStock, lowStockCount, todaySalesCount: todaySales.length },
    last7,
    SIZES,
    fmtDate: () => fmtDate(new Date()),
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
