import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCsrfToken } from "@/lib/csrf";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Beállítások | Gerecse Ingatlan Admin";
  }, []);

  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Érvénytelen e-mail cím.", variant: "destructive" });
      return;
    }
    if (trimmed !== emailConfirm.trim()) {
      toast({ title: "Az e-mail címek nem egyeznek.", variant: "destructive" });
      return;
    }

    setEmailSaving(true);
    try {
      const csrf = getCsrfToken();
      const res = await fetch("/api/admin/users/me/email", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        body: JSON.stringify({ email: trimmed, emailConfirm: emailConfirm.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Hiba történt az e-mail módosítása során.");
      }

      toast({ title: "Email cím sikeresen módosítva." });
      setEmail("");
      setEmailConfirm("");
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Hiba történt.",
        variant: "destructive",
      });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();

    if (!currentPassword) {
      toast({ title: "Kérjük, adja meg a jelenlegi jelszavát.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Az új jelszónak legalább 8 karakter hosszúnak kell lennie.", variant: "destructive" });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast({ title: "Az új jelszavak nem egyeznek.", variant: "destructive" });
      return;
    }

    setPasswordSaving(true);
    try {
      const csrf = getCsrfToken();
      const res = await fetch("/api/admin/users/me/password", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          res.status === 401
            ? "A jelenlegi jelszó helytelen."
            : (data?.error ?? "Hiba történt a jelszó módosítása során.");
        throw new Error(msg);
      }

      toast({ title: "Jelszó sikeresen módosítva." });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Hiba történt.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-dark-navy">Beállítások</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Profil</CardTitle>
          </div>
          <CardDescription>Az e-mail cím módosítása</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input type="text" name="username" autoComplete="username" className="hidden" value={user?.email ?? ""} readOnly tabIndex={-1} aria-hidden="true" />
            <div>
              <Label className="text-muted-foreground text-xs">Jelenlegi e-mail</Label>
              <p className="mt-1 text-sm font-medium">{user?.email ?? "—"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Új e-mail cím</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                maxLength={320}
                placeholder="uj@email.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-email">Új e-mail cím megerősítése</Label>
              <Input
                id="confirm-email"
                type="email"
                autoComplete="email"
                maxLength={320}
                placeholder="uj@email.hu"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={emailSaving || !email || !emailConfirm}>
              {emailSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Email mentése
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Jelszó módosítása</CardTitle>
          </div>
          <CardDescription>Adjon meg egy új jelszót a fiókjához</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input type="text" name="username" autoComplete="username" className="hidden" value={user?.email ?? ""} readOnly tabIndex={-1} aria-hidden="true" />
            <div className="space-y-2">
              <Label htmlFor="current-password">Jelenlegi jelszó</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Új jelszó</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 8 karakter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Új jelszó megerősítése</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={passwordSaving || !currentPassword || !newPassword || !newPasswordConfirm}>
              {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Jelszó mentése
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
