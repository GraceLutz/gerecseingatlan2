import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "pending" | "confirmed" | "unsubscribed";
  confirmedAt: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
  ipAddress: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SummaryInfo {
  total: number;
  confirmed: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Függőben",
  confirmed: "Megerősített",
  unsubscribed: "Leiratkozott",
};

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed:
    "bg-green-100 text-green-800 border-green-200",
  unsubscribed:
    "bg-gray-100 text-gray-600 border-gray-200",
};

export default function NewsletterPage() {
  const { csrfToken } = useAuth();

  useEffect(() => {
    document.title = "Hírlevél | Gerecse Ingatlan Admin";
  }, []);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState<SummaryInfo>({
    total: 0,
    confirmed: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchSubscribers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "25");
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        if (dateFrom) params.set("dateFrom", new Date(dateFrom).toISOString());
        if (dateTo) params.set("dateTo", new Date(dateTo).toISOString());

        const res = await fetch(`/api/admin/newsletter?${params}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Hiba a feliratkozók lekérdezésekor.");

        const data = await res.json();
        setSubscribers(data.subscribers);
        setPagination(data.pagination);
        setSummary(data.summary);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ismeretlen hiba történt."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, dateFrom, dateTo]
  );

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan véglegesen törli ezt a feliratkozót? (GDPR)")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Törlési hiba.");
      await fetchSubscribers(pagination.page);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      setError("Hiba történt a törlés során.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Biztosan véglegesen töröl ${selected.size} feliratkozót? (GDPR)`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/newsletter/bulk", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Törlési hiba.");
      setSelected(new Set());
      await fetchSubscribers(pagination.page);
    } catch {
      setError("Hiba történt a tömeges törlés során.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    window.open("/api/admin/newsletter/export", "_blank");
  };

  const toggleAll = () => {
    if (selected.size === subscribers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(subscribers.map((s) => s.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5C] font-heading">
            Hírlevél feliratkozók
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Feliratkozók kezelése, exportálás és GDPR műveletek
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#1B3A5C]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:ring-offset-2"
          aria-label="Feliratkozók exportálása CSV-be"
        >
          <Download size={16} aria-hidden="true" />
          <span>CSV exportálás</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users size={24} className="text-[#1B3A5C]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Összes feliratkozó</p>
            <p className="text-2xl font-bold text-[#1B3A5C]">
              {summary.total}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle
              size={24}
              className="text-green-600"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Megerősített</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.confirmed}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Mail
              size={24}
              className="text-yellow-600"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Összefoglaló</p>
            <p className="text-sm font-medium text-gray-700">
              Összesen {summary.total} feliratkozó ({summary.confirmed}{" "}
              megerősített)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="newsletter-search"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Keresés
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="newsletter-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="E-mail vagy név..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <label
              htmlFor="newsletter-status"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Státusz
            </label>
            <select
              id="newsletter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent bg-white"
            >
              <option value="">Összes</option>
              <option value="pending">Függőben</option>
              <option value="confirmed">Megerősített</option>
              <option value="unsubscribed">Leiratkozott</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label
              htmlFor="newsletter-date-from"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Dátumtól
            </label>
            <input
              id="newsletter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent"
            />
          </div>
          <div className="min-w-[150px]">
            <label
              htmlFor="newsletter-date-to"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Dátumig
            </label>
            <input
              id="newsletter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-red-800 font-medium">
            {selected.size} feliratkozó kijelölve
          </span>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            aria-label={`${selected.size} kijelölt feliratkozó törlése`}
          >
            {deleting && (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            )}
            <Trash2 size={14} aria-hidden="true" />
            <span>Kijelöltek törlése</span>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3"
        >
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={
                      subscribers.length > 0 &&
                      selected.size === subscribers.length
                    }
                    onChange={toggleAll}
                    aria-label="Összes kijelölése"
                    className="rounded border-gray-300 focus:ring-2 focus:ring-[#1B3A5C]"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Név
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Státusz
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Feliratkozás
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Megerősítés
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Művelet
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-500 mt-2">Betöltés...</p>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Nincs találat.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(sub.id)}
                        onChange={() => toggleOne(sub.id)}
                        aria-label={`${sub.email} kijelölése`}
                        className="rounded border-gray-300 focus:ring-2 focus:ring-[#1B3A5C]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1B3A5C]">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {sub.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[sub.status] ?? ""}`}
                      >
                        {STATUS_LABELS[sub.status] ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(sub.confirmedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                        aria-label={`${sub.email} törlése`}
                        title="GDPR törlés"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>Töröl</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}{" "}
              / {pagination.total} feliratkozó
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchSubscribers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                aria-label="Előző oldal"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => fetchSubscribers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]"
                aria-label="Következő oldal"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
