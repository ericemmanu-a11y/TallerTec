import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Download, CheckCircle2, Clock, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Registros de Alumnos | Admin TallerTec" };

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error de Configuración</h1>
          <p className="text-muted-foreground">El sistema no está configurado correctamente.</p>
        </div>
      </div>
    );
  }

  let query = adminClient
    .from("inscripciones")
    .select("id, horas_acumuladas, estado, talleres(nombre, categoria), usuarios(nombre_completo, numero_control, carrera, semestre, email)")
    .in("estado", ["ACTIVA", "COMPLETADA"])
    .order("horas_acumuladas", { ascending: false });

  if (estado === "completada") query = query.eq("estado", "COMPLETADA");
  if (estado === "activa") query = query.eq("estado", "ACTIVA");

  const { data: inscripciones } = await query;

  const filtered = q
    ? inscripciones?.filter((i) => {
        const u = i.usuarios as unknown as { nombre_completo: string; numero_control: string | null } | null;
        const text = q.toLowerCase();
        return u?.nombre_completo.toLowerCase().includes(text) || u?.numero_control?.toLowerCase().includes(text);
      })
    : inscripciones;

  const completados = inscripciones?.filter((i) => i.estado === "COMPLETADA").length ?? 0;
  const total = inscripciones?.length ?? 0;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Registro de Alumnos</h1>
          <p className="text-muted-foreground mt-1">Vista global de estudiantes inscritos y progreso de horas.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{completados}/{total} con meta cumplida</span>
          <Link href="/api/admin/export-alumnos"
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-all border border-border/50 hover:border-primary/30 hover:text-primary">
            <Download className="w-4 h-4" /> Exportar CSV
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Alumnos Inscritos</h3>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{filtered?.length ?? 0} resultados</span>
          </div>
          <form className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                className="glass-input w-full md:w-56 pl-10 pr-4 py-2 rounded-lg text-sm"
                placeholder="Nombre o no. control..."
              />
            </div>
            <select name="estado" defaultValue={estado}
              className="glass-input px-3 py-2 rounded-lg text-sm">
              <option value="">Todos</option>
              <option value="activa">En curso</option>
              <option value="completada">Completados</option>
            </select>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
              Filtrar
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-5 py-3 font-medium">No. Control</th>
                <th className="px-5 py-3 font-medium">Nombre / Carrera</th>
                <th className="px-5 py-3 font-medium">Taller</th>
                <th className="px-5 py-3 font-medium text-center">Horas</th>
                <th className="px-5 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered?.map((ins) => {
                const u = ins.usuarios as unknown as { nombre_completo: string; numero_control: string | null; carrera: string | null; semestre: number | null } | null;
                const t = ins.talleres as unknown as { nombre: string; categoria: string } | null;
                const pct = Math.min((Number(ins.horas_acumuladas) / 20) * 100, 100);
                return (
                  <tr key={ins.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{u?.numero_control ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{u?.nombre_completo}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{u?.carrera ?? ""}{u?.semestre ? ` • ${u.semestre}° sem` : ""}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t?.categoria === "DEPORTIVO" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                        {t?.nombre ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-primary">{Number(ins.horas_acumuladas).toFixed(1)}</span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ins.estado === "COMPLETADA" ? "bg-green-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {ins.estado === "COMPLETADA" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">
                          <CheckCircle2 className="w-3 h-3" /> Meta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                          <Clock className="w-3 h-3" /> En curso
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
