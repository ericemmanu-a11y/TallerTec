"use client";

import { useState, useEffect, useTransition } from "react";
import { UserPlus, UserCog, Trash2, Edit2, Loader2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { crearEncargado, toggleUsuarioActivo } from "@/app/actions/usuarios";

type Encargado = {
  id: string;
  nombre_completo: string;
  email: string;
  activo: boolean;
  talleres?: { nombre: string }[];
};

export default function EncargadosPage() {
  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ text: string; type: "ok" | "err" } | null>(null);

  const cargar = () => {
    fetch("/api/admin/encargados-full").then((r) => r.json()).then(setEncargados).catch(() => {});
  };

  useEffect(cargar, []);

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await crearEncargado(fd);
      if (result.error) {
        setMensaje({ text: result.error, type: "err" });
      } else {
        setMensaje({ text: "Encargado creado exitosamente.", type: "ok" });
        setShowForm(false);
        cargar();
      }
    });
  };

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleUsuarioActivo(id, activo);
      cargar();
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Responsables de Taller</h1>
          <p className="text-muted-foreground mt-1">Gestiona los encargados y controla su acceso al sistema.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <UserPlus className="w-5 h-5" /> Nuevo Encargado
        </button>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl text-sm flex items-center justify-between ${mensaje.type === "ok" ? "bg-green-500/10 border border-green-500/20 text-green-500" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
          {mensaje.text}
          <button onClick={() => setMensaje(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6 rounded-3xl animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Crear Encargado</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-foreground/80">Nombre Completo</label>
                <input name="nombre_completo" required minLength={3}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Lic. Juan Pérez García" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Correo Institucional</label>
                <input name="email" type="email" required
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="juan.perez@matehuala.tecnm.mx" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Contraseña Inicial</label>
                <input name="password" type="password" required minLength={8}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Mínimo 8 caracteres" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-70 flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Encargado
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="font-bold flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" /> Lista de Responsables
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Taller(es)</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {encargados.map((e) => (
                <tr key={e.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-semibold">{e.nombre_completo}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{e.email}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">
                    {e.talleres?.map((t) => t.nombre).join(", ") || "Sin asignar"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${e.activo ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {e.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleToggle(e.id, !e.activo)}
                      className={`p-2 rounded-lg transition-colors mr-1 ${e.activo ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}>
                      {e.activo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {encargados.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">No hay encargados registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
