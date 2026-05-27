import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  DollarSign,
  MessageSquare,
  Building2,
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Phone,
  Settings,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AgentStats {
  budgetEur: number;
  currentMonthSpend: {
    total: number;
    byService: {
      gemini: number;
      google_maps: number;
    };
  };
  budgetUsedPercent: number;
  dailyRequestCount: number;
  topQueriedProperties: { propertyId: string; count: number }[];
  topQueriedPlaceTypes: { type: string; count: number }[];
}

interface ChatSession {
  id: string;
  userSessionId: string;
  propertyId: string | null;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SessionsResponse {
  sessions: ChatSession[];
  pagination: PaginationInfo;
}

interface AiLead {
  id: string;
  phone: string;
  name: string | null;
  propertyId: string | null;
  conversationSummary: string | null;
  currentPath: string | null;
  status: "uj" | "felhivva" | "nem_elerheto" | "lezart";
  calledAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

interface LeadsResponse {
  leads: AiLead[];
  pagination: PaginationInfo;
}

const DEFAULT_EUR_TO_HUF = 400;

async function fetchStats(): Promise<AgentStats> {
  const res = await fetch("/api/admin/agent/stats", { credentials: "include" });
  if (!res.ok) throw new Error("Hiba a statisztikák lekérdezésekor.");
  return res.json();
}

async function fetchSessions(page: number): Promise<SessionsResponse> {
  const res = await fetch(`/api/admin/agent/sessions?page=${page}&limit=10`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Hiba a munkamenetek lekérdezésekor.");
  return res.json();
}

async function fetchLeads(page: number, statusFilter?: string): Promise<LeadsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (statusFilter) params.set("status", statusFilter);
  const res = await fetch(`/api/admin/agent/leads?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Hiba az érdeklődők lekérdezésekor.");
  return res.json();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatEur(value: number): string {
  return value.toLocaleString("hu-HU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatHuf(eurValue: number, rate: number): string {
  const huf = Math.round(eurValue * rate);
  return huf.toLocaleString("hu-HU").replace(/,/g, " ") + " Ft";
}

function eurWithHuf(eurValue: number, rate: number): string {
  return `${formatEur(eurValue)} € (${formatHuf(eurValue, rate)})`;
}

const LEAD_STATUS_LABELS: Record<string, string> = {
  uj: "Új",
  felhivva: "Felhívva",
  nem_elerheto: "Nem elérhető",
  lezart: "Lezárt",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
  uj: "bg-blue-100 text-blue-800",
  felhivva: "bg-yellow-100 text-yellow-800",
  nem_elerheto: "bg-orange-100 text-orange-800",
  lezart: "bg-gray-100 text-gray-600",
};

function getBudgetColor(percent: number): string {
  if (percent >= 90) return "text-red-600";
  if (percent >= 75) return "text-amber-600";
  return "text-green-600";
}

function getBudgetProgressColor(percent: number): string {
  if (percent >= 90) return "[&>div]:bg-red-500";
  if (percent >= 75) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-green-500";
}

const PLACE_TYPE_LABELS: Record<string, string> = {
  nearby_search: "Közeli helyek keresése",
  place_details: "Hely részletei",
  distance_matrix: "Távolságszámítás",
  supermarket: "Szupermarket",
  school: "Iskola",
  pharmacy: "Gyógyszertár",
  doctor: "Orvos",
  bus_station: "Buszmegálló",
  train_station: "Vasútállomás",
  restaurant: "Étterem",
  park: "Park",
  gym: "Edzőterem",
  kindergarten: "Óvoda",
  playground: "Játszótér",
};

export default function AiAgentPage() {
  useEffect(() => {
    document.title = "AI Asszisztens | Gerecse Ingatlan Admin";
  }, []);

  const { csrfToken } = useAuth();
  const queryClient = useQueryClient();
  const [sessionsPage, setSessionsPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsStatusFilter, setLeadsStatusFilter] = useState<string>("");
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [eurToHuf, setEurToHuf] = useState(DEFAULT_EUR_TO_HUF);

  const stats = useQuery({
    queryKey: ["admin", "agent", "stats"],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });

  const sessions = useQuery({
    queryKey: ["admin", "agent", "sessions", sessionsPage],
    queryFn: () => fetchSessions(sessionsPage),
    refetchInterval: 60_000,
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/agent/sessions/${id}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Hiba a munkamenet törlésekor.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agent"] });
    },
  });

  const leads = useQuery({
    queryKey: ["admin", "agent", "leads", leadsPage, leadsStatusFilter],
    queryFn: () => fetchLeads(leadsPage, leadsStatusFilter || undefined),
    refetchInterval: 60_000,
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/agent/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Hiba az érdeklődő frissítésekor.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agent", "leads"] });
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteSession.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const budgetPercent = stats.data?.budgetUsedPercent ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          AI Asszisztens
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Költségek, használat és munkamenetek áttekintése
        </p>
      </div>

      {/* Budget alert banners */}
      {budgetPercent >= 90 && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"
          role="alert"
        >
          <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
          <span>
            <strong>Kritikus:</strong> A havi költségkeret {budgetPercent}%-a felhasználva.
            {budgetPercent >= 100 && " Az AI asszisztens automatikusan leállt."}
          </span>
        </div>
      )}
      {budgetPercent >= 75 && budgetPercent < 90 && (
        <div
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2"
          role="alert"
        >
          <AlertTriangle size={16} className="shrink-0" aria-hidden="true" />
          <span>
            <strong>Figyelmeztetés:</strong> A havi költségkeret {budgetPercent}%-a felhasználva.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly spend */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign size={24} className="text-[#1B3A5C]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Havi költség</p>
                {stats.isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 mt-1" aria-hidden="true" />
                ) : stats.isError ? (
                  <AlertCircle size={20} className="text-red-400 mt-1" aria-hidden="true" />
                ) : (
                  <p className={`text-2xl font-bold ${getBudgetColor(budgetPercent)}`}>
                    {formatEur(stats.data?.currentMonthSpend.total ?? 0)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatHuf(stats.data?.currentMonthSpend.total ?? 0, eurToHuf)}
                  </p>
                )}
              </div>
            </div>
            {stats.data && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{budgetPercent}%</span>
                  <span>{eurWithHuf(stats.data.budgetEur, eurToHuf)} keret</span>
                </div>
                <Progress
                  value={Math.min(budgetPercent, 100)}
                  className={`h-2 ${getBudgetProgressColor(budgetPercent)}`}
                  aria-label={`Költségkeret kihasználtság: ${budgetPercent}%`}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily requests */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <MessageSquare size={24} className="text-green-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mai kérések</p>
                {stats.isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 mt-1" aria-hidden="true" />
                ) : stats.isError ? (
                  <AlertCircle size={20} className="text-red-400 mt-1" aria-hidden="true" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats.data?.dailyRequestCount ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gemini spend */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Bot size={24} className="text-purple-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gemini költség</p>
                {stats.isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 mt-1" aria-hidden="true" />
                ) : stats.isError ? (
                  <AlertCircle size={20} className="text-red-400 mt-1" aria-hidden="true" />
                ) : (
                  <p className="text-2xl font-bold text-purple-600">
                    {formatEur(stats.data?.currentMonthSpend.byService.gemini ?? 0)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatHuf(stats.data?.currentMonthSpend.byService.gemini ?? 0, eurToHuf)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Maps spend */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <MapPin size={24} className="text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Google Maps költség</p>
                {stats.isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-400 mt-1" aria-hidden="true" />
                ) : stats.isError ? (
                  <AlertCircle size={20} className="text-red-400 mt-1" aria-hidden="true" />
                ) : (
                  <p className="text-2xl font-bold text-amber-600">
                    {formatEur(stats.data?.currentMonthSpend.byService.google_maps ?? 0)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatHuf(stats.data?.currentMonthSpend.byService.google_maps ?? 0, eurToHuf)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top queried properties */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-[#1B3A5C]" aria-hidden="true" />
              Legnépszerűbb ingatlanok
            </h2>
            {stats.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" aria-hidden="true" />
              </div>
            ) : !stats.data?.topQueriedProperties.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Még nincsenek lekérdezések.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Legnépszerűbb ingatlanok">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Ingatlan ID</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Lekérdezések</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.data.topQueriedProperties.map((p) => (
                      <tr key={p.propertyId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs truncate max-w-[200px]">
                          {p.propertyId}
                        </td>
                        <td className="py-2 text-right">
                          <Badge variant="secondary">{p.count}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top queried place types */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#1B3A5C]" aria-hidden="true" />
              Legnépszerűbb helytípusok
            </h2>
            {stats.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" aria-hidden="true" />
              </div>
            ) : !stats.data?.topQueriedPlaceTypes.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Még nincsenek lekérdezések.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Legnépszerűbb helytípusok">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Típus</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Lekérdezések</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.data.topQueriedPlaceTypes.map((pt) => (
                      <tr key={pt.type} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4">
                          {PLACE_TYPE_LABELS[pt.type] ?? pt.type}
                        </td>
                        <td className="py-2 text-right">
                          <Badge variant="secondary">{pt.count}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#1B3A5C]" aria-hidden="true" />
            Munkamenetek
          </h2>
          {sessions.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" aria-hidden="true" />
            </div>
          ) : !sessions.data?.sessions.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Még nincsenek munkamenetek.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Munkamenetek">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Munkamenet</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Ingatlan</th>
                      <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Üzenetek</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Utolsó aktivitás</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Művelet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.data.sessions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs truncate max-w-[120px]">
                          {s.userSessionId.slice(0, 8)}…
                        </td>
                        <td className="py-2 pr-4 text-xs truncate max-w-[120px]">
                          {s.propertyId ? (
                            <span className="font-mono">{s.propertyId.slice(0, 8)}…</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <Badge variant="secondary">{s.messageCount}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(s.lastMessageAt)}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => setDeleteTarget(s)}
                            disabled={deleteSession.isPending}
                            className="inline-flex items-center gap-1 px-2 min-h-[36px] text-xs text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Munkamenet törlése: ${s.userSessionId.slice(0, 8)}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sessions.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Összesen {sessions.data.pagination.total} munkamenet
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSessionsPage((p) => Math.max(1, p - 1))}
                      disabled={sessionsPage <= 1}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Előző oldal"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {sessionsPage} / {sessions.data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setSessionsPage((p) => Math.min(sessions.data!.pagination.totalPages, p + 1))}
                      disabled={sessionsPage >= sessions.data.pagination.totalPages}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Következő oldal"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Leads */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
            <Phone size={18} className="text-[#1B3A5C]" aria-hidden="true" />
            Érdeklődők
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <label htmlFor="lead-status-filter" className="text-sm text-muted-foreground">
              Szűrés:
            </label>
            <select
              id="lead-status-filter"
              value={leadsStatusFilter}
              onChange={(e) => { setLeadsStatusFilter(e.target.value); setLeadsPage(1); }}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Összes</option>
              <option value="uj">Új</option>
              <option value="felhivva">Felhívva</option>
              <option value="nem_elerheto">Nem elérhető</option>
              <option value="lezart">Lezárt</option>
            </select>
          </div>

          {leads.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" aria-hidden="true" />
            </div>
          ) : !leads.data?.leads.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Még nincsenek érdeklődők.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Érdeklődők">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Dátum</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Telefon</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Név</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Ingatlan</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Összefoglaló</th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Státusz</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.data.leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="py-2 pr-4 text-xs truncate max-w-[120px]">
                          {lead.name ?? <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 pr-4 text-xs truncate max-w-[100px]">
                          {lead.propertyId ? (
                            <span className="font-mono">{lead.propertyId.slice(0, 10)}…</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-xs max-w-[200px]">
                          {lead.conversationSummary ? (
                            <button
                              type="button"
                              onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                              className="inline-flex items-center gap-1 text-primary hover:underline text-left"
                              aria-expanded={expandedLeadId === lead.id}
                            >
                              {expandedLeadId === lead.id ? (
                                <>
                                  <ChevronUp size={12} aria-hidden="true" />
                                  Elrejtés
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} aria-hidden="true" />
                                  {lead.conversationSummary.slice(0, 40)}…
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${LEAD_STATUS_COLORS[lead.status] ?? ""}`}>
                            {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                          </span>
                        </td>
                        <td className="py-2 text-right whitespace-nowrap">
                          {lead.status === "uj" && (
                            <>
                              <button
                                onClick={() => updateLeadStatus.mutate({ id: lead.id, status: "felhivva" })}
                                disabled={updateLeadStatus.isPending}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded transition-colors mr-1"
                                aria-label="Felhívva jelölés"
                              >
                                Felhívva
                              </button>
                              <button
                                onClick={() => updateLeadStatus.mutate({ id: lead.id, status: "lezart" })}
                                disabled={updateLeadStatus.isPending}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Lezárt jelölés"
                              >
                                Lezárt
                              </button>
                            </>
                          )}
                          {lead.status === "felhivva" && (
                            <>
                              <button
                                onClick={() => updateLeadStatus.mutate({ id: lead.id, status: "nem_elerheto" })}
                                disabled={updateLeadStatus.isPending}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 rounded transition-colors mr-1"
                                aria-label="Nem elérhető jelölés"
                              >
                                Nem elérhető
                              </button>
                              <button
                                onClick={() => updateLeadStatus.mutate({ id: lead.id, status: "lezart" })}
                                disabled={updateLeadStatus.isPending}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Lezárt jelölés"
                              >
                                Lezárt
                              </button>
                            </>
                          )}
                          {lead.status === "nem_elerheto" && (
                            <button
                              onClick={() => updateLeadStatus.mutate({ id: lead.id, status: "felhivva" })}
                              disabled={updateLeadStatus.isPending}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded transition-colors"
                              aria-label="Felhívva jelölés"
                            >
                              Újrapróbálás
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Expanded summary rows */}
                {leads.data.leads.map((lead) =>
                  expandedLeadId === lead.id && lead.conversationSummary ? (
                    <div
                      key={`summary-${lead.id}`}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-muted-foreground mt-1 mb-2"
                    >
                      {lead.conversationSummary}
                    </div>
                  ) : null
                )}
              </div>

              {leads.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Összesen {leads.data.pagination.total} érdeklődő
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
                      disabled={leadsPage <= 1}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Előző oldal"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {leadsPage} / {leads.data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setLeadsPage((p) => Math.min(leads.data!.pagination.totalPages, p + 1))}
                      disabled={leadsPage >= leads.data.pagination.totalPages}
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Következő oldal"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
            <Settings size={18} className="text-[#1B3A5C]" aria-hidden="true" />
            Beállítások
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Gemini modell
              </label>
              <input
                type="text"
                value="gemini-2.0-flash"
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-gray-50 text-sm text-muted-foreground cursor-not-allowed"
                aria-label="Gemini modell (csak olvasható)"
              />
            </div>
            <div>
              <label htmlFor="settings-budget" className="block text-sm font-medium text-foreground mb-1">
                Havi keret (EUR)
              </label>
              <input
                id="settings-budget"
                type="number"
                defaultValue={stats.data?.budgetEur ?? 50}
                min={1}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="settings-huf-rate" className="block text-sm font-medium text-foreground mb-1">
                EUR→HUF árfolyam
              </label>
              <input
                id="settings-huf-rate"
                type="number"
                value={eurToHuf}
                onChange={(e) => setEurToHuf(Number(e.target.value) || DEFAULT_EUR_TO_HUF)}
                min={1}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="settings-rate-limit" className="block text-sm font-medium text-foreground mb-1">
                Kérés limit/óra
              </label>
              <input
                id="settings-rate-limit"
                type="number"
                defaultValue={60}
                min={1}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            A Gemini modell és a kérés limit szerver konfigurációból származik. A HUF árfolyam helyi beállítás, csak a megjelenítést befolyásolja.
          </p>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Munkamenet törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretné ezt a munkamenetet és az összes hozzá tartozó üzenetet? Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
