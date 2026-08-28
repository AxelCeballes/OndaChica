export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: Record<string, number>;
  minStock: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  deuda: number;
  createdAt: string;
}

export interface FiadoMovement {
  id: string;
  clientId: string;
  date: string;
  concept: string;
  amount: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  date: string;
  clientName: string;
  clientId?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: "cash" | "transfer" | "card" | "fiado";
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export type AdminView =
  | "dashboard"
  | "products"
  | "sales"
  | "new-sale"
  | "clients"
  | "calculator"
  | "expenses";

export type AppView = "store" | "admin-login" | "admin";
