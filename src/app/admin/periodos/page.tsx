"use client";

import { useState, useEffect, useTransition } from "react";
import { Calendar, Plus, ToggleLeft, ToggleRight, Loader2, CheckCircle2, Clock } from "lucide-react";
import { crearPeriodo, toggleInscripciones } from "@/app/actions/usuarios";

type Periodo = {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  inscripciones_abiertas: boolean;
  activo: boolean;
  created_at: string;
};

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/periodos").then((r) => r.json()).then(setPeriodos).catch(() => {});
  }, []);

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await crearPeriodo(fd);
      if (result.error) {
        setMensaje(result.error);
      } else {
        setMensaje("Período creado exitosamente.");
        setShowForm(false);
        window.location.reload();
      }
    });
  };

  const handleToggle = async (periodoId: string, abiertas: boolean) => {
    startTransition(async () => {
      await toggleInscripciones(periodoId, abiertas);
      window.location.reload();
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Períodos Académicos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los períodos y controla cuándo están abiertas las inscripciones.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Nuevo Período
        </button>
      </div>

      {mensaje && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
          {mensaje}
        </div>
      )}

      {/* Formulario nuevo período */}
      {showForm && (
        <div className="glass-card p-6 rounded-3xl animate-slide-up">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Crear Nuevo Período
          </h3>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-foreground/80">Nombre del Período</label>
                <input name="nombre" required className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Ej: Enero–Junio 2026" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Fecha de Inicio</label>
                <input name="fecha_inicio" type="date" required className="glass-input w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Fecha de Fin</label>
                <input name="fecha_fin" type="date" required className="glass-input w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Inscripciones Abiertas</label>
                <select name="inscripciones_abiertas" className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                  <option value="false">Cerradas</option>
                  <option value="true">Abiertas</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Crear Período
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-semibold text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de períodos */}
      <div className="space-y-4">
        {periodos.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay períodos registrados.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Crea el primer período para empezar a inscribir alumnos.</p>
          </div>
        ) : (
          periodos.map((p) => (
            <div key={p.id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.activo ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{p.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(p.fecha_inicio).toLocaleDateString("es-MX")} — {new Date(p.fecha_fin).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.inscripciones_abiertas ? "bg-green-500/20 text-green-500" : "bg-white/10 text-muted-foreground"}`}>
                  {p.inscripciones_abiertas ? "Inscripciones Abiertas" : "Cerradas"}
                </span>
                <button onClick={() => handleToggle(p.id, !p.inscripciones_abiertas)}
                  className={`p-2 rounded-lg transition-colors ${p.inscripciones_abiertas ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}>
                  {p.inscripciones_abiertas ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
