import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, FileText, CheckSquare, Clock, ArrowRight, TrendingUp } from "lucide-react";

export const metadata = { title: "Administración | TallerTec" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalInscritos },
    { count: talleresActivos },
    { data: horasData },
    { count: constanciasPendientes },
    { count: constanciasEntregadas },
    { data: ultimasSolicitudes },
  ] = await Promise.all([
    supabase.from("inscripciones").select("id", { count: "exact", head: true }).eq("estado", "ACTIVA"),
    supabase.from("talleres").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("inscripciones").select("horas_acumuladas"),
    supabase.from("constancias").select("id", { count: "exact", head: true }).eq("estado", "PENDIENTE"),
    supabase.from("constancias").select("id", { count: "exact", head: true }).in("estado", ["APROBADA", "ENTREGADA"]),
    supabase.from("constancias").select("id, estado, horas_totales, folio, created_at, usuarios(nombre_completo, numero_control), periodos(nombre)").eq("estado", "PENDIENTE").order("created_at").limit(5),
  ]);

  const totalHoras = horasData?.reduce((acc, i) => acc + Number(i.horas_acumuladas), 0) ?? 0;

  const metrics = [
    { label: "Total Inscritos", value: totalInscritos ?? 0, icon: Users, color: "primary", sub: "Alumnos activos" },
    { label: "Talleres Activos", value: talleresActivos ?? 0, icon: CheckSquare, color: "accent", sub: "Este período" },
    { label: "Horas Computadas", value: Math.round(totalHoras), icon: Clock, color: "purple-500", sub: `Prom: ${totalInscritos ? (totalHoras / totalInscritos).toFixed(1) : 0}/est.` },
    { label: "Constancias", value: constanciasEntregadas ?? 0, icon: FileText, color: "green-500", sub: `${constanciasPendientes ?? 0} pendientes` },
  ];

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-1">Oficina de Deportes y Actividades Culturales — TecNM Campus Matehuala</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/20 rounded-bl-[100px] transition-transform group-hover:scale-110`} />
            <Icon className={`w-8 h-8 text-${color} mb-4 relative z-10`} />
            <h4 className="text-muted-foreground font-medium mb-1 relative z-10 text-sm">{label}</h4>
            <div className="text-3xl font-extrabold relative z-10">{value.toLocaleString("es-MX")}</div>
            <p className="text-xs text-muted-foreground mt-2 relative z-10">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Solicitudes pendientes */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">Constancias Pendientes</h3>
            {(constanciasPendientes ?? 0) > 0 && (
              <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                {constanciasPendientes} nuevas
              </span>
            )}
          </div>

          {ultimasSolicitudes && ultimasSolicitudes.length > 0 ? (
            <div className="space-y-3">
              {ultimasSolicitudes.map((c) => {
                const alumno = c.usuarios as unknown as { nombre_completo: string; numero_control: string | null } | null;
                const periodo = c.periodos as unknown as { nombre: string } | null;
                return (
                  <div key={c.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm">{alumno?.nombre_completo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.horas_totales} hrs • {periodo?.nombre} • {alumno?.numero_control}
                      </p>
                    </div>
                    <Link href="/admin/constancias"
                      className="shrink-0 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl text-xs font-bold transition-colors">
                      Revisar
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">No hay solicitudes pendientes.</p>
          )}

          <Link href="/admin/constancias"
            className="mt-4 w-full py-3 text-primary text-sm font-semibold hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center gap-2">
            Ver todas las constancias <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Accesos rápidos */}
        <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl">
          <h3 className="font-bold text-lg md:text-xl mb-4 md:mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-3">
            {[
              { href: "/admin/talleres", label: "Crear Taller", color: "bg-primary/20 text-primary" },
              { href: "/admin/periodos", label: "Gestionar Períodos", color: "bg-accent/20 text-accent" },
              { href: "/admin/encargados", label: "Nuevo Encargado", color: "bg-purple-500/20 text-purple-400" },
              { href: "/admin/alumnos", label: "Ver Alumnos", color: "bg-green-500/20 text-green-400" },
            ].map(({ href, label, color }) => (
              <Link key={href} href={href}
                className={`p-4 rounded-2xl ${color} flex items-center justify-center text-sm font-bold text-center hover:opacity-80 transition-opacity`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-border/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-bold">Resumen del Período</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalHoras.toFixed(0)} horas totales computadas entre {totalInscritos ?? 0} estudiantes activos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
