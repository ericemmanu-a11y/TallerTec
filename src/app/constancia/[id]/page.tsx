import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PrintButton from "@/components/ui/print-button";
import { CONFIG_DEFAULTS } from "@/lib/constancias-config";

export const metadata = { title: "Constancia de Actividad | TallerTec" };

const NIVEL_LABEL: Record<string, string> = {
  INSUFICIENTE: "insuficiente", SUFICIENTE: "suficiente",
  BUENO: "bueno", NOTABLE: "notable", EXCELENTE: "excelente",
};
const NIVEL_VALOR: Record<string, number> = {
  INSUFICIENTE: 0, SUFICIENTE: 1, BUENO: 2, NOTABLE: 3, EXCELENTE: 4,
};
const CRITERIOS = [
  "Cumple en tiempo y forma con las actividades encomendadas alcanzando los objetivos.",
  "Trabaja en equipo y se adapta a nuevas situaciones.",
  "Muestra liderazgo en las actividades encomendadas.",
  "Organiza su tiempo y trabaja de manera proactiva.",
  "Interpreta la realidad y se sensibiliza aportando soluciones a la problemática con la actividad Cultural, Deportiva y Cívica.",
  "Realiza sugerencias innovadoras para beneficio o mejora del programa en el que participa.",
  "Tiene iniciativa para ayudar en las actividades encomendadas y muestra espíritu de servicio.",
];
const NIVEL_COLS = ["Insuficiente", "Suficiente", "Bueno", "Notable", "Excelente"];

function numToMes(n: number) {
  return ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][n];
}

export default async function ConstanciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener usuario autenticado con rol verificado
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const isAdmin = user.rol === "ADMIN_OFICINA";

  // Usar admin client para obtener la constancia (bypasea RLS)
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    notFound();
  }

  const { data: c } = await adminClient
    .from("constancias")
    .select(`*, estudiante:usuarios!estudiante_id(nombre_completo, numero_control, carrera, semestre), periodos(nombre, fecha_inicio, fecha_fin), talleres(nombre, categoria)`)
    .eq("id", id)
    .single();

  if (!c) notFound();

  const isOwner = c.estudiante_id === user.id;
  if (!isAdmin && !isOwner) redirect("/dashboard");

  // Cargar configuración del período
  let cfg = { ...CONFIG_DEFAULTS };
  try {
    const adminClient = createAdminClient();
    const { data: config } = await adminClient
      .from("configuracion_constancias")
      .select("*")
      .eq("periodo_id", c.periodo_id)
      .single();

    if (config) {
      cfg = {
        destinatario_nombre: config.destinatario_nombre,
        destinatario_puesto: config.destinatario_puesto,
        firmante1_nombre: config.firmante1_nombre,
        firmante1_puesto: config.firmante1_puesto,
        firmante1_firma_url: config.firmante1_firma_url,
        firmante2_nombre: config.firmante2_nombre,
        firmante2_puesto: config.firmante2_puesto,
        firmante2_firma_url: config.firmante2_firma_url,
        valor_curricular: config.valor_curricular,
      };
    }
  } catch {
    // Si falla, usar valores por defecto
  }

  const alumno = c.estudiante as unknown as {
    nombre_completo: string; numero_control: string | null;
    carrera: string | null; semestre: number | null;
  } | null;
  const periodo = c.periodos as unknown as { nombre: string; fecha_inicio: string; fecha_fin: string } | null;
  const taller  = c.talleres  as unknown as { nombre: string; categoria: string } | null;

  const criterios: number[] = Array.isArray(c.criterios_evaluacion)
    ? (c.criterios_evaluacion as number[])
    : Array(7).fill(-1);

  const nivelKey: string  = c.nivel_desempeno ?? "";
  const nivelLabel        = NIVEL_LABEL[nivelKey] ?? "________";
  const valorNumerico     = nivelKey in NIVEL_VALOR ? NIVEL_VALOR[nivelKey] : "___";
  const hasEvaluacion     = Boolean(c.evaluado_en);

  const fechaDoc  = new Date(c.evaluado_en ?? c.created_at);
  const dia       = fechaDoc.getDate().toString().padStart(2, "0");
  const mes       = numToMes(fechaDoc.getMonth());
  const anio      = fechaDoc.getFullYear();

  const periodoLabel  = periodo?.nombre ?? "_________________________";
  const tallerNombre  = taller?.nombre  ?? "_________________________";
  const tallerCat     = taller?.categoria === "CULTURAL" ? "cultural" : "deportiva";

  const backHref = isAdmin ? "/admin/constancias" : "/dashboard/constancias";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 py-8">

      {/* ── Action bar ── */}
      <div className="no-print w-full max-w-3xl flex items-center justify-between mb-6">
        <Link href={backHref}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {!hasEvaluacion && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /> Pendiente de evaluación — rúbrica en blanco
            </span>
          )}
          <PrintButton label="Imprimir / Guardar PDF" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HOJA 1 — CARTA OFICIAL
      ══════════════════════════════════════════════════════════ */}
      <article className="print-page w-full max-w-3xl bg-white text-gray-900 shadow-2xl rounded-2xl overflow-hidden mb-8 print:mb-0 print:shadow-none print:rounded-none">

        {/* Encabezado institucional */}
        <header className="flex flex-col md:flex-row items-center gap-3 md:gap-4 px-4 md:px-10 py-4 md:py-5 border-b-[3px] border-[#003087]">
          <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-[#003087] rounded-lg flex flex-col items-center justify-center shrink-0 text-center">
            <p className="text-[6px] md:text-[7px] font-black text-[#003087] leading-tight uppercase">TecNM</p>
            <p className="text-[6px] md:text-[7px] font-bold text-[#003087] leading-tight">Campus</p>
            <p className="text-[7px] md:text-[8px] font-black text-[#003087] leading-tight uppercase">Matehuala</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-widest uppercase">Tecnológico Nacional de México</p>
            <h2 className="text-[14px] md:text-[17px] font-extrabold text-[#003087] leading-tight mt-0.5">
              Instituto Tecnológico de Matehuala
            </h2>
            <p className="text-[10px] md:text-[11px] text-gray-500 mt-0.5">Subdirección de Planeación y Vinculación</p>
          </div>
          <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-[#003087] rounded-lg flex flex-col items-center justify-center shrink-0 text-center">
            <p className="text-[6px] md:text-[7px] font-bold text-[#003087] leading-tight">Verificado</p>
            <p className="text-[6px] md:text-[7px] font-black text-[#003087] leading-tight">TallerTec</p>
            <p className="text-[6px] md:text-[7px] font-bold text-[#003087] leading-tight">{c.folio ?? ""}</p>
          </div>
        </header>

        {/* Título del documento */}
        <div className="px-4 md:px-10 pt-4 md:pt-5 pb-2 text-center">
          <h1 className="text-[12px] md:text-[13px] font-extrabold text-[#003087] uppercase tracking-wider leading-snug">
            Constancia de Cumplimiento de Actividad<br/>Cultural, Deportiva y Cívica
          </h1>
        </div>

        {/* Destinatario - DINÁMICO */}
        <div className="px-4 md:px-10 pt-4 pb-2">
          <p className="text-[11px] md:text-[12px] font-bold text-gray-800 uppercase leading-snug">
            {cfg.destinatario_nombre}
          </p>
          <p className="text-[10px] md:text-[11px] text-gray-600">{cfg.destinatario_puesto}</p>
          <p className="text-[10px] md:text-[11px] text-gray-500 mt-1 font-semibold">Presente</p>
        </div>

        {/* Cuerpo de la carta - DINÁMICO */}
        <div className="px-4 md:px-10 py-4 space-y-4 text-[11px] md:text-[12px] text-gray-800 leading-relaxed text-justify">
          <p>
            El que suscribe <span className="font-bold">{cfg.firmante1_nombre}</span>, por este
            medio se permite hacer de su conocimiento que al estudiante{" "}
            <span className="font-extrabold text-[#003087] uppercase">
              {alumno?.nombre_completo ?? "___________________________"}
            </span>
            ., con número de control{" "}
            <span className="font-bold font-mono">{alumno?.numero_control ?? "__________"}</span>{" "}
            de la carrera de{" "}
            <span className="font-bold">{alumno?.carrera ?? "_________________________"}</span>,
            {" "}ha cumplido su actividad {tallerCat} (Taller de{" "}
            <span className="font-bold uppercase">{tallerNombre}</span>) con el nivel de desempeño{" "}
            <span className="font-bold">{nivelLabel}</span> y un valor numérico de{" "}
            <span className="font-extrabold text-[#003087]">{valorNumerico}</span>{" "}
            durante el periodo escolar{" "}
            <span className="font-bold">{periodoLabel}</span> con un valor curricular de{" "}
            <span className="font-bold">{cfg.valor_curricular}</span>.
          </p>

          <p>
            Se extiende la presente en la ciudad de Matehuala a los{" "}
            <span className="font-bold">{dia}</span> días del mes de{" "}
            <span className="font-bold">{mes}</span> de{" "}
            <span className="font-bold">{anio}</span>.
          </p>
        </div>

        <p className="px-4 md:px-10 text-right text-[11px] md:text-[12px] font-bold text-gray-800">ATENTAMENTE</p>

        {/* Firmas hoja 1 - DINÁMICO */}
        <div className="px-4 md:px-10 pb-10 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-8 md:mt-12">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">Vo. Bo.</p>
              {cfg.firmante1_firma_url && (
                <img
                  src={cfg.firmante1_firma_url}
                  alt="Firma"
                  className="h-12 mx-auto mb-1 print:h-10 object-contain"
                />
              )}
              <div className={`border-t border-gray-400 pt-2 ${cfg.firmante1_firma_url ? 'mt-1' : 'mt-6 md:mt-10'}`}>
                <p className="text-[11px] font-bold text-gray-800">{cfg.firmante1_nombre}.</p>
                <p className="text-[10px] text-gray-500">{cfg.firmante1_puesto}</p>
              </div>
            </div>
            <div className="text-center">
              {cfg.firmante2_firma_url && (
                <img
                  src={cfg.firmante2_firma_url}
                  alt="Firma"
                  className="h-12 mx-auto mb-1 print:h-10 object-contain mt-4"
                />
              )}
              <div className={`border-t border-gray-400 pt-2 ${cfg.firmante2_firma_url ? 'mt-1' : 'mt-6 md:mt-[52px]'}`}>
                <p className="text-[11px] font-bold text-gray-800">{cfg.firmante2_nombre}.</p>
                <p className="text-[10px] text-gray-500">{cfg.firmante2_puesto}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ══════════════════════════════════════════════════════════
          HOJA 2 — RÚBRICA DE EVALUACIÓN
      ══════════════════════════════════════════════════════════ */}
      <article className="print-page w-full max-w-3xl bg-white text-gray-900 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

        {/* Encabezado institucional */}
        <header className="flex flex-col md:flex-row items-center gap-3 md:gap-4 px-4 md:px-10 py-3 md:py-4 border-b-[3px] border-[#003087]">
          <div className="w-12 h-12 md:w-14 md:h-14 border-2 border-[#003087] rounded-lg flex flex-col items-center justify-center shrink-0 text-center">
            <p className="text-[6px] md:text-[7px] font-black text-[#003087] leading-tight uppercase">TecNM</p>
            <p className="text-[6px] md:text-[7px] font-bold text-[#003087] leading-tight">Matehuala</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-widest uppercase">Tecnológico Nacional de México</p>
            <h2 className="text-[13px] md:text-[15px] font-extrabold text-[#003087] leading-tight mt-0.5">
              Instituto Tecnológico de Matehuala
            </h2>
            <p className="text-[9px] md:text-[10px] text-gray-500">Subdirección de Planeación y Vinculación</p>
            <p className="text-[9px] md:text-[10px] text-gray-500">Departamento de Actividades Extraescolares</p>
            <p className="text-[9px] md:text-[10px] font-semibold text-gray-600">Oficina de Promoción Cultural, Deportiva y Cívica</p>
          </div>
        </header>

        {/* Datos del estudiante */}
        <div className="px-4 md:px-8 py-3 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-[11px]">
          <div className="md:col-span-2">
            <span className="text-gray-500 font-semibold">Nombre del estudiante: </span>
            <span className="font-bold border-b border-gray-400 inline-block w-full md:w-auto md:min-w-[200px] pb-0.5">
              {alumno?.nombre_completo ?? ""}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-semibold">Actividad: </span>
            <span className="font-bold border-b border-gray-400 inline-block pb-0.5 capitalize">
              {tallerCat}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500 font-semibold">Periodo de realización: </span>
            <span className="font-bold border-b border-gray-400 inline-block w-full md:w-auto md:min-w-[160px] pb-0.5">
              {periodoLabel}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-semibold">Nivel de desempeño del criterio </span>
            <span className="font-extrabold text-[#003087]">({valorNumerico})</span>
          </div>
        </div>

        {/* Tabla de criterios */}
        <div className="px-2 md:px-6 py-4 overflow-x-auto">
          <table className="w-full text-[10px] md:text-[11px] border-collapse border border-gray-400 min-w-[600px]">
            <thead>
              <tr>
                <th className="border border-gray-400 bg-[#003087] text-white px-1 md:px-2 py-2 w-8 text-center">No.</th>
                <th className="border border-gray-400 bg-[#003087] text-white px-2 md:px-3 py-2 text-left">Criterios a evaluar</th>
                {NIVEL_COLS.map((n) => (
                  <th key={n} className="border border-gray-400 bg-[#003087] text-white px-1 py-2 text-center w-16 md:w-20 leading-tight text-[9px] md:text-[11px]">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIOS.map((criterio, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-2 py-2 text-center font-extrabold text-[#003087]">{i + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 leading-snug">{criterio}</td>
                  {[0, 1, 2, 3, 4].map((val) => (
                    <td key={val} className="border border-gray-300 px-2 py-2 text-center text-sm">
                      {hasEvaluacion && criterios[i] === val
                        ? <strong className="text-[#003087] text-base">X</strong>
                        : <span className="text-gray-300 text-xs">○</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observaciones */}
        <div className="px-4 md:px-8 py-2 border-t border-gray-200">
          <p className="text-[11px] text-gray-700">
            <span className="font-semibold">Observaciones: </span>
            <span className="border-b border-gray-400 inline-block w-full md:w-auto md:min-w-[380px] pb-0.5 md:ml-1 align-bottom">
              {c.observaciones ?? ""}
            </span>
          </p>
        </div>

        {/* Resumen */}
        <div className="px-4 md:px-8 py-3 border-t border-gray-200 flex flex-wrap gap-4 md:gap-6 text-[10px] md:text-[11px]">
          <p>
            <span className="font-semibold">Valor numérico de la actividad {tallerCat}: </span>
            <strong className="text-[#003087] text-sm">{valorNumerico}</strong>
          </p>
          <p>
            <span className="font-semibold">Nivel de desempeño alcanzado de la actividad {tallerCat}: </span>
            <strong className="text-[#003087]">{nivelLabel}.</strong>
          </p>
        </div>

        {/* Fecha y firmas hoja 2 - DINÁMICO */}
        <div className="px-4 md:px-8 pt-1 pb-2">
          <p className="text-[10px] md:text-[11px] text-gray-700">
            Lugar y fecha: Matehuala S.L.P. a los <strong>{dia}</strong> días del mes de{" "}
            <strong>{mes}</strong> de <strong>{anio}</strong>.
          </p>
        </div>
        <div className="px-4 md:px-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-6 md:mt-8">
            <div className="text-center">
              {cfg.firmante1_firma_url && (
                <img
                  src={cfg.firmante1_firma_url}
                  alt="Firma"
                  className="h-12 mx-auto mb-1 print:h-10 object-contain"
                />
              )}
              <div className={`border-t border-gray-400 pt-2 ${cfg.firmante1_firma_url ? 'mt-1' : 'mt-8 md:mt-12'}`}>
                <p className="text-[11px] font-bold text-gray-800">{cfg.firmante1_nombre}.</p>
                <p className="text-[10px] text-gray-500">{cfg.firmante1_puesto}</p>
              </div>
            </div>
            <div className="text-center">
              {cfg.firmante2_firma_url && (
                <img
                  src={cfg.firmante2_firma_url}
                  alt="Firma"
                  className="h-12 mx-auto mb-1 print:h-10 object-contain"
                />
              )}
              <div className={`border-t border-gray-400 pt-2 ${cfg.firmante2_firma_url ? 'mt-1' : 'mt-8 md:mt-12'}`}>
                <p className="text-[11px] font-bold text-gray-800">{cfg.firmante2_nombre}.</p>
                <p className="text-[10px] text-gray-500">Promotor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <footer className="bg-[#003087] px-8 py-2 text-center">
          <p className="text-[10px] text-white/70">
            Carretera 57 Km 5, Matehuala, S.L.P. • (488) 882-1314 • matehuala.tecnm.mx •
            Folio: {c.folio ?? "PENDIENTE"} • Verificado digitalmente — TallerTec
          </p>
        </footer>
      </article>
    </div>
  );
}
