"use client";

import { useState, useTransition } from "react";
import { KeyRound, User, Mail, Shield, CheckCircle2, Loader2, XCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import Link from "next/link";

type UserInfo = { nombre: string; email: string };

export default function PerfilEncargadoPage() {
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setInfo({
        nombre: user.user_metadata?.nombre_completo ?? "Encargado",
        email:  user.email ?? "",
      });
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (form.password.length < 8) {
      setStatus({ ok: false, msg: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (form.password !== form.confirm) {
      setStatus({ ok: false, msg: "Las contraseñas no coinciden." });
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) {
        setStatus({ ok: false, msg: error.message });
      } else {
        setStatus({ ok: true, msg: "Contraseña actualizada correctamente." });
        setForm({ password: "", confirm: "" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-xl">
      <div>
        <Link href="/encargado" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Seguridad</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu acceso al sistema.</p>
      </div>

      {/* Info de cuenta */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-accent" /> Información de Cuenta
        </h3>
        <div className="space-y-3">
          {[
            { icon: User,   label: "Nombre",               value: info?.nombre ?? "—" },
            { icon: Mail,   label: "Correo institucional",  value: info?.email  ?? "—" },
            { icon: Shield, label: "Rol",                   value: "Responsable de Taller" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
          <KeyRound className="w-5 h-5 text-accent" /> Cambiar Contraseña
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Nueva Contraseña</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Confirmar Contraseña</label>
            <input type="password" value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Repite la contraseña" />
          </div>

          {status && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${status.ok ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {status.ok
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <XCircle className="w-4 h-4 shrink-0" />}
              {status.msg}
            </div>
          )}

          <button type="submit" disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors disabled:opacity-70">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {isPending ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
