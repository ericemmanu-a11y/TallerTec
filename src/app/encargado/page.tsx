import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QrCode, Users, Clock, BarChart2, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis Talleres | Encargado TallerTec" };

export default async function EncargadoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error de Configuración</h1>
          <p className="text-muted-foreground">El sistema no está configurado correctamente.</p>
        </div>
      </div>
    );
  }

  // Get user data from usuarios table
  const { data: userData } = await adminClient
    .from("usuarios")
    .select("nombre_completo")
    .eq("id", user.id)
    .single();

  const nombre = userData?.nombre_completo ?? user.user_metadata?.nombre_completo ?? user.email;

  const { data: talleres } = await adminClient
    .from("talleres")
    .select("id, nombre, horario_texto, ubicacion, categoria, cupo_maximo, cupo_disponible, periodos(nombre)")
    .eq("responsable_id", user.id)
    .eq("activo", true);

  const talleresConStats = await Promise.all(
    (talleres ?? []).map(async (t) => {
      const { count: inscritos } = await adminClient
        .from("inscripciones")
        .select("id", { count: "exact", head: true })
        .eq("taller_id", t.id)
        .eq("estado", "ACTIVA");

      const hoy = new Date().toISOString().split("T")[0];
      const { count: asistenciaHoy } = await adminClient
        .from("asistencias")
        .select("id", { count: "exact", head: true })
        .eq("fecha", hoy)
        .in("inscripcion_id",
          (await adminClient.from("inscripciones").select("id").eq("taller_id", t.id).eq("estado", "ACTIVA")).data?.map(i => i.id) ?? []
        );

      return { ...t, inscritos: inscritos ?? 0, asistenciaHoy: asistenciaHoy ?? 0 };
    })
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Talleres Asignados</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Bienvenido, <span className="text-foreground font-medium">{nombre.split(" ")[0]}</span>. Gestiona la asistencia de tus alumnos.
        </p>
      </div>

      {talleresConStats.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center">
          <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Sin talleres asignados</h3>
          <p className="text-muted-foreground">Contacta al administrador para que te asigne un taller.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {talleresConStats.map((taller) => {
            const periodo = taller.periodos as unknown as { nombre: string } | null;
            return (
              <div key={taller.id} className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110 ${taller.categoria === "DEPORTIVO" ? "bg-primary/10" : "bg-accent/10"}`} />

                <div className="flex items-center justify-between mb-2 relative z-10">
                  <h3 className="font-bold text-xl">{taller.nombre}</h3>
                  <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
                </div>
                {periodo && <p className="text-xs text-muted-foreground mb-4 relative z-10">{periodo.nombre}</p>}

                <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-extrabold text-primary">{taller.inscritos}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Inscritos</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-extrabold text-accent">{taller.asistenciaHoy}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Hoy</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-2xl font-extrabold text-foreground">{taller.cupo_maximo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cupo máx</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 relative z-10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-accent" />{taller.horario_texto}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart2 className="w-4 h-4 text-accent" />{taller.ubicacion}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                  <Link href={`/encargado/scan?taller=${taller.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
                    <QrCode className="w-4 h-4" /> Escanear Asistencia
                  </Link>
                  <Link href={`/encargado/alumnos?taller=${taller.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-colors border border-border/50">
                    <Users className="w-4 h-4" /> Ver Lista
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
