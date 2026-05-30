import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light-bg" role="status" aria-label="Betöltés...">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 border-b border-gray-200 bg-white px-4 min-h-[56px] shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-dark-navy rounded-md hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Menü megnyitása"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-heading text-sm font-bold text-dark-navy truncate">
            Gerecse Ingatlan Admin
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
