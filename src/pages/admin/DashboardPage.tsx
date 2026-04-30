import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Mail,
  CalendarDays,
  Users,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
} from "lucide-react";

interface DashboardStats {
  activeProperties: number;
  subscriberCount: number;
  todayEventsCount: number;
  activeStaffCount: number;
}

interface RecentSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: "pending" | "confirmed" | "unsubscribed";
  subscribedAt: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  startDatetime: string;
  endDatetime: string;
  eventType: string;
  location: string | null;
  color: string | null;
}

interface RecentEdit {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface ActivityData {
  recentSubscribers: RecentSubscriber[];
  upcomingEvents: UpcomingEvent[];
  recentEdits: RecentEdit[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Függőben",
  confirmed: "Megerősített",
  unsubscribed: "Leiratkozott",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  ingatlan_megtekintes: "Ingatlan megtekintés",
  ugyfel_talalkozo: "Ügyfél találkozó",
  belso_megbeszeles: "Belső megbeszélés",
  szabadsag: "Szabadság",
  egyeb: "Egyéb",
};

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch("/api/admin/dashboard/stats", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Hiba a statisztikák lekérdezésekor.");
  return res.json();
}

async function fetchActivity(): Promise<ActivityData> {
  const res = await fetch("/api/admin/dashboard/activity", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Hiba az aktivitás lekérdezésekor.");
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

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STAT_CARDS = [
  {
    key: "activeProperties" as const,
    label: "Aktív ingatlanok",
    icon: Home,
    bgColor: "bg-blue-50",
    iconColor: "text-[#1B3A5C]",
    valueColor: "text-[#1B3A5C]",
  },
  {
    key: "subscriberCount" as const,
    label: "Feliratkozók",
    icon: Mail,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
  {
    key: "todayEventsCount" as const,
    label: "Mai események",
    icon: CalendarDays,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-600",
  },
  {
    key: "activeStaffCount" as const,
    label: "Munkatársak",
    icon: Users,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    valueColor: "text-purple-600",
  },
];

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Vezérlőpult | Gerecse Ingatlan Admin";
  }, []);

  const stats = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });

  const activity = useQuery({
    queryKey: ["admin", "dashboard", "activity"],
    queryFn: fetchActivity,
    refetchInterval: 60_000,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B3A5C] font-heading">
          Vezérlőpult
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Áttekintés és legutóbbi tevékenységek
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, bgColor, iconColor, valueColor }) => (
          <Card key={key}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                  <Icon size={24} className={iconColor} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {stats.isLoading ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-gray-400 mt-1"
                      aria-hidden="true"
                    />
                  ) : stats.isError ? (
                    <AlertCircle
                      size={20}
                      className="text-red-400 mt-1"
                      aria-hidden="true"
                    />
                  ) : (
                    <p className={`text-2xl font-bold ${valueColor}`}>
                      {stats.data?.[key] ?? 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent subscribers */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
              <Mail size={18} className="text-[#1B3A5C]" aria-hidden="true" />
              Legutóbbi feliratkozók
            </h2>
            {activity.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={20}
                  className="animate-spin text-gray-400"
                  aria-hidden="true"
                />
              </div>
            ) : activity.data?.recentSubscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Még nincsenek feliratkozók.
              </p>
            ) : (
              <ul className="space-y-3">
                {activity.data?.recentSubscribers.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {sub.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sub.subscribedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={sub.status === "confirmed" ? "default" : "secondary"}
                      className="ml-2 shrink-0"
                    >
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
              <CalendarDays
                size={18}
                className="text-[#1B3A5C]"
                aria-hidden="true"
              />
              Mai és holnapi események
            </h2>
            {activity.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={20}
                  className="animate-spin text-gray-400"
                  aria-hidden="true"
                />
              </div>
            ) : activity.data?.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nincsenek közelgő események.
              </p>
            ) : (
              <ul className="space-y-3">
                {activity.data?.upcomingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{
                          backgroundColor: event.color ?? "#1B3A5C",
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} aria-hidden="true" />
                            {formatTime(event.startDatetime)}–
                            {formatTime(event.endDatetime)}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin size={12} aria-hidden="true" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent content edits */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-[#1B3A5C] mb-4 flex items-center gap-2">
              <AlertCircle
                size={18}
                className="text-[#1B3A5C]"
                aria-hidden="true"
              />
              Legutóbbi szerkesztések
            </h2>
            {activity.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={20}
                  className="animate-spin text-gray-400"
                  aria-hidden="true"
                />
              </div>
            ) : activity.data?.recentEdits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Még nincsenek szerkesztések.
              </p>
            ) : (
              <ul className="space-y-3">
                {activity.data?.recentEdits.map((edit) => (
                  <li
                    key={edit.id}
                    className="text-sm border-b border-gray-100 pb-2 last:border-0"
                  >
                    <p className="font-medium text-gray-900">
                      {edit.action}
                    </p>
                    {edit.entityType && (
                      <p className="text-xs text-muted-foreground">
                        {edit.entityType}
                        {edit.entityId ? ` — ${edit.entityId}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(edit.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
