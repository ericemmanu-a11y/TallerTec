import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Catálogo de Talleres | TallerTec",
  description: "Explora e inscríbete a los talleres deportivos y culturales",
};

export default async function TalleresPage() {
  const supabase = await createClient();
  
  // Para el MVP, si no hay base de datos conectada o la tabla está vacía,
  // mostraremos una lista de ejemplo si fetch falla.
  const { data: talleres, error } = await supabase
    .from("talleres")
    .select("*, periodos(nombre)")
    .eq("activo", true);

  // Datos mock para visualización inicial si no hay DB
  const displayTalleres = talleres?.length ? talleres : [
    {
      id: "1",
      nombre: "Fútbol Varonil",
      categoria: "DEPORTIVO",
      horario_texto: "Lunes y Miércoles 7:00-9:00 AM",
      ubicacion: "Cancha Principal",
      cupo_maximo: 25,
      cupo_disponible: 12,
    },
    {
      id: "2",
      nombre: "Ajedrez",
      categoria: "CULTURAL",
      horario_texto: "Martes 4:00-6:00 PM",
      ubicacion: "Sala de Usos Múltiples",
      cupo_maximo: 30,
      cupo_disponible: 30,
    },
    {
      id: "3",
      nombre: "Voleibol Femenil",
      categoria: "DEPORTIVO",
      horario_texto: "Jueves y Viernes 5:00-7:00 PM",
      ubicacion: "Duela Central",
      cupo_maximo: 20,
      cupo_disponible: 2,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              T
            </div>
            <span className="font-bold text-lg tracking-tight">TallerTec</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:p-6 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catálogo de Talleres</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Explora las opciones disponibles para este período e inscríbete.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayTalleres.map((taller) => {
            const isFull = taller.cupo_disponible === 0;
            const isLow = taller.cupo_disponible > 0 && taller.cupo_disponible <= 5;
            
            return (
              <div key={taller.id} className="glass-card rounded-2xl overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className={`h-2 w-full ${taller.categoria === 'DEPORTIVO' ? 'bg-primary' : 'bg-accent'}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-foreground/80">
                      {taller.categoria}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isFull ? 'bg-destructive/20 text-destructive' : isLow ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                      {isFull ? 'Agotado' : `${taller.cupo_disponible} lugares`}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{taller.nombre}</h3>
                  
                  <div className="space-y-3 mt-4 flex-1">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{taller.horario_texto}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{taller.ubicacion}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>Cupo: {taller.cupo_maximo} máximo</span>
                    </div>
                  </div>

                  <Link
                    href={isFull ? "#" : `/talleres/${taller.id}/inscribir`}
                    className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                      isFull 
                      ? 'bg-white/5 text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isFull ? 'Cupo Lleno' : 'Inscribirme'}
                    {!isFull && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
