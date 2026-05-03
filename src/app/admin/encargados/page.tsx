import { UserPlus, UserCog, MoreVertical, Trash2, Edit2 } from "lucide-react";

export const metadata = {
  title: "Gestión de Encargados | Admin TallerTec",
};

export default function EncargadosPage() {
  // Datos mock para demostración de UI
  const encargados = [
    { id: 1, nombre: "Prof. Roberto Carlos", taller: "Fútbol Varonil", usuario: "encargado_futbol", activo: true },
    { id: 2, nombre: "Lic. María Fernanda", taller: "Voleibol Femenil", usuario: "encargado_volei", activo: true },
    { id: 3, nombre: "Ing. Arturo Méndez", taller: "Ajedrez", usuario: "encargado_ajedrez", activo: false },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Responsables de Taller</h1>
          <p className="text-muted-foreground mt-2">
            Administra los usuarios encargados, asigna contraseñas genéricas y controla su acceso.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <UserPlus className="w-5 h-5" />
          Nuevo Encargado
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Lista de Responsables
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre Completo</th>
                <th className="px-6 py-4 font-medium">Taller Asignado</th>
                <th className="px-6 py-4 font-medium">Usuario / Email</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {encargados.map((encargado) => (
                <tr key={encargado.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {encargado.nombre}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {encargado.taller}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-primary">
                    {encargado.usuario}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      encargado.activo 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {encargado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors inline-block mr-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors inline-block">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
