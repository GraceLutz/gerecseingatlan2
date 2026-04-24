import { useState, useEffect, useCallback } from "react";
import { Search, Plus, UserCheck, UserX, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { safeJson } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Adminisztrátor",
  editor: "Szerkesztő",
  viewer: "Megtekintő",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  editor: "bg-blue-100 text-blue-800",
  viewer: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  useEffect(() => {
    document.title = "Felhasználók | Gerecse Ingatlan Admin";
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { csrfToken } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "editor" | "viewer">("viewer");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Hiba történt a felhasználók betöltésekor.");
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a betöltés során.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        credentials: "include",
        body: JSON.stringify({
          email: createEmail,
          name: createName,
          role: createRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      setShowCreateModal(false);
      setCreateEmail("");
      setCreateName("");
      setCreateRole("viewer");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a létrehozás során.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "editor" | "viewer") => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a módosítás során.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.active ? "deaktiválni" : "aktiválni";
    if (!window.confirm(`Biztosan szeretné ${action} a következő felhasználót: ${user.email}?`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a módosítás során.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Biztosan törölni szeretné a következő felhasználót: ${user.email}?`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a törlés során.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("hu-HU", {
      timeZone: "Europe/Budapest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="p-2 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Felhasználók</h1>
          <p className="text-sm text-gray-500 mt-1">
            Összesen {total} felhasználó
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-dark-navy text-white rounded-lg hover:bg-main-navy transition-colors focus:outline-none focus:ring-2 focus:ring-dark-navy focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Új felhasználó
        </button>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded"
          role="alert"
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 text-red-900 font-bold"
            aria-label="Hiba bezárása"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Keresés név vagy email alapján..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Felhasználó keresése"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" role="status" aria-label="Betöltés">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-2 text-gray-500">Felhasználók betöltése...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nincs találat.</p>
        </div>
      ) : (
        <>
          {/* Users table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Név
                  </th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700">
                    E-mail
                  </th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Szerepkör
                  </th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Állapot
                  </th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Létrehozva
                  </th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                    Műveletek
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.active ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "editor" | "viewer")}
                        disabled={saving}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[user.role]} disabled:cursor-not-allowed`}
                        aria-label={`${user.name} szerepköre`}
                      >
                        <option value="admin">{ROLE_LABELS.admin}</option>
                        <option value="editor">{ROLE_LABELS.editor}</option>
                        <option value="viewer">{ROLE_LABELS.viewer}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.active ? (
                          <>
                            <UserCheck className="h-3 w-3" aria-hidden="true" />
                            Aktív
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3" aria-hidden="true" />
                            Inaktív
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          disabled={saving}
                          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-colors disabled:opacity-50 ${
                            user.active
                              ? "text-orange-600 hover:bg-orange-50 active:bg-orange-100"
                              : "text-green-600 hover:bg-green-50 active:bg-green-100"
                          }`}
                          title={user.active ? "Deaktiválás" : "Aktiválás"}
                          aria-label={`${user.name} ${user.active ? "deaktiválása" : "aktiválása"}`}
                        >
                          {user.active ? (
                            <UserX className="h-5 w-5" />
                          ) : (
                            <UserCheck className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={saving}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors disabled:opacity-50"
                          title="Törlés"
                          aria-label={`${user.name} törlése`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} / {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 min-h-[44px] text-sm border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Előző
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 min-h-[44px] text-sm border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Következő
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create user modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Új felhasználó létrehozása"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Új felhasználó
              </h2>
              <p className="text-sm text-gray-500">
                Az ideiglenes jelszót e-mailben küldjük el.
              </p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Név <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Teljes név"
                  />
                </div>
                <div>
                  <label htmlFor="create-email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail cím <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="create-email"
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    required
                    maxLength={320}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="create-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Szerepkör
                  </label>
                  <select
                    id="create-role"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as "admin" | "editor" | "viewer")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">
                      {ROLE_LABELS.admin} – teljes hozzáférés
                    </option>
                    <option value="editor">
                      {ROLE_LABELS.editor} – tartalom és ingatlanok
                    </option>
                    <option value="viewer">
                      {ROLE_LABELS.viewer} – csak megtekintés
                    </option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateEmail("");
                    setCreateName("");
                    setCreateRole("viewer");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={saving || !createEmail || !createName}
                  className="px-4 py-2 text-white bg-dark-navy hover:bg-main-navy rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Létrehozás..." : "Létrehozás"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
