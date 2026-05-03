import { createClient } from "@/lib/supabase/server";
import { Users, CheckCircle2, Clock, ArrowLeft, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "Mis Alumnos | TallerTec" };

export default async function AlumnosEncargadoPage({
  searchParams,
}: {
  searchParams: Promise<{ taller?: string }>;
}) {
  const { taller: tallerId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sin taller param: mostrar selector de talleres del encargado
  if (!tallerId) {
    const { data: misTalleres } = await supabase
      .from("talleres")
      .select("id, nombre, horario_texto, categoria")
      .eq("responsable_id", user.id)
      .eq("activo", true)
      .order("nombre");

    return (
      <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mis Alumnos</h1>
          <p className="text-muted-foreground mt-1">Selecciona un taller para ver su lista de inscritos.</p>
        </div>
        {misTalleres && misTalleres.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {misTalleres.map((t) => (
              <Link key={t.id} href={`/encargado/alumnos?taller=${t.id}`}
                className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:bg-white/5 transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.categoria === "DEPORTIVO" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold group-hover:text-primary transition-colors">{t.nombre}</p>
                  <p className="text-sm text-muted-foreground">{t.horario_texto}</p>
                </div>
                <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 rounded-3xl text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes talleres asignados.</p>
          </div>
        )}
      </div>
    );
  }

  const { data: taller } = await supabase
    .from("talleres")
    .select("nombre, horario_texto")
    .eq("id", tallerId)
    .eq("responsable_id", user.id)
    .single();

  if (!taller) redirect("/encargado");

  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select("id, horas_acumuladas, estado, fecha_inscripcion, usuarios(nombre_completo, numero_control, carrera, semestre)")
    .eq("taller_id", tallerId)
    .in("estado", ["ACTIVA", "COMPLETADA"])
    .order("horas_acumuladas", { ascending: false });

  const hoy = new Date().toISOString().split("T")[0];
  const asistenciasHoy = inscripciones?.length
    ? await supabase
        .from("asistencias")
        .select("inscripcion_id")
        .eq("fecha", hoy)
        .in("inscripcion_id", inscripciones.map((i) => i.id))
    : { data: [] };

  const presentesHoy = new Set(asistenciasHoy.data?.map((a) => a.inscripcion_id));

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/encargado"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Mis Talleres
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{taller.nombre}</h1>
          <p className="text-muted-foreground text-sm">{taller.horario_texto}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{inscripciones?.length ?? 0} alumnos</p>
          <p className="text-xs text-muted-foreground">{presentesHoy.size} presentes hoy</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Lista de Inscritos</h3>
          <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full font-medium">
            Hoy: {presentesHoy.size} presentes
          </span>
        </div>

        {inscripciones && inscripciones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-medium">Alumno</th>
                  <th className="px-5 py-3 font-medium">No. Control</th>
                  <th className="px-5 py-3 font-medium text-center">Horas</th>
                  <th className="px-5 py-3 font-medium text-center">Estado</th>
                  <th className="px-5 py-3 font-medium text-center">Hoy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {inscripciones.map((ins) => {
                  const alumno = ins.usuarios as unknown as { nombre_completo: string; numero_control: string | null; carrera: string | null; semestre: number | null } | null;
                  const presente = presentesHoy.has(ins.id);
                  const pct = Math.min((Number(ins.horas_acumuladas) / 20) * 100, 100);
                  return (
                    <tr key={ins.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{alumno?.nombre_completo ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{alumno?.carrera ?? ""}{alumno?.semestre ? ` • ${alumno.semestre}° sem` : ""}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{alumno?.numero_control ?? "—"}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-primary">{Number(ins.horas_acumuladas).toFixed(1)}</span>
                          <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${ins.estado === "COMPLETADA" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-400"}`}>
                          {ins.estado === "COMPLETADA" ? <><CheckCircle2 className="w-3 h-3" /> Meta</>  : <><Clock className="w-3 h-3" /> En curso</>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {presente
                          ? <span className="inline-flex items-center gap-1 text-green-500 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Presente</span>
                          : <span className="text-muted-foreground/50 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay alumnos inscritos aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
