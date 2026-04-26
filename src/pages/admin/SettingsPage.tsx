import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Beállítások | Gerecse Ingatlan Admin";
  }, []);

  const { user, csrfToken } = useAuth();

  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== emailConfirm) {
      toast.error("Az email címek nem egyeznek.");
      return;
    }
    if (!email) {
      toast.error("Az email cím megadása kötelező.");
      return;
    }
    setEmailSaving(true);
    try {
      const res = await fetch("/api/admin/users/me/email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email, emailConfirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      toast.success(data.message || "Email cím sikeresen módosítva.");
      setEmail("");
      setEmailConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hiba történt az email módosítás során.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      toast.error("Az új jelszavak nem egyeznek.");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("Minden jelszómező kitöltése kötelező.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Az új jelszónak legalább 8 karakter hosszúnak kell lennie.");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/admin/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Hiba (${res.status})`);
      }
      toast.success(data.message || "Jelszó sikeresen módosítva.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hiba történt a jelszó módosítás során.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";

  return (
    <div className="p-2 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Beállítások</h1>

      {/* Email change */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Profil</h2>
        <p className="text-sm text-gray-500 mb-4">
          Jelenlegi email: <span className="font-medium text-gray-700">{user?.email}</span>
        </p>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-1">
              Új email cím
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={320}
              autoComplete="email"
              className={inputClass}
              placeholder="uj@email.hu"
            />
          </div>
          <div>
            <label htmlFor="settings-email-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Új email cím megerősítése
            </label>
            <input
              id="settings-email-confirm"
              type="email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              required
              maxLength={320}
              autoComplete="email"
              className={inputClass}
              placeholder="uj@email.hu"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={emailSaving || !email || !emailConfirm}
              className="px-4 py-2 text-white bg-dark-navy hover:bg-main-navy rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {emailSaving ? "Mentés..." : "Email mentése"}
            </button>
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Jelszó módosítása</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="settings-current-password" className="block text-sm font-medium text-gray-700 mb-1">
              Jelenlegi jelszó
            </label>
            <input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-new-password" className="block text-sm font-medium text-gray-700 mb-1">
              Új jelszó
            </label>
            <input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-new-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Új jelszó megerősítése
            </label>
            <input
              id="settings-new-password-confirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving || !currentPassword || !newPassword || !newPasswordConfirm}
              className="px-4 py-2 text-white bg-dark-navy hover:bg-main-navy rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {passwordSaving ? "Mentés..." : "Jelszó mentése"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
