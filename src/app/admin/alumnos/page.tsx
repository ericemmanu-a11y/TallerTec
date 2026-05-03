import { Users, Search, Download, CheckCircle2, Clock } from "lucide-react";

export const metadata = {
  title: "Registros de Alumnos | Admin TallerTec",
};

export default function AlumnosPage() {
  const alumnos = [
    { id: "L20230001", nombre: "Ana González", carrera: "Ing. Sistemas", taller: "Voleibol Femenil", horas: 20.0, completado: true },
    { id: "L20230002", nombre: "Carlos Martínez", carrera: "Ing. Industrial", taller: "Fútbol Varonil", horas: 14.5, completado: false },
    { id: "L20230003", nombre: "Sofía Ramírez", carrera: "Lic. Administración", taller: "Ajedrez", horas: 8.0, completado: false },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Registro de Alumnos</h1>
          <p className="text-muted-foreground mt-2">
            Vista global de estudiantes inscritos, progreso de horas y estado por taller.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-all border border-border/50">
          <Download className="w-5 h-5" />
          Exportar Excel
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Alumnos Inscritos
          </h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="glass-input w-full md:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
              placeholder="Buscar por nombre o control..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">No. Control</th>
                <th className="px-6 py-4 font-medium">Nombre / Carrera</th>
                <th className="px-6 py-4 font-medium">Taller Actual</th>
                <th className="px-6 py-4 font-medium text-center">Horas Acumuladas</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {alumnos.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">
                    {alumno.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{alumno.nombre}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{alumno.carrera}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {alumno.taller}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-primary">{alumno.horas}</span> / 20
                  </td>
                  <td className="px-6 py-4 text-center">
                    {alumno.completado ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">
                        <CheckCircle2 className="w-3 h-3" /> Completado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500">
                        <Clock className="w-3 h-3" /> En curso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
