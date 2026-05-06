"use client";

import { useState, useEffect, useTransition } from "react";
import { User, Mail, Hash, GraduationCap, Phone, KeyRound, CheckCircle2, XCircle, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CARRERAS = [
  "Ing. en Sistemas Computacionales",
  "Ing. Industrial",
  "Ing. en Gestión Empresarial",
  "Ing. en Administración",
  "Lic. en Administración",
  "Ing. Mecatrónica",
  "Ing. en Tecnologías de la Información",
  "Otra carrera",
];

type StatusMsg = { ok: boolean; msg: string } | null;

export default function DashboardPerfilPage() {
  const supabase = createClient();

  const [info, setInfo] = useState({
    nombre_completo: "", numero_control: "", email: "",
    carrera: "", semestre: "", telefono: "",
  });
  const [loading,        setLoading]        = useState(true);
  const [isPendingInfo,  startInfoT]        = useTransition();
  const [isPendingPass,  startPassT]        = useTransition();
  const [statusInfo,     setStatusInfo]     = useState<StatusMsg>(null);
  const [statusPass,     setStatusPass]     = useState<StatusMsg>(null);
  const [pass,           setPass]           = useState({ nueva: "", confirmar: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const m = user.user_metadata;
      setInfo({
        nombre_completo: m?.nombre_completo ?? "",
        numero_control:  m?.numero_control  ?? "",
        email:           user.email         ?? "",
        carrera:         m?.carrera         ?? "",
        semestre:        m?.semestre        ? String(m.semestre) : "",
        telefono:        m?.telefono        ?? "",
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusInfo(null);
    startInfoT(async () => {
      const { error } = await supabase.auth.updateUser({
        data: {
          nombre_completo: info.nombre_completo.trim(),
          numero_control:  info.numero_control.trim().toUpperCase(),
          carrera:         info.carrera,
          semestre:        info.semestre ? parseInt(info.semestre) : null,
          telefono:        info.telefono.trim(),
        },
      });
      if (error) setStatusInfo({ ok: false, msg: error.message });
      else setStatusInfo({ ok: true, msg: "Perfil actualizado correctamente." });
    });
  };

  const handleSavePass = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusPass(null);
    if (pass.nueva.length < 8) {
      setStatusPass({ ok: false, msg: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (pass.nueva !== pass.confirmar) {
      setStatusPass({ ok: false, msg: "Las contraseñas no coinciden." });
      return;
    }
    startPassT(async () => {
      const { error } = await supabase.auth.updateUser({ password: pass.nueva });
      if (error) setStatusPass({ ok: false, msg: error.message });
      else {
        setStatusPass({ ok: true, msg: "Contraseña actualizada correctamente." });
        setPass({ nueva: "", confirmar: "" });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Actualiza tu información personal y datos académicos.</p>
      </div>

      {/* Datos personales */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" /> Datos Personales
        </h3>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Nombre Completo
              </label>
              <input type="text" value={info.nombre_completo}
                onChange={(e) => setInfo((p) => ({ ...p, nombre_completo: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="Nombre completo como aparece en tu credencial" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> No. de Control
              </label>
              <input type="text" value={info.numero_control}
                onChange={(e) => setInfo((p) => ({ ...p, numero_control: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm font-mono"
                placeholder="Ej: 23660151" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Correo Institucional
              </label>
              <input type="email" value={info.email} disabled
                className="glass-input w-full px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" /> Carrera
              </label>
              <select value={info.carrera}
                onChange={(e) => setInfo((p) => ({ ...p, carrera: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                <option value="">Selecciona tu carrera</option>
                {CARRERAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">Semestre</label>
              <select value={info.semestre}
                onChange={(e) => setInfo((p) => ({ ...p, semestre: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                <option value="">Selecciona semestre</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>{s}° Semestre</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Teléfono <span className="text-muted-foreground">(opcional)</span>
              </label>
              <input type="tel" value={info.telefono}
                onChange={(e) => setInfo((p) => ({ ...p, telefono: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="Ej: 4881234567" />
            </div>
          </div>

          {statusInfo && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${statusInfo.ok ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {statusInfo.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              {statusInfo.msg}
            </div>
          )}

          <button type="submit" disabled={isPendingInfo}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 shadow-lg shadow-primary/20">
            {isPendingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPendingInfo ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
          <KeyRound className="w-5 h-5 text-accent" /> Cambiar Contraseña
        </h3>
        <form onSubmit={handleSavePass} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Nueva Contraseña</label>
            <input type="password" value={pass.nueva}
              onChange={(e) => setPass((p) => ({ ...p, nueva: e.target.value }))}
              minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Confirmar Contraseña</label>
            <input type="password" value={pass.confirmar}
              onChange={(e) => setPass((p) => ({ ...p, confirmar: e.target.value }))}
              minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder="Repite la contraseña" />
          </div>

          {statusPass && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${statusPass.ok ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {statusPass.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              {statusPass.msg}
            </div>
          )}

          <button type="submit" disabled={isPendingPass}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors disabled:opacity-70">
            {isPendingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {isPendingPass ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
