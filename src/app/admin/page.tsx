import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Users, FileText, CheckSquare, Download, Clock } from "lucide-react";

export const metadata = {
  title: "Administración | TallerTec",
  description: "Panel de administración de TallerTec",
};

export default async function AdminPage() {
  // En un entorno real, verificaríamos que el usuario sea ADMIN_OFICINA
  // const supabase = await createClient();
  // ...

  return (
      <main className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Oficina de Deportes</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gestión global del programa de actividades extracurriculares.
          </p>
        </div>

        {/* Global Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-bl-[100px] transition-transform group-hover:scale-110" />
            <Users className="w-8 h-8 text-primary mb-4 relative z-10" />
            <h4 className="text-muted-foreground font-medium mb-1 relative z-10">Total Inscritos</h4>
            <div className="text-3xl font-extrabold relative z-10">1,248</div>
            <p className="text-xs text-green-500 font-bold mt-2 relative z-10">+12% este semestre</p>
          </div>

          <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-bl-[100px] transition-transform group-hover:scale-110" />
            <CheckSquare className="w-8 h-8 text-accent mb-4 relative z-10" />
            <h4 className="text-muted-foreground font-medium mb-1 relative z-10">Talleres Activos</h4>
            <div className="text-3xl font-extrabold relative z-10">18</div>
            <p className="text-xs text-muted-foreground mt-2 relative z-10">En 3 ubicaciones</p>
          </div>

          <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-bl-[100px] transition-transform group-hover:scale-110" />
            <Clock className="w-8 h-8 text-purple-500 mb-4 relative z-10" />
            <h4 className="text-muted-foreground font-medium mb-1 relative z-10">Horas Computadas</h4>
            <div className="text-3xl font-extrabold relative z-10">8,540</div>
            <p className="text-xs text-muted-foreground mt-2 relative z-10">Promedio: 6.8 / est.</p>
          </div>

          <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-bl-[100px] transition-transform group-hover:scale-110" />
            <FileText className="w-8 h-8 text-green-500 mb-4 relative z-10" />
            <h4 className="text-muted-foreground font-medium mb-1 relative z-10">Constancias</h4>
            <div className="text-3xl font-extrabold relative z-10">45</div>
            <p className="text-xs text-yellow-500 font-bold mt-2 relative z-10">12 solicitudes pendientes</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Constancias Pendientes */}
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Constancias Pendientes</h3>
              <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">12 nuevas</span>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">Ana González (L12345679)</p>
                    <p className="text-xs text-muted-foreground mt-1">20.0 horas - Voleibol Femenil</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-xl text-xs font-bold transition-colors">
                      Aprobar
                    </button>
                    <button className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl text-xs font-bold transition-colors">
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-3 text-primary text-sm font-semibold hover:bg-primary/10 rounded-xl transition-colors">
              Ver todas las solicitudes
            </button>
          </div>

          {/* Exportación y Reportes */}
          <div className="glass-card p-6 md:p-8 rounded-3xl">
            <h3 className="font-bold text-xl mb-6">Reportes y Exportación</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-border flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Reporte Global de Asistencia</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Formato Excel (.xlsx)</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="p-4 rounded-2xl border border-border flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Listas por Taller</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Formato PDF / Excel</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
