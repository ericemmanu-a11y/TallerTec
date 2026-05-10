"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock, MapPin, FileText, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { editarTallerEncargado } from "@/app/actions/talleres";

interface Taller {
  id: string;
  nombre: string;
  descripcion: string | null;
  horario_texto: string;
  ubicacion: string;
  cupo_maximo: number;
  cupo_disponible: number;
  categoria: string;
}

export default function EditarTallerPage({ params }: { params: Promise<{ tallerId: string }> }) {
  const router = useRouter();
  const [taller, setTaller] = useState<Taller | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [tallerId, setTallerId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setTallerId(p.tallerId);
      fetchTaller(p.tallerId);
    });
  }, [params]);

  const fetchTaller = async (id: string) => {
    try {
      const res = await fetch(`/api/encargado/mi-taller/${id}`);
      if (!res.ok) {
        setMensaje({ tipo: "err", texto: "No tienes permiso para editar este taller." });
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTaller(data);
    } catch {
      setMensaje({ tipo: "err", texto: "Error al cargar el taller." });
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await editarTallerEncargado(tallerId, fd);
      if (result.error) {
        setMensaje({ tipo: "err", texto: result.error });
      } else {
        setMensaje({ tipo: "ok", texto: "Taller actualizado correctamente." });
        setTimeout(() => router.push("/encargado"), 1500);
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!taller) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="glass-card p-8 rounded-3xl text-center">
          <p className="text-red-400 mb-4">{mensaje?.texto || "Taller no encontrado."}</p>
          <Link href="/encargado" className="text-accent hover:underline">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  const inscritosActuales = taller.cupo_maximo - taller.cupo_disponible;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          href="/encargado"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Editar Taller</h1>
          <p className="text-muted-foreground">{taller.nombre}</p>
        </div>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            mensaje.tipo === "ok"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <FileText className="w-4 h-4" /> Descripción
            </label>
            <textarea
              name="descripcion"
              defaultValue={taller.descripcion || ""}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              placeholder="Describe las actividades y objetivos del taller..."
            />
          </div>

          {/* Horario */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Clock className="w-4 h-4" /> Horario
            </label>
            <input
              type="text"
              name="horario_texto"
              defaultValue={taller.horario_texto}
              required
              className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Ej: Lunes y Miércoles 16:00-18:00"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" /> Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              defaultValue={taller.ubicacion}
              required
              className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Ej: Cancha de fútbol"
            />
          </div>

          {/* Cupo Máximo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="w-4 h-4" /> Cupo Máximo
            </label>
            <input
              type="number"
              name="cupo_maximo"
              defaultValue={taller.cupo_maximo}
              min={inscritosActuales}
              max={100}
              required
              className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: {inscritosActuales} (inscritos actuales)
            </p>
          </div>

          {/* Info solo lectura */}
          <div className="p-4 bg-white/5 rounded-xl border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Información del taller</p>
            <p className="text-sm">
              <span className="text-muted-foreground">Categoría:</span>{" "}
              <span className="font-medium">{taller.categoria}</span>
            </p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Inscritos:</span>{" "}
              <span className="font-medium">{inscritosActuales} alumnos</span>
            </p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Cupo disponible:</span>{" "}
              <span className="font-medium">{taller.cupo_disponible} lugares</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
          <Link
            href="/encargado"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-colors border border-border/50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
