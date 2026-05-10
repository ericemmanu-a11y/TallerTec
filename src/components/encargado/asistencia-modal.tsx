"use client";

import { useState, useTransition } from "react";
import { X, Trash2, Edit3, Loader2, AlertTriangle } from "lucide-react";
import { eliminarAsistencia, editarAsistencia } from "@/app/actions/asistencia";

interface AsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modo: "editar" | "eliminar";
  asistencia: {
    id: string;
    horas: number;
    fecha: string;
    nombreAlumno: string;
  };
}

export function AsistenciaModal({
  isOpen,
  onClose,
  onSuccess,
  modo,
  asistencia,
}: AsistenciaModalProps) {
  const [horas, setHoras] = useState(asistencia.horas);
  const [razon, setRazon] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let result;
      if (modo === "eliminar") {
        result = await eliminarAsistencia(asistencia.id, razon || undefined);
      } else {
        result = await editarAsistencia(asistencia.id, horas, razon || undefined);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {modo === "eliminar" ? (
              <div className="p-2 rounded-xl bg-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-accent/20">
                <Edit3 className="w-5 h-5 text-accent" />
              </div>
            )}
            <h3 className="text-lg font-bold">
              {modo === "eliminar" ? "Eliminar Asistencia" : "Editar Asistencia"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del alumno */}
        <div className="p-4 rounded-xl bg-white/5 border border-border/30 mb-4">
          <p className="font-medium">{asistencia.nombreAlumno}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatFecha(asistencia.fecha)}
          </p>
          <p className="text-sm text-muted-foreground">
            Horas registradas: <span className="font-medium text-foreground">{asistencia.horas}h</span>
          </p>
        </div>

        {modo === "eliminar" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              Esta acción eliminará el registro de asistencia y recalculará las horas acumuladas del alumno.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "editar" && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Horas computadas
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={horas}
                onChange={(e) => setHoras(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Razón del cambio <span className="text-muted-foreground/50">(opcional)</span>
            </label>
            <textarea
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              rows={3}
              placeholder={
                modo === "eliminar"
                  ? "Ej: Sanción por comportamiento, salida anticipada..."
                  : "Ej: Corrección de horas, error de registro..."
              }
              className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors border border-border/50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                modo === "eliminar"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-accent hover:bg-accent/90"
              }`}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : modo === "eliminar" ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              {isPending
                ? "Procesando..."
                : modo === "eliminar"
                ? "Eliminar"
                : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
