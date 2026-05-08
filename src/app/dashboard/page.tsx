import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Award, BookOpen, Bell, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const metadata = {
  title: "Mi Panel | TallerTec",
};

export default async function DashboardPage() {
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
  let { data: userData } = await adminClient
    .from("usuarios")
    .select("nombre_completo")
    .eq("id", user.id)
    .single();

  // Auto-sync: If user doesn't exist in usuarios table, create them
  if (!userData) {
    const { error: syncError } = await adminClient.from("usuarios").insert({
      id: user.id,
      email: user.email,
      nombre_completo: user.user_metadata?.nombre_completo || user.email,
      numero_control: user.user_metadata?.numero_control || null,
      carrera: user.user_metadata?.carrera || null,
      semestre: user.user_metadata?.semestre || null,
      telefono: user.user_metadata?.telefono || null,
      rol: user.user_metadata?.rol || "ESTUDIANTE",
    });

    if (!syncError) {
      // Refetch user data after sync
      const { data: newUserData } = await adminClient
        .from("usuarios")
        .select("nombre_completo")
        .eq("id", user.id)
        .single();
      userData = newUserData;
    }
  }

  const nombre = userData?.nombre_completo ?? user.user_metadata?.nombre_completo ?? user.email;
  const qrData = `tallertec:${user.id}`;

  const { data: inscripciones } = await adminClient
    .from("inscripciones")
    .select("id, estado, horas_acumuladas, talleres(id, nombre, horario_texto, categoria, ubicacion)")
    .eq("estudiante_id", user.id)
    .eq("estado", "ACTIVA");

  const { data: completadas } = await adminClient
    .from("inscripciones")
    .select("horas_acumuladas")
    .eq("estudiante_id", user.id)
    .eq("estado", "COMPLETADA");

  const { data: notificaciones } = await adminClient
    .from("notificaciones")
    .select("id, titulo, tipo, created_at")
    .eq("usuario_id", user.id)
    .eq("leida", false)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: constanciaActiva } = await adminClient
    .from("constancias")
    .select("id, estado, folio, horas_totales")
    .eq("estudiante_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const horasActivas = inscripciones?.reduce((acc, i) => acc + Number(i.horas_acumuladas), 0) ?? 0;
  const horasCompletadas = completadas?.reduce((acc, i) => acc + Number(i.horas_acumuladas), 0) ?? 0;
  const totalHoras = horasActivas + horasCompletadas;
  const targetHours = 20;
  const progress = Math.min((totalHoras / targetHours) * 100, 100);
  const metaAlcanzada = totalHoras >= targetHours;

  return (
    <div className="space-y-8 animate-fade-in pb-4">
      {/* Bienvenida */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Hola, {nombre.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Aquí está el resumen de tu actividad extracurricular.
        </p>
      </div>

      {/* Progreso */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-semibold text-xl mb-1">Progreso Semestral</h3>
            <p className="text-muted-foreground">Meta de 20 horas para constancia de actividad.</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className="text-5xl font-extrabold">{totalHoras.toFixed(1)}</span>
            <span className="text-xl text-muted-foreground font-medium"> / {targetHours} hrs</span>
          </div>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden relative z-10">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${metaAlcanzada ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {metaAlcanzada && (
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl relative z-10">
            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-green-500 font-bold">¡Meta Alcanzada!</p>
              <p className="text-green-500/80 text-sm">Ya puedes solicitar tu constancia oficial.</p>
            </div>
            {!constanciaActiva ? (
              <Link href="/dashboard/constancias"
                className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-400 transition-colors shrink-0">
                Solicitar Constancia
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-muted-foreground shrink-0">
                {constanciaActiva.estado === "PENDIENTE" ? "Solicitud enviada" :
                 constanciaActiva.estado === "APROBADA" ? "Constancia aprobada ✓" :
                 constanciaActiva.estado === "ENTREGADA" ? `Folio: ${constanciaActiva.folio}` :
                 "Solicitud rechazada"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mis Talleres */}
        <div className="glass-card p-6 rounded-3xl flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Mis Talleres Activos
            </h3>
          </div>
          {inscripciones && inscripciones.length > 0 ? (
            <div className="flex-1 space-y-3">
              {inscripciones.map((ins) => {
                const taller = ins.talleres as unknown as { id: string; nombre: string; horario_texto: string; categoria: string };
                const pct = Math.min((Number(ins.horas_acumuladas) / targetHours) * 100, 100);
                return (
                  <div key={ins.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">{taller?.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{taller?.horario_texto}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">{Number(ins.horas_acumuladas).toFixed(1)} hrs</p>
                        <p className="text-xs text-muted-foreground">Acumuladas</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Aún no estás inscrito en ningún taller.</p>
            </div>
          )}
          <Link href="/talleres"
            className="mt-5 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors">
            Explorar Catálogo <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* QR Personal */}
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
          <QrCode className="w-5 h-5 text-accent mb-1" />
          <h3 className="font-semibold text-lg mb-1">Mi Código QR</h3>
          <p className="text-muted-foreground text-xs mb-4">Muéstralo en cada sesión</p>
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-white/5 mb-3">
            <QRCodeSVG value={qrData} size={140} level="H" includeMargin />
          </div>
          <p className="text-xs text-muted-foreground font-mono bg-black/20 px-2 py-1.5 rounded-lg w-full truncate">
            {user.user_metadata?.numero_control ?? user.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Notificaciones recientes */}
      {notificaciones && notificaciones.length > 0 && (
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Notificaciones
              <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs font-bold">{notificaciones.length}</span>
            </h3>
            <Link href="/dashboard/notificaciones" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {notificaciones.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0" />
                <p className="text-sm font-medium">{n.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/talleres", label: "Explorar Talleres", icon: BookOpen, color: "primary" },
          { href: "/dashboard/constancias", label: "Mis Constancias", icon: Award, color: "accent" },
          { href: "/scan", label: "Ver mi QR", icon: QrCode, color: "purple-500" },
          { href: "/dashboard/notificaciones", label: "Notificaciones", icon: Bell, color: "green-500" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors group">
            <div className={`w-10 h-10 bg-${color}/20 text-${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
