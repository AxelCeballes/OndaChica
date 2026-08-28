import { useState } from "react";
import { useAppStore } from "./useStore";
import type { AppView, AdminView } from "./types";
import Store from "./pages/Store";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Sales from "./pages/admin/Sales";
import NewSale from "./pages/admin/NewSale";
import Clients from "./pages/admin/Clients";
import Calculator from "./pages/admin/Calculator";
import Expenses from "./pages/admin/Expenses";

export default function App() {
  const store = useAppStore();
  const [appView, setAppView] = useState<AppView>("store");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");

  if (appView === "store") {
    return (
      <Store
        store={store}
        onAdminClick={() => setAppView("admin-login")}
      />
    );
  }

  if (appView === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => setAppView("admin")}
        onBack={() => setAppView("store")}
      />
    );
  }

  return (
    <AdminLayout
      activeView={adminView}
      onViewChange={setAdminView}
      onLogout={() => { setAppView("store"); setAdminView("dashboard"); }}
    >
      {adminView === "dashboard" && (
        <Dashboard store={store} onViewChange={setAdminView} />
      )}
      {adminView === "products" && <Products store={store} />}
      {adminView === "sales" && <Sales store={store} />}
      {adminView === "new-sale" && (
        <NewSale store={store} onDone={() => setAdminView("sales")} />
      )}
      {adminView === "clients" && <Clients store={store} />}
      {adminView === "calculator" && <Calculator />}
      {adminView === "expenses" && <Expenses store={store} />}
    </AdminLayout>
  );
}
