import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Bell, Trophy, ClipboardCheck, Award, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { marcarNotificacionLeida } from "@/app/actions/usuarios";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Notificaciones | TallerTec" };

const TIPO_CONFIG = {
  INSCRIPCION: { icon: ClipboardCheck, color: "text-primary bg-primary/10" },
  ASISTENCIA: { icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
  CONSTANCIA_SOLICITUD: { icon: Award, color: "text-yellow-500 bg-yellow-500/10" },
  CONSTANCIA_LISTA: { icon: Award, color: "text-purple-500 bg-purple-500/10" },
  CONSTANCIA_RECHAZADA: { icon: AlertCircle, color: "text-red-500 bg-red-500/10" },
  META_20H: { icon: Trophy, color: "text-accent bg-accent/10" },
};

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const { data: notificaciones } = await adminClient
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  async function handleMarcarTodas() {
    "use server";
    const sb = await createClient();
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) return;
    try {
      const admin = createAdminClient();
      await admin.from("notificaciones").update({ leida: true }).eq("usuario_id", u.id);
    } catch (e) {
      // ignore
    }
  }

  const noLeidas = notificaciones?.filter((n) => !n.leida).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            {noLeidas > 0 ? `${noLeidas} notificaciones sin leer` : "Todo al día"}
          </p>
        </div>
        {noLeidas > 0 && (
          <form action={handleMarcarTodas}>
            <button type="submit" className="text-sm text-primary hover:underline font-medium">
              Marcar todo como leído
            </button>
          </form>
        )}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        {notificaciones && notificaciones.length > 0 ? (
          <div className="divide-y divide-border/50">
            {notificaciones.map((n) => {
              const config = TIPO_CONFIG[n.tipo as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.INSCRIPCION;
              const Icon = config.icon;
              return (
                <div key={n.id} className={`p-5 flex items-start gap-4 transition-colors hover:bg-white/5 ${!n.leida ? "bg-white/[0.02]" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm ${!n.leida ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.titulo}
                      </p>
                      {!n.leida && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.mensaje}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(n.created_at).toLocaleDateString("es-MX", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {!n.leida && (
                    <form action={async () => { "use server"; await marcarNotificacionLeida(n.id); }}>
                      <button type="submit" className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0 mt-1">
                        Leída
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay notificaciones.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Aparecerán aquí cuando haya novedades.</p>
          </div>
        )}
      </div>
    </div>
  );
}
