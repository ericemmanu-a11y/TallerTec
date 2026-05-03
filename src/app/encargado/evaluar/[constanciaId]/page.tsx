"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { ArrowLeft, CheckSquare, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { evaluarConstancia } from "@/app/actions/constancias";

const CRITERIOS = [
  "Cumple en tiempo y forma con las actividades encomendadas alcanzando los objetivos.",
  "Trabaja en equipo y se adapta a nuevas situaciones.",
  "Muestra liderazgo en las actividades encomendadas.",
  "Organiza su tiempo y trabaja de manera proactiva.",
  "Interpreta la realidad y se sensibiliza aportando soluciones a la problemática con la actividad Cultural, Deportiva y Cívica.",
  "Realiza sugerencias innovadoras para beneficio o mejora del programa en el que participa.",
  "Tiene iniciativa para ayudar en las actividades encomendadas y muestra espíritu de servicio.",
];

const NIVELES = [
  { key: "INSUFICIENTE", label: "Insuficiente", valor: 0, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { key: "SUFICIENTE",   label: "Suficiente",   valor: 1, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { key: "BUENO",        label: "Bueno",        valor: 2, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { key: "NOTABLE",      label: "Notable",      valor: 3, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { key: "EXCELENTE",    label: "Excelente",    valor: 4, color: "bg-green-500/20 text-green-400 border-green-500/30" },
];

function nivelFromPromedio(prom: number): string {
  if (prom < 0.5) return "INSUFICIENTE";
  if (prom < 1.5) return "SUFICIENTE";
  if (prom < 2.5) return "BUENO";
  if (prom < 3.5) return "NOTABLE";
  return "EXCELENTE";
}

type InfoConstancia = {
  alumno_nombre: string;
  alumno_control: string;
  alumno_carrera: string;
  taller_nombre: string;
  periodo_nombre: string;
};

export default function EvaluarConstanciaPage() {
  const params = useParams<{ constanciaId: string }>();
  const router = useRouter();
  const [criterios, setCriterios] = useState<number[]>(Array(7).fill(2)); // default BUENO
  const [observaciones, setObservaciones] = useState("");
  const [info, setInfo] = useState<InfoConstancia | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/constancia-info/${params.constanciaId}`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, [params.constanciaId]);

  const promedio = criterios.reduce((a, b) => a + b, 0) / 7;
  const nivelAuto = nivelFromPromedio(promedio);
  const nivelInfo = NIVELES.find((n) => n.key === nivelAuto)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await evaluarConstancia(params.constanciaId, criterios, nivelAuto, observaciones || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        setTimeout(() => router.push("/encargado/alumnos"), 1800);
      }
    });
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold">Evaluación guardada</h2>
          <p className="text-muted-foreground text-sm">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/encargado/alumnos"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Mis Alumnos
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">Evaluar Estudiante</h1>
          <p className="text-muted-foreground text-sm">Rúbrica oficial — Oficina de Actividades Extraescolares</p>
        </div>
      </div>

      {/* Student info */}
      {info && (
        <div className="glass-card p-5 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Estudiante</p>
            <p className="font-bold">{info.alumno_nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">No. Control</p>
            <p className="font-mono font-bold">{info.alumno_control}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Carrera</p>
            <p className="font-bold">{info.alumno_carrera}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Taller</p>
            <p className="font-bold">{info.taller_nombre}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Criteria table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-bold">Criterios de Evaluación</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Selecciona el nivel de desempeño para cada criterio.</p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-3 text-left text-xs text-muted-foreground font-semibold w-10">No.</th>
                  <th className="px-5 py-3 text-left text-xs text-muted-foreground font-semibold">Criterio</th>
                  {NIVELES.map((n) => (
                    <th key={n.key} className="px-3 py-3 text-center text-xs text-muted-foreground font-semibold whitespace-nowrap">
                      {n.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {CRITERIOS.map((criterio, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="px-5 py-4 text-sm leading-snug max-w-xs">{criterio}</td>
                    {NIVELES.map((n) => (
                      <td key={n.key} className="px-3 py-4 text-center">
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name={`criterio_${i}`}
                            value={n.valor}
                            checked={criterios[i] === n.valor}
                            onChange={() => setCriterios((prev) => { const next = [...prev]; next[i] = n.valor; return next; })}
                            className="sr-only"
                          />
                          <span className={`inline-flex w-7 h-7 rounded-lg border-2 items-center justify-center transition-all ${criterios[i] === n.valor ? `${n.color} border-current font-bold text-sm` : "border-border/30 text-muted-foreground/30 hover:border-border/60"}`}>
                            {criterios[i] === n.valor ? "✕" : ""}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked selects */}
          <div className="md:hidden divide-y divide-border/50">
            {CRITERIOS.map((criterio, i) => (
              <div key={i} className="p-4 space-y-2">
                <p className="text-sm leading-snug">
                  <span className="text-muted-foreground font-mono text-xs mr-2">{i + 1}.</span>
                  {criterio}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {NIVELES.map((n) => (
                    <button
                      key={n.key}
                      type="button"
                      onClick={() => setCriterios((prev) => { const next = [...prev]; next[i] = n.valor; return next; })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${criterios[i] === n.valor ? n.color : "border-border/30 text-muted-foreground hover:border-border/60"}`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-calculated result */}
        <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Nivel de desempeño calculado (promedio de criterios)</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${nivelInfo.color}`}>
                {nivelInfo.label}
              </span>
              <span className="text-2xl font-extrabold text-primary">{nivelInfo.valor}</span>
              <span className="text-muted-foreground text-sm">valor numérico</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Promedio: {promedio.toFixed(2)} / 4.00
          </div>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observaciones <span className="text-muted-foreground">(opcional)</span></label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
            placeholder="Comentarios adicionales sobre el desempeño del estudiante..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 shadow-lg shadow-primary/20">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Evaluación
          </button>
          <Link href="/encargado/alumnos"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-semibold text-sm flex items-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
