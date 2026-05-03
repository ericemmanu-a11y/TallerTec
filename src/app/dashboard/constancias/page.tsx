import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle2, Clock, XCircle, AlertCircle, FileText } from "lucide-react";
import { solicitarConstancia } from "@/app/actions/constancias";
import { redirect } from "next/navigation";

export const metadata = { title: "Mis Constancias | TallerTec" };

const ESTADO_CONFIG = {
  PENDIENTE: { label: "En revisión", icon: Clock, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  APROBADA: { label: "Aprobada", icon: CheckCircle2, color: "text-green-500 bg-green-500/10 border-green-500/20" },
  RECHAZADA: { label: "Rechazada", icon: XCircle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  GENERADA: { label: "Generada", icon: FileText, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  ENTREGADA: { label: "Entregada", icon: Award, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
};

export default async function ConstanciasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: constancias } = await supabase
    .from("constancias")
    .select("*, periodos(nombre)")
    .eq("estudiante_id", user.id)
    .order("created_at", { ascending: false });

  const { data: inscActivas } = await supabase
    .from("inscripciones")
    .select("horas_acumuladas")
    .eq("estudiante_id", user.id)
    .eq("estado", "ACTIVA");

  const { data: inscCompletadas } = await supabase
    .from("inscripciones")
    .select("horas_acumuladas")
    .eq("estudiante_id", user.id)
    .eq("estado", "COMPLETADA");

  const totalHoras =
    (inscActivas?.reduce((a, i) => a + Number(i.horas_acumuladas), 0) ?? 0) +
    (inscCompletadas?.reduce((a, i) => a + Number(i.horas_acumuladas), 0) ?? 0);

  const metaAlcanzada = totalHoras >= 20;

  const { data: periodoActivo } = await supabase
    .from("periodos")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const yaHaySolicitud = constancias?.some(
    (c) => c.periodo_id === periodoActivo?.id && c.estado !== "RECHAZADA"
  );

  async function handleSolicitar() {
    "use server";
    if (!periodoActivo) return;
    await solicitarConstancia(periodoActivo.id);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Constancias</h1>
        <p className="text-muted-foreground mt-1">
          Solicita y descarga tus constancias de actividad extracurricular.
        </p>
      </div>

      {/* Estado general */}
      <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${metaAlcanzada ? "bg-green-500/20" : "bg-white/5"}`}>
          <Award className={`w-8 h-8 ${metaAlcanzada ? "text-green-500" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl">
            {metaAlcanzada ? "¡Eres elegible para constancia!" : "Aún no alcanzas la meta"}
          </h3>
          <p className="text-muted-foreground mt-1">
            Tienes <strong className="text-foreground">{totalHoras.toFixed(1)} horas</strong> acumuladas.
            {metaAlcanzada ? " Ya puedes solicitar tu constancia del período actual." : ` Necesitas ${(20 - totalHoras).toFixed(1)} horas más para llegar a 20.`}
          </p>
        </div>
        {metaAlcanzada && !yaHaySolicitud && periodoActivo && (
          <form action={handleSolicitar}>
            <button type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20 whitespace-nowrap">
              Solicitar Constancia
            </button>
          </form>
        )}
        {yaHaySolicitud && (
          <span className="bg-white/10 text-muted-foreground px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap">
            Solicitud enviada
          </span>
        )}
      </div>

      {/* Historial */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-bold text-lg">Historial de Constancias</h3>
        </div>
        {constancias && constancias.length > 0 ? (
          <div className="divide-y divide-border/50">
            {constancias.map((c) => {
              const config = ESTADO_CONFIG[c.estado as keyof typeof ESTADO_CONFIG];
              const Icon = config.icon;
              const periodo = c.periodos as { nombre: string } | null;
              return (
                <div key={c.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{periodo?.nombre ?? "Período"}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.horas_totales} horas • {new Date(c.created_at).toLocaleDateString("es-MX")}
                      </p>
                      {c.folio && <p className="text-xs font-mono text-primary mt-0.5">{c.folio}</p>}
                      {c.observaciones && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{c.observaciones}</p>
                      )}
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes constancias aún.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Acumula 20 horas para solicitar tu primera constancia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
