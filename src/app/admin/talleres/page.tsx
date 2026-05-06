"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { CalendarPlus, BookOpen, Edit2, Plus, Loader2, X, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { crearTaller, editarTaller, toggleTallerActivo } from "@/app/actions/talleres";

type Taller = {
  id: string; nombre: string; descripcion?: string;
  categoria: string; horario_texto: string; ubicacion: string;
  cupo_maximo: number; cupo_disponible: number; activo: boolean;
  usuarios?: { id?: string; nombre_completo: string } | null;
  periodos?: { id?: string; nombre: string } | null;
};
type Encargado = { id: string; nombre_completo: string };
type Periodo   = { id: string; nombre: string };
type Msg       = { text: string; type: "ok" | "err" };

const FORM_FIELDS = (encargados: Encargado[], periodos: Periodo[], taller?: Taller | null) => [
  { name: "nombre",       label: "Nombre del Taller",  type: "text",   required: true,  defaultValue: taller?.nombre,       placeholder: "Ej: Fútbol Varonil" },
  { name: "descripcion",  label: "Descripción",         type: "text",   required: false, defaultValue: taller?.descripcion,  placeholder: "Breve descripción..." },
  { name: "horario_texto",label: "Horario",             type: "text",   required: true,  defaultValue: taller?.horario_texto, placeholder: "Ej: Lunes y Miércoles 16:00–18:00" },
  { name: "ubicacion",    label: "Ubicación",           type: "text",   required: true,  defaultValue: taller?.ubicacion,    placeholder: "Ej: Cancha Principal" },
];

export default function TalleresAdminPage() {
  const [talleres,   setTalleres]   = useState<Taller[]>([]);
  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [periodos,   setPeriodos]   = useState<Periodo[]>([]);
  const [showForm,   setShowForm]   = useState(false);
  const [editando,   setEditando]   = useState<Taller | null>(null);
  const [isPending,  startTransition] = useTransition();
  const [mensaje,    setMensaje]    = useState<Msg | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/admin/talleres").then((r) => r.json()),
      fetch("/api/admin/encargados").then((r) => r.json()),
      fetch("/api/periodos").then((r) => r.json()),
    ]).then(([t, e, p]) => { setTalleres(t); setEncargados(e); setPeriodos(p); }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const flash = (text: string, type: Msg["type"]) => {
    setMensaje({ text, type });
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleCrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await crearTaller(fd);
      if (result.error) { flash(result.error, "err"); return; }
      flash("Taller creado correctamente.", "ok");
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      loadData();
    });
  };

  const handleEditar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editando) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await editarTaller(editando.id, fd);
      if (result.error) { flash(result.error, "err"); return; }
      flash("Taller actualizado correctamente.", "ok");
      setEditando(null);
      loadData();
    });
  };

  const handleToggle = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleTallerActivo(id, activo);
      setTalleres((prev) => prev.map((t) => t.id === id ? { ...t, activo } : t));
    });
  };

  const TallerForm = ({ taller, onSubmit, submitLabel }: {
    taller?: Taller | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {FORM_FIELDS(encargados, periodos, taller).map(({ name, label, required, defaultValue, placeholder }) => (
          <div key={name} className={`space-y-1 ${name === "descripcion" ? "md:col-span-2" : ""}`}>
            <label className="text-sm font-medium text-foreground/80">{label}</label>
            <input name={name} required={required} defaultValue={defaultValue ?? ""}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              placeholder={placeholder} />
          </div>
        ))}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80">Categoría</label>
          <select name="categoria" defaultValue={taller?.categoria ?? "DEPORTIVO"}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm">
            <option value="DEPORTIVO">Deportivo</option>
            <option value="CULTURAL">Cultural</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80">Cupo Máximo</label>
          <input name="cupo_maximo" type="number" min={1} max={100} required
            defaultValue={taller?.cupo_maximo ?? 20}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80">Responsable</label>
          <select name="responsable_id" required className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            defaultValue={(taller?.usuarios as { id?: string } | null | undefined)?.id ?? ""}>
            <option value="">Selecciona encargado</option>
            {encargados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
          </select>
        </div>
        {!taller && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Período</label>
            <select name="periodo_id" required className="glass-input w-full px-4 py-3 rounded-xl text-sm">
              <option value="">Selecciona período</option>
              {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitLabel}
        </button>
        <button type="button" onClick={() => { setShowForm(false); setEditando(null); }}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catálogo de Talleres</h1>
          <p className="text-muted-foreground mt-1">Crea y gestiona los talleres deportivos y culturales del período.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditando(null); }}
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

      {/* Crear */}
      {showForm && !editando && (
        <div className="glass-card p-6 rounded-3xl animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Nuevo Taller</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <TallerForm onSubmit={handleCrear} submitLabel="Crear Taller" />
        </div>
      )}

      {/* Editar */}
      {editando && (
        <div className="glass-card p-6 rounded-3xl animate-slide-up border border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Editando: {editando.nombre}
            </h3>
            <button onClick={() => setEditando(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <TallerForm taller={editando} onSubmit={handleEditar} submitLabel="Guardar Cambios" />
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {talleres.map((t) => (
          <div key={t.id}
            className={`glass-card p-5 rounded-2xl flex flex-col transition-all ${!t.activo ? "opacity-60" : "hover:border-primary/20"} ${editando?.id === t.id ? "border-primary/30 shadow-lg shadow-primary/10" : ""}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.categoria === "DEPORTIVO" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.activo ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {t.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditando(t); setShowForm(false); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Editar taller">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggle(t.id, !t.activo)}
                  className={`p-1.5 rounded-lg transition-colors ${t.activo ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}>
                  {t.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <h3 className="font-bold text-base mb-1">{t.nombre}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.horario_texto} · {t.ubicacion}</p>
            <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Responsable:</span>
                <span className="font-medium text-foreground text-right truncate ml-2">{t.usuarios?.nombre_completo ?? "Sin asignar"}</span>
              </div>
              <div className="flex justify-between">
                <span>Cupo:</span>
                <span className={`font-bold ${t.cupo_disponible === 0 ? "text-red-500" : t.cupo_disponible <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                  {t.cupo_disponible}/{t.cupo_maximo} disponibles
                </span>
              </div>
              {t.periodos && (
                <div className="flex justify-between">
                  <span>Período:</span>
                  <span className="font-medium text-foreground">{t.periodos.nombre}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {talleres.length === 0 && (
          <div className="col-span-full glass-card p-12 rounded-3xl text-center">
            <CalendarPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay talleres creados.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Crea el primer taller para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
