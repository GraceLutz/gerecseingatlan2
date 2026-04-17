import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Home,
  FileText,
  Users,
  Calendar,
  Mail,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/ingatlanok", label: "Ingatlanok", icon: Home },
  { to: "/admin/tartalom", label: "Tartalom", icon: FileText },
  { to: "/admin/munkatarsak", label: "Munkatársak", icon: Users },
  { to: "/admin/naptar", label: "Naptár", icon: Calendar },
  { to: "/admin/hirlevel", label: "Hírlevél", icon: Mail },
];

const adminOnlyItems = [
  { to: "/admin/felhasznalok", label: "Felhasználók", icon: UserCog },
];

const bottomItems = [
  { to: "/admin/beallitasok", label: "Beállítások", icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="flex h-full w-64 flex-col bg-dark-navy text-white" aria-label="Admin navigáció">
      <div className="border-b border-white/10 p-6">
        <h2 className="font-heading text-lg font-bold text-gold">
          Gerecse Ingatlan
        </h2>
        <p className="mt-1 text-xs text-white/60">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-gold font-medium"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}

          {isAdmin &&
            adminOnlyItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 text-gold font-medium"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <ul className="space-y-1" role="list">
          {bottomItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-gold font-medium"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Kijelentkezés
            </button>
          </li>
        </ul>

        {user && (
          <div className="mt-4 rounded-md bg-white/5 p-3">
            <p className="text-xs text-white/80 truncate">{user.email}</p>
            <p className="text-xs text-white/50 capitalize">{user.role}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
