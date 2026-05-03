"use client";

import { useState, useEffect, useTransition } from "react";
import { CalendarPlus, BookOpen, Trash2, Edit2, Plus, Loader2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { crearTaller, toggleTallerActivo } from "@/app/actions/talleres";

type Taller = {
  id: string;
  nombre: string;
  categoria: string;
  horario_texto: string;
  ubicacion: string;
  cupo_maximo: number;
  cupo_disponible: number;
  activo: boolean;
  usuarios?: { nombre_completo: string } | null;
  periodos?: { nombre: string } | null;
};

type Encargado = { id: string; nombre_completo: string };
type Periodo = { id: string; nombre: string };

export default function TalleresAdminPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ text: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/talleres").then((r) => r.json()),
      fetch("/api/admin/encargados").then((r) => r.json()),
      fetch("/api/periodos").then((r) => r.json()),
    ]).then(([t, e, p]) => {
      setTalleres(t);
      setEncargados(e);
      setPeriodos(p);
    }).catch(() => {});
  }, []);

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await crearTaller(fd);
      if (result.error) {
        setMensaje({ text: result.error, type: "err" });
      } else {
        setMensaje({ text: "Taller creado exitosamente.", type: "ok" });
        setShowForm(false);
        window.location.reload();
      }
    });
  };

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleTallerActivo(id, activo);
      window.location.reload();
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catálogo de Talleres</h1>
          <p className="text-muted-foreground mt-1">Crea y gestiona los talleres deportivos y culturales.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <CalendarPlus className="w-5 h-5" /> Nuevo Taller
        </button>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl text-sm flex items-center justify-between ${mensaje.type === "ok" ? "bg-green-500/10 border border-green-500/20 text-green-500" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
          {mensaje.text}
          <button onClick={() => setMensaje(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="glass-card p-6 rounded-3xl animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Nuevo Taller
            </h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Nombre del Taller</label>
                <input name="nombre" required className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Ej: Fútbol Varonil" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Categoría</label>
                <select name="categoria" className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                  <option value="DEPORTIVO">Deportivo</option>
                  <option value="CULTURAL">Cultural</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-foreground/80">Descripción</label>
                <input name="descripcion" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Breve descripción del taller..." />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Horario</label>
                <input name="horario_texto" required className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Ej: Lunes y Miércoles 16:00–18:00" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Ubicación</label>
                <input name="ubicacion" required className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Ej: Cancha Principal" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Cupo Máximo</label>
                <input name="cupo_maximo" type="number" min={1} max={100} required defaultValue={20}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Responsable</label>
                <select name="responsable_id" required className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                  <option value="">Selecciona encargado</option>
                  {encargados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Período</label>
                <select name="periodo_id" required className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                  <option value="">Selecciona período</option>
                  {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-70 flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Taller
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de talleres */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {talleres.map((t) => (
          <div key={t.id} className={`glass-card p-5 rounded-2xl flex flex-col transition-all ${!t.activo ? "opacity-60" : "hover:border-primary/30"}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.categoria === "DEPORTIVO" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.activo ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {t.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <button onClick={() => handleToggle(t.id, !t.activo)}
                className={`p-1.5 rounded-lg transition-colors ${t.activo ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}>
                {t.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
            </div>
            <h3 className="font-bold text-base mb-1">{t.nombre}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.horario_texto}</p>
            <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Responsable:</span>
                <span className="font-medium text-foreground text-right truncate ml-2">{t.usuarios?.nombre_completo ?? "Sin asignar"}</span>
              </div>
              <div className="flex justify-between">
                <span>Lugares:</span>
                <span className={`font-bold ${t.cupo_disponible === 0 ? "text-red-500" : t.cupo_disponible <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                  {t.cupo_disponible}/{t.cupo_maximo}
                </span>
              </div>
              {t.periodos && <div className="flex justify-between"><span>Período:</span><span className="font-medium text-foreground">{t.periodos.nombre}</span></div>}
            </div>
          </div>
        ))}
        {talleres.length === 0 && (
          <div className="col-span-full glass-card p-12 rounded-3xl text-center">
            <CalendarPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay talleres creados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
