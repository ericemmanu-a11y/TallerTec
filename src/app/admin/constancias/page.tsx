import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle2, XCircle, Clock, FileText, AlertCircle, ExternalLink, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { aprobarConstancia, rechazarConstancia, marcarConstanciaEntregada } from "@/app/actions/constancias";

export const metadata = { title: "Gestión de Constancias | Admin TallerTec" };

const ESTADO_CONFIG = {
  PENDIENTE:  { label: "Pendiente",  icon: Clock,         color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  APROBADA:   { label: "Aprobada",   icon: CheckCircle2,  color: "text-green-500 bg-green-500/10 border-green-500/20" },
  RECHAZADA:  { label: "Rechazada",  icon: XCircle,       color: "text-red-500 bg-red-500/10 border-red-500/20" },
  GENERADA:   { label: "Generada",   icon: FileText,      color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  ENTREGADA:  { label: "Entregada",  icon: Award,         color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
};

const NIVEL_COLOR: Record<string, string> = {
  INSUFICIENTE: "text-red-400", SUFICIENTE: "text-orange-400",
  BUENO: "text-yellow-400", NOTABLE: "text-blue-400", EXCELENTE: "text-green-400",
};
const NIVEL_LABEL: Record<string, string> = {
  INSUFICIENTE: "Insuficiente", SUFICIENTE: "Suficiente",
  BUENO: "Bueno", NOTABLE: "Notable", EXCELENTE: "Excelente",
};

export default async function AdminConstanciasPage() {
  const supabase = await createClient();

  const { data: constancias } = await supabase
    .from("constancias")
    .select("*, usuarios(nombre_completo, numero_control, carrera, email), periodos(nombre), talleres(nombre, categoria)")
    .order("created_at", { ascending: false });

  const pendientes = constancias?.filter((c) => c.estado === "PENDIENTE") ?? [];
  const resto      = constancias?.filter((c) => c.estado !== "PENDIENTE") ?? [];

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestión de Constancias</h1>
        <p className="text-muted-foreground mt-1">
          Aprueba solicitudes una vez que el encargado haya completado la evaluación del estudiante.
        </p>
      </div>

      {/* ── Solicitudes pendientes ── */}
      {pendientes.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Solicitudes Pendientes
            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-bold">{pendientes.length}</span>
          </h2>
          <div className="glass-card rounded-3xl overflow-hidden divide-y divide-border/50">
            {pendientes.map((c) => {
              const alumno  = c.usuarios as unknown as { nombre_completo: string; numero_control: string | null; carrera: string | null; email: string } | null;
              const periodo = c.periodos as unknown as { nombre: string } | null;
              const taller  = c.talleres as unknown as { nombre: string; categoria: string } | null;
              const evaluado = Boolean(c.evaluado_en);

              return (
                <div key={c.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${evaluado ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{alumno?.nombre_completo}</p>
                      <p className="text-sm text-muted-foreground">
                        {alumno?.numero_control} • {alumno?.carrera}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.horas_totales} hrs • {periodo?.nombre}
                        {taller && <span> • <span className={`font-semibold ${taller.categoria === "DEPORTIVO" ? "text-primary" : "text-accent"}`}>{taller.nombre}</span></span>}
                        {" "}• Solicitado: {new Date(c.created_at).toLocaleDateString("es-MX")}
                      </p>
                      {/* Evaluation badge */}
                      {evaluado ? (
                        <p className="text-xs mt-1.5 flex items-center gap-1.5">
                          <ClipboardCheck className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-500 font-semibold">
                            Evaluado por {c.evaluado_por_nombre ?? "encargado"}
                          </span>
                          {c.nivel_desempeno && (
                            <span className={`font-bold ml-1 ${NIVEL_COLOR[c.nivel_desempeno] ?? ""}`}>
                              — {NIVEL_LABEL[c.nivel_desempeno]}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs mt-1.5 flex items-center gap-1.5 text-yellow-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="font-semibold">Sin evaluación del encargado</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/constancia/${c.id}`}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Ver PDF
                    </Link>
                    <form action={async () => { "use server"; await aprobarConstancia(c.id); }}>
                      <button type="submit"
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${evaluado ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-white/5 text-muted-foreground cursor-not-allowed opacity-60"}`}
                        disabled={!evaluado}
                        title={!evaluado ? "El encargado debe evaluar primero" : undefined}>
                        ✓ Aprobar
                      </button>
                    </form>
                    <form action={async () => { "use server"; await rechazarConstancia(c.id, "Solicitud no cumple los requisitos."); }}>
                      <button type="submit"
                        className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl text-sm font-bold transition-colors">
                        ✗ Rechazar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pendientes.length === 0 && (
        <div className="glass-card p-10 rounded-3xl text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No hay solicitudes pendientes.</p>
        </div>
      )}

      {/* ── Historial ── */}
      <section>
        <h2 className="text-lg font-bold mb-4">Historial</h2>
        {resto.length > 0 ? (
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-5 py-4 font-medium">Alumno</th>
                    <th className="px-5 py-4 font-medium">Período / Taller</th>
                    <th className="px-5 py-4 font-medium text-center">Horas</th>
                    <th className="px-5 py-4 font-medium">Nivel</th>
                    <th className="px-5 py-4 font-medium">Folio</th>
                    <th className="px-5 py-4 font-medium text-center">Estado</th>
                    <th className="px-5 py-4 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resto.map((c) => {
                    const alumno  = c.usuarios as unknown as { nombre_completo: string; numero_control: string | null } | null;
                    const periodo = c.periodos as unknown as { nombre: string } | null;
                    const taller  = c.talleres as unknown as { nombre: string } | null;
                    const config  = ESTADO_CONFIG[c.estado as keyof typeof ESTADO_CONFIG];
                    const Icon    = config.icon;
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{alumno?.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">{alumno?.numero_control}</p>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <p className="text-muted-foreground">{periodo?.nombre}</p>
                          {taller && <p className="text-xs font-medium text-primary/70">{taller.nombre}</p>}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-primary">{c.horas_totales}</td>
                        <td className="px-5 py-4">
                          {c.nivel_desempeno ? (
                            <span className={`text-xs font-bold ${NIVEL_COLOR[c.nivel_desempeno] ?? "text-muted-foreground"}`}>
                              {NIVEL_LABEL[c.nivel_desempeno]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{c.folio ?? "—"}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                            <Icon className="w-3 h-3" /> {config.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <Link href={`/constancia/${c.id}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                              <ExternalLink className="w-3 h-3" /> Ver PDF
                            </Link>
                            {c.estado === "APROBADA" && (
                              <form action={async () => { "use server"; await marcarConstanciaEntregada(c.id); }}>
                                <button type="submit" className="text-xs text-purple-400 hover:underline font-medium">
                                  Marcar Entregada
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-10 rounded-3xl text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay constancias procesadas aún.</p>
          </div>
        )}
      </section>
    </main>
  );
}
