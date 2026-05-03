import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Printer } from "lucide-react";

export const metadata = { title: "Constancia de Actividad | TallerTec" };

export default async function ConstanciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: constancia } = await supabase
    .from("constancias")
    .select("*, usuarios(nombre_completo, numero_control, carrera, semestre, email), periodos(nombre, fecha_inicio, fecha_fin)")
    .eq("id", id)
    .single();

  if (!constancia) notFound();

  const isAdmin = user.user_metadata?.rol === "ADMIN_OFICINA";
  const isOwner = constancia.estudiante_id === user.id;
  if (!isAdmin && !isOwner) redirect("/dashboard");

  const alumno = constancia.usuarios as {
    nombre_completo: string;
    numero_control: string | null;
    carrera: string | null;
    semestre: number | null;
  } | null;

  const periodo = constancia.periodos as {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
  } | null;

  const fechaGeneracion = new Date(constancia.created_at).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Botones de acción (no se imprimen) */}
      <div className="no-print w-full max-w-2xl flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">Vista Previa de Constancia</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-sm"
        >
          <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Constancia imprimible */}
      <div className="print-document w-full max-w-2xl bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Encabezado institucional */}
        <div className="bg-[#003087] text-white px-10 py-8 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-80 mb-1">
            Tecnológico Nacional de México
          </p>
          <h2 className="text-xl font-extrabold tracking-tight">
            Instituto Tecnológico de Matehuala
          </h2>
          <p className="text-sm opacity-80 mt-1">Carretera 57 Km 5 — Matehuala, San Luis Potosí</p>
          <div className="mt-4 border-t border-white/30 pt-4">
            <p className="text-xs uppercase tracking-widest font-bold opacity-70">
              Oficina de Deportes y Actividades Culturales
            </p>
          </div>
        </div>

        {/* Título de constancia */}
        <div className="px-10 py-8 text-center border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-[#003087] uppercase tracking-wide">
            Constancia de Actividad Extracurricular
          </h1>
          {constancia.folio && (
            <p className="text-sm text-gray-500 mt-2 font-mono">Folio: {constancia.folio}</p>
          )}
        </div>

        {/* Cuerpo */}
        <div className="px-10 py-8 space-y-6 text-sm leading-relaxed">
          <p className="text-gray-700 text-base">
            La Oficina de Deportes y Actividades Culturales del Instituto Tecnológico de Matehuala hace
            constar que:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Nombre Completo</p>
                <p className="font-bold text-gray-900">{alumno?.nombre_completo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">No. de Control</p>
                <p className="font-bold text-gray-900 font-mono">{alumno?.numero_control ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Carrera</p>
                <p className="font-bold text-gray-900">{alumno?.carrera ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Semestre</p>
                <p className="font-bold text-gray-900">{alumno?.semestre ? `${alumno.semestre}°` : "—"}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-700">
            Ha cumplido satisfactoriamente con{" "}
            <strong className="text-[#003087] text-lg">{constancia.horas_totales} horas</strong> de actividad
            extracurricular durante el período <strong>{periodo?.nombre}</strong>
            {periodo?.fecha_inicio && periodo?.fecha_fin && (
              <span> ({new Date(periodo.fecha_inicio).toLocaleDateString("es-MX")} al {new Date(periodo.fecha_fin).toLocaleDateString("es-MX")})</span>
            )}, cumpliendo con el requisito establecido por el plan de estudios institucional.
          </p>

          <p className="text-gray-500 text-xs">
            Esta constancia se expide el día <strong>{fechaGeneracion}</strong> a petición del interesado,
            para los fines que estime convenientes.
          </p>
        </div>

        {/* Sección de firmas */}
        <div className="px-10 py-10 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-10">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-3 mt-12">
                <p className="font-semibold text-sm text-gray-800">Jefe de Deportes</p>
                <p className="text-xs text-gray-500 mt-0.5">Oficina de Deportes y Actividades Culturales</p>
                <p className="text-xs text-gray-400 mt-0.5">TecNM Campus Matehuala</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-3 mt-12">
                <p className="font-semibold text-sm text-gray-800">Director del Plantel</p>
                <p className="text-xs text-gray-500 mt-0.5">Instituto Tecnológico de Matehuala</p>
                <p className="text-xs text-gray-400 mt-0.5">TecNM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de constancia */}
        <div className="bg-gray-50 px-10 py-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Documento generado digitalmente por TallerTec • matehuala.tecnm.mx •{" "}
            Verifica la autenticidad con el folio {constancia.folio ?? "pendiente"}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-document {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
