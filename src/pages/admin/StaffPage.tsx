import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  User,
  Phone,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { safeJson } from "@/lib/utils";
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

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  roleTitle: string;
  photoUrl: string | null;
  bio: string | null;
  active: boolean;
  showEmail: boolean;
  showPhone: boolean;
  sortOrder: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  bio: string;
  active: boolean;
  showEmail: boolean;
  showPhone: boolean;
  dashboardAccess: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  roleTitle?: string;
}

interface ConfirmAction {
  type: "delete" | "deactivate" | "activate";
  member: StaffMember;
}

const EMPTY_FORM: StaffFormData = {
  name: "",
  email: "",
  phone: "",
  roleTitle: "Ingatlanközvetítő",
  bio: "",
  active: true,
  showEmail: true,
  showPhone: true,
  dashboardAccess: false,
};

const PHONE_PATTERN = /^[+]?[\d\s\-()]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffPage() {
  const { csrfToken } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (!showInactive) params.set("active", "true");

      const res = await fetch(`/api/admin/staff?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Hiba történt a munkatársak betöltésekor.");
      const data = await res.json();
      setStaffList(data.staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a munkatársak betöltésekor.");
    } finally {
      setLoading(false);
    }
  }, [search, showInactive]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    document.title = "Munkatársak | Gerecse Ingatlan Admin";
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!form.name.trim()) {
      errors.name = "A név megadása kötelező.";
    }

    if (form.email && !EMAIL_PATTERN.test(form.email)) {
      errors.email = "Érvénytelen e-mail cím formátum.";
    }

    if (form.phone && !PHONE_PATTERN.test(form.phone)) {
      errors.phone = "Érvénytelen telefonszám formátum. Példa: +36 30 123 4567";
    }

    if (form.dashboardAccess && !form.email) {
      errors.email = "Dashboard hozzáféréshez e-mail cím megadása kötelező.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email ?? "",
      phone: member.phone ?? "",
      roleTitle: member.roleTitle,
      bio: member.bio ?? "",
      active: member.active,
      showEmail: member.showEmail,
      showPhone: member.showPhone,
      dashboardAccess: false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/admin/staff/${editingId}`
        : "/api/admin/staff";
      const method = editingId ? "PATCH" : "POST";

      const body: Record<string, unknown> = { ...form };
      if (!body.email) body.email = null;
      if (!body.phone) body.phone = null;
      if (!body.bio) body.bio = null;

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
        const data = await safeJson<{ error?: string }>(res);
        throw new Error(data.error ?? "Hiba történt a mentés során.");
      }

      setModalOpen(false);
      showSuccess(editingId ? "Munkatárs sikeresen módosítva." : "Munkatárs sikeresen létrehozva.");
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: StaffMember) => {
    setDeleting(member.id);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Hiba történt a törlés során.");
      showSuccess(`${member.name} sikeresen törölve.`);
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a törlés során.");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ active: !member.active }),
      });
      if (!res.ok) throw new Error("Hiba történt a státusz módosításakor.");
      showSuccess(
        member.active
          ? `${member.name} deaktiválva.`
          : `${member.name} újra aktiválva.`
      );
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a státusz módosításakor.");
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, member } = confirmAction;
    setConfirmAction(null);

    if (type === "delete") {
      handleDelete(member);
    } else {
      handleToggleActive(member);
    }
  };

  const handlePhotoUpload = async (memberId: string, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Nem támogatott képformátum. Használjon JPEG, PNG vagy WebP formátumot.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A fájl mérete nem haladhatja meg az 5 MB-ot.");
      return;
    }

    setUploadingPhoto(memberId);
    try {
      const res = await fetch(`/api/admin/staff/${memberId}/photo`, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: file,
      });
      if (!res.ok) throw new Error("Hiba történt a kép feltöltésekor.");
      showSuccess("Profilkép sikeresen feltöltve.");
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a kép feltöltésekor.");
    } finally {
      setUploadingPhoto(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
      hasError ? "border-destructive" : "border-border"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Munkatársak
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Összesen {staffList.length} munkatárs
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Új munkatárs hozzáadása"
        >
          <Plus size={18} aria-hidden="true" />
          Új munkatárs
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Keresés név vagy e-mail alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Keresés"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-border"
          />
          Inaktívak mutatása
        </label>
      </div>

      {success && (
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          {success}
        </div>
      )}

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

      {loading ? (
        <div className="flex justify-center py-12" role="status" aria-label="Betöltés...">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User size={48} className="mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p className="text-lg font-medium">Nincs megjeleníthető munkatárs</p>
          <p className="text-sm mt-1">
            Kattintson az &quot;Új munkatárs&quot; gombra egy új hozzáadásához.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => (
            <article
              key={member.id}
              className={`bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow ${
                !member.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={`${member.name} profilképe`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-lg font-heading font-bold text-primary">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )}
                  <label
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
                    aria-label="Profilkép feltöltése"
                  >
                    {uploadingPhoto === member.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(member.id, file);
                        e.target.value = "";
                      }}
                      disabled={uploadingPhoto === member.id}
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-heading font-semibold text-foreground truncate">
                      {member.name}
                    </h3>
                    {!member.active && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                        Inaktív
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gold font-medium mt-0.5">
                    {member.roleTitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={14} aria-hidden="true" />
                    <a
                      href={`tel:${member.phone.replace(/\s/g, "")}`}
                      className="hover:text-primary transition-colors"
                    >
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} aria-hidden="true" />
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-primary transition-colors truncate"
                    >
                      {member.email}
                    </a>
                  </div>
                )}
              </div>

              {member.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {member.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <button
                  onClick={() => openEditModal(member)}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 active:bg-secondary/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${member.name} szerkesztése`}
                >
                  <Pencil size={14} aria-hidden="true" />
                  Szerkesztés
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({
                      type: member.active ? "deactivate" : "activate",
                      member,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 active:bg-secondary/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={
                    member.active
                      ? `${member.name} deaktiválása`
                      : `${member.name} aktiválása`
                  }
                >
                  {member.active ? (
                    <>
                      <EyeOff size={14} aria-hidden="true" />
                      Deaktiválás
                    </>
                  ) : (
                    <>
                      <Eye size={14} aria-hidden="true" />
                      Aktiválás
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    setConfirmAction({ type: "delete", member })
                  }
                  disabled={deleting === member.id}
                  className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto"
                  aria-label={`${member.name} törlése`}
                >
                  {deleting === member.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete"
                ? "Munkatárs törlése"
                : confirmAction?.type === "deactivate"
                  ? "Munkatárs deaktiválása"
                  : "Munkatárs aktiválása"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? `Biztosan törölni szeretné "${confirmAction.member.name}" munkatársat? Ez a művelet nem vonható vissza.`
                : confirmAction?.type === "deactivate"
                  ? `Biztosan deaktiválni szeretné "${confirmAction?.member.name}" munkatársat? A deaktivált munkatárs nem jelenik meg a nyilvános oldalon.`
                  : `Biztosan aktiválni szeretné "${confirmAction?.member.name}" munkatársat?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmAction?.type === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }
            >
              {confirmAction?.type === "delete"
                ? "Törlés"
                : confirmAction?.type === "deactivate"
                  ? "Deaktiválás"
                  : "Aktiválás"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-card w-full max-w-lg mx-4 rounded-xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2
                id="staff-modal-title"
                className="text-lg font-heading font-semibold text-foreground"
              >
                {editingId ? "Munkatárs szerkesztése" : "Új munkatárs"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="Bezárás"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="staff-name"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Név <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <input
                  id="staff-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (formErrors.name) setFormErrors((fe) => ({ ...fe, name: undefined }));
                  }}
                  className={inputClass(!!formErrors.name)}
                  placeholder="Teljes név"
                  aria-required="true"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? "staff-name-error" : undefined}
                />
                {formErrors.name && (
                  <p id="staff-name-error" role="alert" className="mt-1 text-xs text-destructive">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    E-mail
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, email: e.target.value }));
                      if (formErrors.email) setFormErrors((fe) => ({ ...fe, email: undefined }));
                    }}
                    className={inputClass(!!formErrors.email)}
                    placeholder="pelda@email.hu"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "staff-email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="staff-email-error" role="alert" className="mt-1 text-xs text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="staff-phone"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Telefon
                  </label>
                  <input
                    id="staff-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, phone: e.target.value }));
                      if (formErrors.phone) setFormErrors((fe) => ({ ...fe, phone: undefined }));
                    }}
                    className={inputClass(!!formErrors.phone)}
                    placeholder="+36 30 123 4567"
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? "staff-phone-error" : undefined}
                  />
                  {formErrors.phone && (
                    <p id="staff-phone-error" role="alert" className="mt-1 text-xs text-destructive">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="staff-role"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Beosztás
                </label>
                <select
                  id="staff-role"
                  value={form.roleTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roleTitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Ingatlanközvetítő">Ingatlanközvetítő</option>
                  <option value="Ügyvezető">Ügyvezető</option>
                  <option value="Iroda vezető">Iroda vezető</option>
                  <option value="Asszisztens">Asszisztens</option>
                  <option value="Értékbecslő">Értékbecslő</option>
                  <option value="Jogi tanácsadó">Jogi tanácsadó</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="staff-bio"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Bemutatkozás
                </label>
                <textarea
                  id="staff-bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  placeholder="Rövid bemutatkozó szöveg..."
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Nyilvános megjelenítés
                </p>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, showEmail: e.target.checked }))
                    }
                    className="rounded border-border"
                  />
                  <Mail size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span>E-mail cím megjelenítése a nyilvános oldalon</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showPhone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, showPhone: e.target.checked }))
                    }
                    className="rounded border-border"
                  />
                  <Phone size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span>Telefonszám megjelenítése a nyilvános oldalon</span>
                </label>
              </div>

              {!editingId && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.dashboardAccess}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        dashboardAccess: e.target.checked,
                      }))
                    }
                    className="rounded border-border"
                  />
                  <span>Dashboard hozzáférés</span>
                  <span className="text-muted-foreground">
                    (felhasználói fiók létrehozása)
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
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
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  )}
                  {editingId ? "Mentés" : "Létrehozás"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
