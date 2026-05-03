import { CalendarPlus, BookOpen, Trash2, Edit2 } from "lucide-react";

export const metadata = {
  title: "Gestión de Talleres | Admin TallerTec",
};

export default function TalleresPage() {
  const talleres = [
    { id: 1, nombre: "Fútbol Varonil", encargado: "Prof. Roberto Carlos", horario: "Lunes y Miércoles 16:00 - 18:00", cupo: "25/30", estado: "Activo" },
    { id: 2, nombre: "Voleibol Femenil", encargado: "Lic. María Fernanda", horario: "Martes y Jueves 14:00 - 16:00", cupo: "20/20", estado: "Lleno" },
    { id: 3, nombre: "Ajedrez", encargado: "Sin Asignar", horario: "Viernes 14:00 - 17:00", cupo: "0/15", estado: "Inactivo" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Catálogo de Talleres</h1>
          <p className="text-muted-foreground mt-2">
            Crea nuevos talleres, edita sus horarios y gestiona los cupos disponibles.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <CalendarPlus className="w-5 h-5" />
          Nuevo Taller
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {talleres.map((taller) => (
          <div key={taller.id} className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] transition-transform group-hover:scale-110 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                taller.estado === 'Activo' ? 'bg-green-500/20 text-green-500' :
                taller.estado === 'Lleno' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {taller.estado}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-1">{taller.nombre}</h3>
            <p className="text-sm text-muted-foreground mb-4">{taller.horario}</p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Responsable:</span>
                <span className="font-medium text-foreground text-right">{taller.encargado}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cupo:</span>
                <span className="font-bold text-accent">{taller.cupo}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/50">
              <button className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button className="py-2 px-3 rounded-xl hover:bg-red-500/20 text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
