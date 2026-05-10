"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Check,
  X,
  Edit3,
  Trash2,
  Users,
  Clock,
} from "lucide-react";
import { obtenerAsistenciasSemanal } from "@/app/actions/asistencia";
import { AsistenciaModal } from "@/components/encargado/asistencia-modal";

interface Taller {
  id: string;
  nombre: string;
}

interface Alumno {
  inscripcionId: string;
  estudianteId: string;
  nombre: string;
  numeroControl: string;
  horasAcumuladas: number;
  asistencias: Record<string, { id: string; horas: number; metodo: string; notas: string | null }>;
  totalHorasSemana: number;
}

interface ModalState {
  isOpen: boolean;
  modo: "editar" | "eliminar";
  asistencia: {
    id: string;
    horas: number;
    fecha: string;
    nombreAlumno: string;
  };
}

export default function SeguimientoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tallerIdParam = searchParams.get("taller");

  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [tallerId, setTallerId] = useState<string>(tallerIdParam || "");
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [semana, setSemana] = useState<{ inicio: string; fin: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [fechaBase, setFechaBase] = useState<Date>(new Date());
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    modo: "editar",
    asistencia: { id: "", horas: 0, fecha: "", nombreAlumno: "" },
  });

  // Cargar talleres del encargado
  useEffect(() => {
    fetch("/api/encargado/mis-talleres")
      .then((r) => r.json())
      .then((data) => {
        setTalleres(data);
        if (!tallerIdParam && data.length > 0) {
          setTallerId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tallerIdParam]);

  const cargarAsistencias = useCallback(async () => {
    if (!tallerId) return;

    setLoadingData(true);
    const result = await obtenerAsistenciasSemanal(tallerId, fechaBase.toISOString().split("T")[0]);

    if (result.success) {
      setAlumnos(result.alumnos || []);
      setSemana(result.semana || null);
    }
    setLoadingData(false);
  }, [tallerId, fechaBase]);

  useEffect(() => {
    if (tallerId) {
      cargarAsistencias();
    }
  }, [tallerId, cargarAsistencias]);

  const cambiarSemana = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaBase);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === "anterior" ? -7 : 7));
    setFechaBase(nuevaFecha);
  };

  const irASemanaActual = () => {
    setFechaBase(new Date());
  };

  const handleTallerChange = (nuevoTallerId: string) => {
    setTallerId(nuevoTallerId);
    router.push(`/encargado/seguimiento?taller=${nuevoTallerId}`);
  };

  const abrirModal = (
    modo: "editar" | "eliminar",
    asistenciaId: string,
    horas: number,
    fecha: string,
    nombreAlumno: string
  ) => {
    setModal({
      isOpen: true,
      modo,
      asistencia: { id: asistenciaId, horas, fecha, nombreAlumno },
    });
  };

  const cerrarModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Generar días de la semana
  const getDiasSemana = () => {
    if (!semana) return [];
    const inicio = new Date(semana.inicio + "T00:00:00");
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(dia.getDate() + i);
      dias.push({
        fecha: dia.toISOString().split("T")[0],
        nombreCorto: dia.toLocaleDateString("es-MX", { weekday: "short" }).slice(0, 3),
        numero: dia.getDate(),
        esHoy: dia.toISOString().split("T")[0] === new Date().toISOString().split("T")[0],
      });
    }
    return dias;
  };

  const diasSemana = getDiasSemana();

  const formatearRangoSemana = () => {
    if (!semana) return "";
    const inicio = new Date(semana.inicio + "T00:00:00");
    const fin = new Date(semana.fin + "T00:00:00");
    const mesInicio = inicio.toLocaleDateString("es-MX", { month: "short" });
    const mesFin = fin.toLocaleDateString("es-MX", { month: "short" });

    if (mesInicio === mesFin) {
      return `${inicio.getDate()} - ${fin.getDate()} ${mesFin} ${fin.getFullYear()}`;
    }
    return `${inicio.getDate()} ${mesInicio} - ${fin.getDate()} ${mesFin} ${fin.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (talleres.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="glass-card p-12 rounded-3xl text-center">
          <Calendar className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Sin talleres asignados</h3>
          <p className="text-muted-foreground">Contacta al administrador para que te asigne un taller.</p>
        </div>
      </div>
    );
  }

  const tallerActual = talleres.find((t) => t.id === tallerId);

  // Calcular estadísticas
  const totalAsistenciasSemana = alumnos.reduce(
    (sum, a) => sum + Object.keys(a.asistencias).length,
    0
  );
  const totalHorasSemana = alumnos.reduce((sum, a) => sum + a.totalHorasSemana, 0);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/encargado"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Seguimiento Semanal
            </h1>
            <p className="text-muted-foreground">Control de asistencias por semana</p>
          </div>
        </div>

        {/* Selector de taller */}
        {talleres.length > 1 && (
          <select
            value={tallerId}
            onChange={(e) => handleTallerChange(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {talleres.map((t) => (
              <option key={t.id} value={t.id} className="bg-background">
                {t.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Navegación de semana */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <button
            onClick={() => cambiarSemana("anterior")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">{formatearRangoSemana()}</p>
              {tallerActual && (
                <p className="text-sm text-muted-foreground">{tallerActual.nombre}</p>
              )}
            </div>
            <button
              onClick={irASemanaActual}
              className="px-3 py-1.5 text-xs font-medium bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              Hoy
            </button>
          </div>

          <button
            onClick={() => cambiarSemana("siguiente")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{alumnos.length}</p>
          <p className="text-xs text-muted-foreground">Alumnos</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Check className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalAsistenciasSemana}</p>
          <p className="text-xs text-muted-foreground">Asistencias</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <Clock className="w-6 h-6 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{totalHorasSemana.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Horas</p>
        </div>
      </div>

      {/* Tabla de asistencias */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : alumnos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay alumnos inscritos en este taller.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 font-semibold text-sm sticky left-0 bg-card/95 backdrop-blur-sm z-10">
                    Alumno
                  </th>
                  {diasSemana.map((dia) => (
                    <th
                      key={dia.fecha}
                      className={`p-2 md:p-3 text-center min-w-[60px] md:min-w-[80px] ${
                        dia.esHoy ? "bg-accent/10" : ""
                      }`}
                    >
                      <p className="text-[10px] md:text-xs text-muted-foreground uppercase">{dia.nombreCorto}</p>
                      <p className={`text-base md:text-lg font-bold ${dia.esHoy ? "text-accent" : ""}`}>
                        {dia.numero}
                      </p>
                    </th>
                  ))}
                  <th className="p-2 md:p-3 text-center min-w-[60px] md:min-w-[80px]">
                    <p className="text-xs text-muted-foreground">TOTAL</p>
                    <p className="text-sm font-semibold">Semana</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno, idx) => (
                  <tr
                    key={alumno.inscripcionId}
                    className={`border-b border-border/20 hover:bg-white/5 transition-colors ${
                      idx % 2 === 0 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <td className="p-4 sticky left-0 bg-card/95 backdrop-blur-sm z-10">
                      <p className="font-medium text-sm">{alumno.nombre}</p>
                      <p className="text-xs text-muted-foreground">{alumno.numeroControl}</p>
                    </td>
                    {diasSemana.map((dia) => {
                      const asistencia = alumno.asistencias[dia.fecha];
                      return (
                        <td
                          key={dia.fecha}
                          className={`p-2 text-center ${dia.esHoy ? "bg-accent/5" : ""}`}
                        >
                          {asistencia ? (
                            <div className="group relative">
                              <div className="inline-flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {asistencia.horas}h
                                </span>
                              </div>
                              {/* Acciones hover */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border/50 rounded-lg shadow-lg p-1 flex gap-1 z-20">
                                <button
                                  onClick={() =>
                                    abrirModal(
                                      "editar",
                                      asistencia.id,
                                      asistencia.horas,
                                      dia.fecha,
                                      alumno.nombre
                                    )
                                  }
                                  className="p-1.5 rounded hover:bg-accent/20 text-accent transition-colors"
                                  title="Editar"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    abrirModal(
                                      "eliminar",
                                      asistencia.id,
                                      asistencia.horas,
                                      dia.fecha,
                                      alumno.nombre
                                    )
                                  }
                                  className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <span className="font-bold text-accent">{alumno.totalHorasSemana.toFixed(1)}h</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AsistenciaModal
        isOpen={modal.isOpen}
        onClose={cerrarModal}
        onSuccess={cargarAsistencias}
        modo={modal.modo}
        asistencia={modal.asistencia}
      />
    </div>
  );
}
