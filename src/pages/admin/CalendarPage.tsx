import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import huLocale from "@fullcalendar/core/locales/hu";
import {
  Plus,
  X,
  Loader2,
  Calendar as CalendarIcon,
  Filter,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDatetime: string;
  endDatetime: string;
  staffId: string | null;
  staffName: string | null;
  createdBy: string;
  eventType: string;
  location: string | null;
  propertyId: string | null;
  color: string | null;
}

interface StaffMember {
  id: string;
  name: string;
  active: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  staffId: string;
  eventType: string;
  location: string;
  color: string;
}

const EVENT_TYPE_OPTIONS = [
  { value: "ingatlan_megtekintes", label: "Ingatlan megtekintés", color: "#3B82F6" },
  { value: "ugyfel_talalkozo", label: "Ügyfél találkozó", color: "#10B981" },
  { value: "belso_megbeszeles", label: "Belső megbeszélés", color: "#8B5CF6" },
  { value: "szabadsag", label: "Szabadság", color: "#F59E0B" },
  { value: "egyeb", label: "Egyéb", color: "#6B7280" },
];

const STAFF_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

const EMPTY_FORM: EventFormData = {
  title: "",
  description: "",
  startDatetime: "",
  endDatetime: "",
  staffId: "",
  eventType: "egyeb",
  location: "",
  color: "",
};

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetimeValue(local: string): string {
  return new Date(local).toISOString();
}

export default function CalendarPage() {
  const { csrfToken } = useAuth();

  useEffect(() => {
    document.title = "Naptár | Gerecse Ingatlan Admin";
  }, []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleStaff, setVisibleStaff] = useState<Set<string>>(new Set());
  const [showNoStaff, setShowNoStaff] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);
  const currentRangeRef = useRef<{ start: string; end: string }>({ start: "", end: "" });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff?active=true", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setStaffList(data.staff);
      setVisibleStaff(new Set(data.staff.map((s: StaffMember) => s.id)));
    } catch {
      /* staff list fetch is non-critical */
    }
  }, []);

  const fetchEvents = useCallback(
    async (start?: string, end?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (start) params.set("start", start);
        if (end) params.set("end", end);

        const res = await fetch(`/api/admin/calendar?${params}`, { credentials: "include" });
        if (!res.ok) throw new Error("Hiba történt az események betöltésekor.");
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hiba történt az események betöltésekor.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStaff();
    fetchEvents();
  }, [fetchStaff, fetchEvents]);

  const getStaffColor = (staffId: string | null): string => {
    if (!staffId) return "#6B7280";
    const idx = staffList.findIndex((s) => s.id === staffId);
    return idx >= 0 ? STAFF_COLORS[idx % STAFF_COLORS.length] : "#6B7280";
  };

  const filteredEvents = events.filter((e) => {
    if (e.staffId && !visibleStaff.has(e.staffId)) return false;
    if (!e.staffId && !showNoStaff) return false;
    return true;
  });

  const calendarEvents = filteredEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDatetime,
    end: e.endDatetime,
    backgroundColor: e.color ?? getStaffColor(e.staffId),
    borderColor: e.color ?? getStaffColor(e.staffId),
    extendedProps: e,
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setEditingEvent(null);
    setForm({
      ...EMPTY_FORM,
      startDatetime: toLocalDatetimeValue(selectInfo.startStr),
      endDatetime: toLocalDatetimeValue(selectInfo.endStr),
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.extendedProps as CalendarEvent;
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      startDatetime: toLocalDatetimeValue(event.startDatetime),
      endDatetime: toLocalDatetimeValue(event.endDatetime),
      staffId: event.staffId ?? "",
      eventType: event.eventType,
      location: event.location ?? "",
      color: event.color ?? "",
    });
    setModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.startStr;
    const newEnd = dropInfo.event.endStr;

    try {
      const res = await fetch(`/api/admin/calendar/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          startDatetime: newStart,
          endDatetime: newEnd,
        }),
      });

      if (!res.ok) {
        dropInfo.revert();
        setError("Hiba történt az esemény áthelyezésekor.");
      } else {
        const { start, end } = currentRangeRef.current;
        fetchEvents(start, end);
      }
    } catch {
      dropInfo.revert();
      setError("Hiba történt az esemény áthelyezésekor.");
    }
  };

  const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
    currentRangeRef.current = { start: dateInfo.startStr, end: dateInfo.endStr };
    fetchEvents(dateInfo.startStr, dateInfo.endStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: any = {
        title: form.title,
        description: form.description || null,
        startDatetime: fromLocalDatetimeValue(form.startDatetime),
        endDatetime: fromLocalDatetimeValue(form.endDatetime),
        staffId: form.staffId || null,
        eventType: form.eventType,
        location: form.location || null,
        color: form.color || null,
      };

      const url = editingEvent
        ? `/api/admin/calendar/${editingEvent.id}`
        : "/api/admin/calendar";
      const method = editingEvent ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Hiba történt a mentés során.");
      }

      setModalOpen(false);
      const { start, end } = currentRangeRef.current;
      fetchEvents(start, end);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    if (!confirm("Biztosan törölni szeretné ezt az eseményt?")) return;

    setDeletingEvent(true);
    try {
      const res = await fetch(`/api/admin/calendar/${editingEvent.id}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Hiba történt a törlés során.");

      setModalOpen(false);
      const { start, end } = currentRangeRef.current;
      fetchEvents(start, end);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a törlés során.");
    } finally {
      setDeletingEvent(false);
    }
  };

  const toggleStaffFilter = (staffId: string) => {
    setVisibleStaff((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Naptár
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            aria-label="Szűrők megjelenítése/elrejtése"
          >
            <Filter size={16} aria-hidden="true" />
            Szűrők
          </button>
        </div>
      </div>

      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          role="alert"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Bezárás
          </button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Sidebar with staff filters */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 space-y-4">
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Munkatársak
              </h3>
              <div className="space-y-2">
                {staffList.map((s, i) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleStaff.has(s.id)}
                      onChange={() => toggleStaffFilter(s.id)}
                      className="rounded border-border"
                    />
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          STAFF_COLORS[i % STAFF_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{s.name}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNoStaff}
                    onChange={(e) => setShowNoStaff(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-400"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">Nincs hozzárendelve</span>
                </label>
              </div>
            </div>

            {/* ICS subscription links */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Naptár feliratkozás
              </h3>
              <div className="space-y-2">
                {staffList.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <LinkIcon size={12} className="text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/api/calendar/ics/${s.id}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="text-primary hover:underline truncate"
                      title="ICS link másolása"
                    >
                      {s.name} - ICS
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Calendar */}
        <div className="flex-1 bg-card rounded-xl p-4 shadow-sm border border-border min-h-[600px]">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={huLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Ma",
              month: "Hónap",
              week: "Hét",
              day: "Nap",
            }}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            editable={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            datesSet={handleDatesSet}
            height="auto"
            nowIndicator={true}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
          />
        </div>
      </div>

      {/* Event Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-card w-full max-w-lg mx-4 rounded-xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2
                id="event-modal-title"
                className="text-lg font-heading font-semibold text-foreground"
              >
                {editingEvent ? "Esemény szerkesztése" : "Új esemény"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="Bezárás"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="event-title"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Cím *
                </label>
                <input
                  id="event-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Esemény címe"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="event-start"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Kezdés *
                  </label>
                  <input
                    id="event-start"
                    type="datetime-local"
                    required
                    value={form.startDatetime}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        startDatetime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="event-end"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Befejezés *
                  </label>
                  <input
                    id="event-end"
                    type="datetime-local"
                    required
                    value={form.endDatetime}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        endDatetime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="event-type"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Típus
                  </label>
                  <select
                    id="event-type"
                    value={form.eventType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, eventType: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {EVENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="event-staff"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Munkatárs
                  </label>
                  <select
                    id="event-staff"
                    value={form.staffId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, staffId: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Nincs hozzárendelve</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-location"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Helyszín
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Helyszín megadása"
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Leírás
                </label>
                <textarea
                  id="event-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  placeholder="Esemény leírása..."
                />
              </div>

              <div>
                <label
                  htmlFor="event-color"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Szín (opcionális)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="event-color"
                    type="color"
                    value={form.color || "#3B82F6"}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  {form.color && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: "" }))}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Alapértelmezett
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      disabled={deletingEvent}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingEvent ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Törlés"
                      )}
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {saving && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {editingEvent ? "Mentés" : "Létrehozás"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
