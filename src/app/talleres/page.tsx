import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, BookOpen, Trophy, Music } from "lucide-react";

export const metadata = {
  title: "Catálogo de Talleres | TallerTec",
  description: "Explora e inscríbete a los talleres deportivos y culturales del TecNM Campus Matehuala",
};

export default async function TalleresPage() {
  const supabase = await createClient();

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    // Fallback - no admin client available
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error de Configuración</h1>
          <p className="text-muted-foreground">El sistema no está configurado correctamente.</p>
        </div>
      </div>
    );
  }

  const { data: dbTalleres } = await adminClient
    .from("talleres")
    .select("*, periodos(nombre, inscripciones_abiertas)")
    .eq("activo", true)
    .order("categoria");

  const { data: { user } } = await supabase.auth.getUser();

  let inscritosIds: string[] = [];
  if (user) {
    const { data: mis } = await adminClient
      .from("inscripciones")
      .select("taller_id")
      .eq("estudiante_id", user.id)
      .eq("estado", "ACTIVA");
    inscritosIds = mis?.map((i) => i.taller_id) ?? [];
  }

  const talleres = dbTalleres ?? [];
  const deportivos = talleres.filter((t) => t.categoria === "DEPORTIVO");
  const culturales = talleres.filter((t) => t.categoria === "CULTURAL");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">T</div>
            <span className="font-bold text-lg tracking-tight">TallerTec</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Mi Panel</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:p-6 space-y-10 animate-fade-in pb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catálogo de Talleres</h1>
          <p className="text-muted-foreground mt-2">
            Talleres deportivos y culturales del período vigente — TecNM Campus Matehuala.
          </p>
        </div>

        {/* Deportivos */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Talleres Deportivos</h2>
              <p className="text-sm text-muted-foreground">{deportivos.length} opciones disponibles</p>
            </div>
          </div>
          <TallerGrid talleres={deportivos} inscritosIds={inscritosIds} />
        </section>

        {/* Culturales */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Talleres Culturales</h2>
              <p className="text-sm text-muted-foreground">{culturales.length} opciones disponibles</p>
            </div>
          </div>
          <TallerGrid talleres={culturales} inscritosIds={inscritosIds} />
        </section>
      </main>
    </div>
  );
}

type Taller = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  categoria: string;
  horario_texto: string;
  ubicacion: string;
  cupo_maximo: number;
  cupo_disponible: number;
};

function TallerGrid({ talleres, inscritosIds }: { talleres: Taller[]; inscritosIds: string[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {talleres.map((taller) => {
        const isFull = taller.cupo_disponible === 0;
        const isLow = taller.cupo_disponible > 0 && taller.cupo_disponible <= 5;
        const yaInscrito = inscritosIds.includes(taller.id);

        return (
          <div key={taller.id}
            className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
            <div className={`h-1.5 w-full ${taller.categoria === "DEPORTIVO" ? "bg-primary" : "bg-accent"}`} />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${taller.categoria === "DEPORTIVO" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  {taller.categoria === "DEPORTIVO" ? "Deportivo" : "Cultural"}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isFull ? "bg-destructive/20 text-destructive" : isLow ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-400"}`}>
                  {isFull ? "Agotado" : `${taller.cupo_disponible} lugares`}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-1">{taller.nombre}</h3>
              {taller.descripcion && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{taller.descripcion}</p>
              )}

              <div className="space-y-2.5 mt-auto pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0 text-primary" />
                  <span>{taller.horario_texto}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 text-primary" />
                  <span>{taller.ubicacion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 shrink-0 text-primary" />
                  <span>Cupo máximo: {taller.cupo_maximo}</span>
                </div>
              </div>

              {yaInscrito ? (
                <div className="mt-4 w-full py-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-semibold text-center">
                  ✓ Ya estás inscrito
                </div>
              ) : (
                <Link href={isFull ? "#" : `/talleres/${taller.id}/inscribir`}
                  className={`mt-4 w-full py-3 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${isFull ? "bg-white/5 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {isFull ? "Cupo Lleno" : <><span>Inscribirme</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
