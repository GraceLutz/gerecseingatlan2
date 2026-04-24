import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Mail,
  UserCog,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Vezérlőpult", icon: LayoutDashboard },
  { to: "/admin/tartalom", label: "Tartalom", icon: FileText },
  { to: "/admin/munkatarsak", label: "Munkatársak", icon: Users },
  { to: "/admin/naptar", label: "Naptár", icon: Calendar },
  { to: "/admin/hirlevel", label: "Hírlevél", icon: Mail },
];

const adminOnlyItems = [
  { to: "/admin/felhasznalok", label: "Felhasználók", icon: UserCog },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 min-h-[44px] text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
      isActive
        ? "bg-white/10 text-gold font-medium"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-dark-navy text-white" aria-label="Admin navigáció">
      <div className="flex items-center justify-between border-b border-white/10">
        <Link to="/admin/dashboard" className="flex-1 block p-6 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <h2 className="font-heading text-lg font-bold text-gold">
            Gerecse Ingatlan
          </h2>
          <p className="mt-1 text-xs text-white/60">Admin</p>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white mr-2"
            aria-label="Menü bezárása"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass} onClick={onClose}>
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}

          {isAdmin &&
            adminOnlyItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} onClick={onClose}>
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <ul className="space-y-1" role="list">
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 min-h-[44px] text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Kijelentkezés
            </button>
          </li>
        </ul>

        {user && (
          <div className="mt-4 rounded-md bg-white/5 p-3">
            <p className="text-xs text-white/80 truncate">{user.email}</p>
            <p className="text-xs text-white/50">
              {{ admin: "Adminisztrátor", editor: "Szerkesztő", viewer: "Megtekintő" }[user.role] ?? user.role}
            </p>
          </div>
        )}
      </div>
    </aside>
  );

  // Mobile: overlay with backdrop
  if (open !== undefined) {
    return (
      <>
        {/* Desktop: always visible */}
        <div className="hidden md:block">{sidebar}</div>

        {/* Mobile: overlay */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={onClose}
              aria-hidden="true"
            />
            <div className="relative z-50 h-full w-64 animate-slide-in-left">
              {sidebar}
            </div>
          </div>
        )}
      </>
    );
  }

  return sidebar;
}
