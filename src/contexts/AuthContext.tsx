import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { getCsrfToken } from "@/lib/csrf";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "editor" | "viewer";
}

interface AuthContextValue {
  user: AuthUser | null;
  csrfToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Always prefer the cookie value — it's the most up-to-date source
  // (e.g., another tab may have refreshed the token)
  const resolvedCsrfToken = getCsrfToken() ?? csrfToken;

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCsrfToken(data.csrfToken);
      } else {
        setUser(null);
        setCsrfToken(null);
      }
    } catch {
      setUser(null);
      setCsrfToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Bejelentkezési hiba.");
    }

    const data = await res.json();
    setUser(data.user);
    setCsrfToken(data.csrfToken);
  }, []);

  const logout = useCallback(async () => {
    const token = csrfToken ?? getCsrfToken();
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
      },
      credentials: "include",
    });
    setUser(null);
    setCsrfToken(null);
  }, [csrfToken]);

  const value = useMemo(
    () => ({ user, csrfToken: resolvedCsrfToken, loading, login, logout }),
    [user, resolvedCsrfToken, loading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
