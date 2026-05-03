import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle2, XCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { aprobarConstancia, rechazarConstancia, marcarConstanciaEntregada } from "@/app/actions/constancias";

export const metadata = { title: "Gestión de Constancias | Admin TallerTec" };

const ESTADO_CONFIG = {
  PENDIENTE: { label: "Pendiente", icon: Clock, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  APROBADA: { label: "Aprobada", icon: CheckCircle2, color: "text-green-500 bg-green-500/10 border-green-500/20" },
  RECHAZADA: { label: "Rechazada", icon: XCircle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  GENERADA: { label: "Generada", icon: FileText, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  ENTREGADA: { label: "Entregada", icon: Award, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
};

export default async function AdminConstanciasPage() {
  const supabase = await createClient();

  const { data: constancias } = await supabase
    .from("constancias")
    .select("*, usuarios(nombre_completo, numero_control, carrera, email), periodos(nombre)")
    .order("created_at", { ascending: false });

  const pendientes = constancias?.filter((c) => c.estado === "PENDIENTE") ?? [];
  const resto = constancias?.filter((c) => c.estado !== "PENDIENTE") ?? [];

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestión de Constancias</h1>
        <p className="text-muted-foreground mt-1">Revisa, aprueba o rechaza las solicitudes de constancias de actividad.</p>
      </div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Solicitudes Pendientes
            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-bold">{pendientes.length}</span>
          </h2>
          <div className="glass-card rounded-3xl overflow-hidden divide-y divide-border/50">
            {pendientes.map((c) => {
              const alumno = c.usuarios as { nombre_completo: string; numero_control: string | null; carrera: string | null; email: string } | null;
              const periodo = c.periodos as { nombre: string } | null;
              return (
                <div key={c.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{alumno?.nombre_completo}</p>
                      <p className="text-sm text-muted-foreground">
                        {alumno?.numero_control} • {alumno?.carrera}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.horas_totales} horas • {periodo?.nombre} • Solicitado: {new Date(c.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <form action={async () => { "use server"; await aprobarConstancia(c.id); }}>
                      <button type="submit"
                        className="px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-xl text-sm font-bold transition-colors">
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

      {/* Historial */}
      <section>
        <h2 className="text-lg font-bold mb-4">Historial</h2>
        {resto.length > 0 ? (
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-5 py-4 font-medium">Alumno</th>
                    <th className="px-5 py-4 font-medium">Período</th>
                    <th className="px-5 py-4 font-medium text-center">Horas</th>
                    <th className="px-5 py-4 font-medium">Folio</th>
                    <th className="px-5 py-4 font-medium text-center">Estado</th>
                    <th className="px-5 py-4 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resto.map((c) => {
                    const alumno = c.usuarios as { nombre_completo: string; numero_control: string | null } | null;
                    const periodo = c.periodos as { nombre: string } | null;
                    const config = ESTADO_CONFIG[c.estado as keyof typeof ESTADO_CONFIG];
                    const Icon = config.icon;
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{alumno?.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">{alumno?.numero_control}</p>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-sm">{periodo?.nombre}</td>
                        <td className="px-5 py-4 text-center font-bold text-primary">{c.horas_totales}</td>
                        <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{c.folio ?? "—"}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                            <Icon className="w-3 h-3" /> {config.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {c.estado === "APROBADA" && (
                            <form action={async () => { "use server"; await marcarConstanciaEntregada(c.id); }}>
                              <button type="submit" className="text-xs text-purple-400 hover:underline font-medium">
                                Marcar Entregada
                              </button>
                            </form>
                          )}
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
