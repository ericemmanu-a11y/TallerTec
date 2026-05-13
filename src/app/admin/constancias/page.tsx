import { createAdminClient } from "@/lib/supabase/admin";
import { Award, CheckCircle2, XCircle, Clock, FileText, AlertCircle, ExternalLink, ClipboardCheck, ArrowLeft, Search, Filter, Settings } from "lucide-react";
import Link from "next/link";
import { aprobarConstancia, rechazarConstancia, marcarConstanciaEntregada } from "@/app/actions/constancias";

export const metadata = { title: "Gestión de Constancias | Admin TallerTec" };
export const dynamic = "force-dynamic";

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

export default async function AdminConstanciasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; periodo?: string }>;
}) {
  const { q, estado, periodo } = await searchParams;

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

  // Obtener períodos para el filtro
  const { data: periodos } = await adminClient
    .from("periodos")
    .select("id, nombre")
    .order("fecha_inicio", { ascending: false });

  // Conteo directo (mismo query que el layout)
  const { count: countDirect } = await adminClient
    .from("constancias")
    .select("*", { count: "exact", head: true });

  // Query simple sin JOINs
  const { data: constanciasSimple } = await adminClient
    .from("constancias")
    .select("id, estado, estudiante_id");

  // Obtener constancias con JOINs - especificar FK explícitamente
  const { data: constancias, error: constanciasError } = await adminClient
    .from("constancias")
    .select("*, estudiante:usuarios!estudiante_id(nombre_completo, numero_control, carrera, email), periodos(id, nombre), talleres(nombre, categoria)")
    .order("created_at", { ascending: false });

  // Debug: log si hay error
  if (constanciasError) {
    console.error("Error fetching constancias:", constanciasError);
  }

  // Debug: ver qué datos llegaron
  console.log("=== DEBUG CONSTANCIAS ===");
  console.log("Total constancias:", constancias?.length);
  console.log("Constancias raw:", JSON.stringify(constancias?.map(c => ({ id: c.id, estado: c.estado, estudiante_id: c.estudiante_id })), null, 2));
  console.log("Search params:", { q, estado, periodo });

  // Aplicar filtros
  let filtered = constancias ?? [];

  // Filtrar por búsqueda (nombre o número de control)
  if (q) {
    const searchTerm = q.toLowerCase();
    filtered = filtered.filter((c) => {
      const alumno = c.estudiante as unknown as { nombre_completo: string; numero_control: string | null } | null;
      const folio = c.folio?.toLowerCase() ?? "";
      return (
        alumno?.nombre_completo.toLowerCase().includes(searchTerm) ||
        alumno?.numero_control?.toLowerCase().includes(searchTerm) ||
        folio.includes(searchTerm)
      );
    });
  }

  // Filtrar por estado
  if (estado && estado !== "todos") {
    filtered = filtered.filter((c) => c.estado === estado.toUpperCase());
  }

  // Filtrar por período
  if (periodo && periodo !== "todos") {
    filtered = filtered.filter((c) => {
      const per = c.periodos as unknown as { id: string } | null;
      return per?.id === periodo;
    });
  }

  console.log("Filtered después de todos los filtros:", filtered.length);

  // Separar pendientes del resto para mostrar primero
  const pendientes = filtered.filter((c) => c.estado === "PENDIENTE");
  const resto = filtered.filter((c) => c.estado !== "PENDIENTE");

  console.log("Pendientes:", pendientes.length, "Resto:", resto.length);

  // Estadísticas
  const stats = {
    total: constancias?.length ?? 0,
    pendientes: constancias?.filter((c) => c.estado === "PENDIENTE").length ?? 0,
    aprobadas: constancias?.filter((c) => c.estado === "APROBADA").length ?? 0,
    entregadas: constancias?.filter((c) => c.estado === "ENTREGADA").length ?? 0,
  };

  // Debug data para mostrar en UI
  const debugData = {
    countDirect: countDirect ?? 0,
    constanciasSimpleCount: constanciasSimple?.length ?? 0,
    constanciasSimple: constanciasSimple ?? [],
    totalConstancias: constancias?.length ?? 0,
    constanciasRaw: constancias?.map(c => ({ id: c.id?.slice(0,8), estado: c.estado, usuario: (c.estudiante as {nombre_completo?: string} | null)?.nombre_completo ?? "NULL" })) ?? [],
    filteredCount: filtered.length,
    pendientesCount: pendientes.length,
    searchParams: { q: q ?? "null", estado: estado ?? "null", periodo: periodo ?? "null" },
    error: constanciasError ? constanciasError.message : "ninguno",
  };

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* DEBUG TEMPORAL - BORRAR DESPUÉS */}
      <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-xs font-mono">
        <p className="font-bold text-red-400 mb-2">DEBUG (temporal):</p>
        <p>Count directo (head:true): <span className="text-yellow-400 font-bold">{debugData.countDirect}</span></p>
        <p>Query simple (sin JOINs): <span className="text-yellow-400 font-bold">{debugData.constanciasSimpleCount}</span></p>
        <p>Query con JOINs: <span className="text-yellow-400 font-bold">{debugData.totalConstancias}</span></p>
        <p>Error de consulta: <span className={debugData.error !== "ninguno" ? "text-red-400 font-bold" : "text-green-400"}>{debugData.error}</span></p>
        <p className="mt-2">Datos query simple:</p>
        <pre className="text-[10px] overflow-x-auto bg-black/30 p-2 rounded">{JSON.stringify(debugData.constanciasSimple, null, 1)}</pre>
        <p className="mt-2">Datos query con JOINs:</p>
        <pre className="text-[10px] overflow-x-auto bg-black/30 p-2 rounded">{JSON.stringify(debugData.constanciasRaw, null, 1)}</pre>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Gestión de Constancias</h1>
          <p className="text-muted-foreground mt-1">
            Busca, filtra y gestiona las constancias del sistema.
          </p>
        </div>
        <Link
          href="/admin/constancias/configuracion"
          className="shrink-0 flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-all border border-border/50 hover:border-primary/30 hover:text-primary"
        >
          <Settings className="w-4 h-4" /> Configurar Formato
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.pendientes}</p>
          <p className="text-xs text-muted-foreground">Pendientes</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-500">{stats.aprobadas}</p>
          <p className="text-xs text-muted-foreground">Aprobadas</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.entregadas}</p>
          <p className="text-xs text-muted-foreground">Entregadas</p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="glass-card p-4 rounded-2xl">
        <form className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              placeholder="Buscar por nombre, no. control o folio..."
            />
          </div>
          <div className="flex gap-3">
            <select
              name="estado"
              defaultValue={estado ?? "todos"}
              className="glass-input px-4 py-2.5 rounded-xl text-sm min-w-[140px]"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="entregada">Entregadas</option>
            </select>
            <select
              name="periodo"
              defaultValue={periodo ?? "todos"}
              className="glass-input px-4 py-2.5 rounded-xl text-sm min-w-[180px]"
            >
              <option value="todos">Todos los períodos</option>
              {periodos?.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filtrar
            </button>
          </div>
        </form>
        {(q || estado || periodo) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
            <Link
              href="/admin/constancias"
              className="text-xs text-primary hover:underline"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      {/* Solicitudes pendientes */}
      {pendientes.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Solicitudes Pendientes
            <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-bold">{pendientes.length}</span>
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border/50">
            {pendientes.map((c) => {
              const alumno  = c.estudiante as unknown as { nombre_completo: string; numero_control: string | null; carrera: string | null; email: string } | null;
              const periodoData = c.periodos as unknown as { nombre: string } | null;
              const taller  = c.talleres as unknown as { nombre: string; categoria: string } | null;
              const evaluado = Boolean(c.evaluado_en);

              return (
                <div key={c.id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                        {c.horas_totales} hrs • {periodoData?.nombre}
                        {taller && <span> • <span className={`font-semibold ${taller.categoria === "DEPORTIVO" ? "text-primary" : "text-accent"}`}>{taller.nombre}</span></span>}
                        {" "}• Solicitado: {new Date(c.created_at).toLocaleDateString("es-MX")}
                      </p>
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
                        Aprobar
                      </button>
                    </form>
                    <form action={async () => { "use server"; await rechazarConstancia(c.id, "Solicitud no cumple los requisitos."); }}>
                      <button type="submit"
                        className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl text-sm font-bold transition-colors">
                        Rechazar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="glass-card p-10 rounded-2xl text-center">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No se encontraron constancias con los filtros aplicados.</p>
        </div>
      )}

      {/* Historial / Resultados de búsqueda */}
      {resto.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">
            {q || estado || periodo ? "Resultados" : "Historial"}
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-4 md:px-5 py-4 font-medium">Alumno</th>
                    <th className="px-4 md:px-5 py-4 font-medium">Período / Taller</th>
                    <th className="px-4 md:px-5 py-4 font-medium text-center">Horas</th>
                    <th className="px-4 md:px-5 py-4 font-medium">Nivel</th>
                    <th className="px-4 md:px-5 py-4 font-medium">Folio</th>
                    <th className="px-4 md:px-5 py-4 font-medium text-center">Estado</th>
                    <th className="px-4 md:px-5 py-4 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resto.map((c) => {
                    const alumno  = c.estudiante as unknown as { nombre_completo: string; numero_control: string | null } | null;
                    const periodoData = c.periodos as unknown as { nombre: string } | null;
                    const taller  = c.talleres as unknown as { nombre: string } | null;
                    const config  = ESTADO_CONFIG[c.estado as keyof typeof ESTADO_CONFIG];
                    const Icon    = config.icon;
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 md:px-5 py-4">
                          <p className="font-semibold">{alumno?.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">{alumno?.numero_control}</p>
                        </td>
                        <td className="px-4 md:px-5 py-4 text-sm">
                          <p className="text-muted-foreground">{periodoData?.nombre}</p>
                          {taller && <p className="text-xs font-medium text-primary/70">{taller.nombre}</p>}
                        </td>
                        <td className="px-4 md:px-5 py-4 text-center font-bold text-primary">{c.horas_totales}</td>
                        <td className="px-4 md:px-5 py-4">
                          {c.nivel_desempeno ? (
                            <span className={`text-xs font-bold ${NIVEL_COLOR[c.nivel_desempeno] ?? "text-muted-foreground"}`}>
                              {NIVEL_LABEL[c.nivel_desempeno]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 md:px-5 py-4 font-mono text-xs text-muted-foreground">{c.folio ?? "—"}</td>
                        <td className="px-4 md:px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                            <Icon className="w-3 h-3" /> {config.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-5 py-4 text-center">
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
        </section>
      )}
    </main>
  );
}
