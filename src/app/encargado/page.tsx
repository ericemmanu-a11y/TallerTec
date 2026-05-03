import { QrCode, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mis Talleres | Encargado TallerTec",
};

export default function EncargadoPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Talleres Asignados</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Gestiona la asistencia y supervisa el progreso de tus alumnos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-xl">Fútbol Varonil</h3>
            <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold">Activo</span>
          </div>

          <div className="space-y-4 mb-8 relative z-10">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 text-accent" />
              <span>Lunes y Miércoles 16:00 - 18:00</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5 text-accent" />
              <span>25 Alumnos Inscritos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <Link 
              href="/encargado/scan" 
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-accent hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
            >
              <QrCode className="w-4 h-4" />
              Escanear Asistencia
            </Link>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-colors border border-border/50">
              Ver Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
