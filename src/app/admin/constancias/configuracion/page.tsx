"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { ArrowLeft, Settings, Save, Copy, Eye, Loader2, CheckCircle2, AlertCircle, User, FileText } from "lucide-react";
import Link from "next/link";
import FirmaUpload from "@/components/admin/firma-upload";
import {
  crearConfiguracion,
  actualizarConfiguracion,
  copiarConfiguracion,
} from "@/app/actions/configuracion-constancias";
import { CONFIG_DEFAULTS, type ConfiguracionConstancia } from "@/lib/constancias-config";

interface Periodo {
  id: string;
  nombre: string;
  activo: boolean;
}

export default function ConfiguracionConstanciasPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionConstancia[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("");
  const [currentConfig, setCurrentConfig] = useState<ConfiguracionConstancia | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const [periodoOrigen, setPeriodoOrigen] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    destinatario_nombre: CONFIG_DEFAULTS.destinatario_nombre,
    destinatario_puesto: CONFIG_DEFAULTS.destinatario_puesto,
    firmante1_nombre: CONFIG_DEFAULTS.firmante1_nombre,
    firmante1_puesto: CONFIG_DEFAULTS.firmante1_puesto,
    firmante2_nombre: CONFIG_DEFAULTS.firmante2_nombre,
    firmante2_puesto: CONFIG_DEFAULTS.firmante2_puesto,
    valor_curricular: CONFIG_DEFAULTS.valor_curricular,
  });

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      const [periodosRes, configsRes] = await Promise.all([
        fetch("/api/periodos"),
        fetch("/api/admin/configuracion-constancias"),
      ]);

      const periodosData = await periodosRes.json();
      setPeriodos(Array.isArray(periodosData) ? periodosData : []);

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setConfiguraciones(Array.isArray(configsData) ? configsData : []);
      }
    } catch {
      setPeriodos([]);
      setConfiguraciones([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cuando cambia el período seleccionado
  useEffect(() => {
    if (!selectedPeriodo) {
      setCurrentConfig(null);
      setFormData({
        destinatario_nombre: CONFIG_DEFAULTS.destinatario_nombre,
        destinatario_puesto: CONFIG_DEFAULTS.destinatario_puesto,
        firmante1_nombre: CONFIG_DEFAULTS.firmante1_nombre,
        firmante1_puesto: CONFIG_DEFAULTS.firmante1_puesto,
        firmante2_nombre: CONFIG_DEFAULTS.firmante2_nombre,
        firmante2_puesto: CONFIG_DEFAULTS.firmante2_puesto,
        valor_curricular: CONFIG_DEFAULTS.valor_curricular,
      });
      return;
    }

    const config = configuraciones.find((c) => c.periodo_id === selectedPeriodo);
    setCurrentConfig(config ?? null);

    if (config) {
      setFormData({
        destinatario_nombre: config.destinatario_nombre,
        destinatario_puesto: config.destinatario_puesto,
        firmante1_nombre: config.firmante1_nombre,
        firmante1_puesto: config.firmante1_puesto,
        firmante2_nombre: config.firmante2_nombre,
        firmante2_puesto: config.firmante2_puesto,
        valor_curricular: config.valor_curricular,
      });
    } else {
      setFormData({
        destinatario_nombre: CONFIG_DEFAULTS.destinatario_nombre,
        destinatario_puesto: CONFIG_DEFAULTS.destinatario_puesto,
        firmante1_nombre: CONFIG_DEFAULTS.firmante1_nombre,
        firmante1_puesto: CONFIG_DEFAULTS.firmante1_puesto,
        firmante2_nombre: CONFIG_DEFAULTS.firmante2_nombre,
        firmante2_puesto: CONFIG_DEFAULTS.firmante2_puesto,
        valor_curricular: CONFIG_DEFAULTS.valor_curricular,
      });
    }
  }, [selectedPeriodo, configuraciones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPeriodo) {
      setMensaje({ tipo: "error", texto: "Debe seleccionar un período." });
      return;
    }

    setMensaje(null);

    const fd = new FormData();
    fd.append("periodo_id", selectedPeriodo);
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));

    startTransition(async () => {
      let result;
      if (currentConfig) {
        result = await actualizarConfiguracion(currentConfig.id, fd);
      } else {
        result = await crearConfiguracion(fd);
      }

      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
      } else {
        setMensaje({ tipo: "success", texto: currentConfig ? "Configuración actualizada." : "Configuración creada." });
        await loadData();
      }
    });
  };

  const handleCopiar = async () => {
    if (!periodoOrigen || !selectedPeriodo) {
      setMensaje({ tipo: "error", texto: "Debe seleccionar período origen y destino." });
      return;
    }

    if (periodoOrigen === selectedPeriodo) {
      setMensaje({ tipo: "error", texto: "El período origen y destino deben ser diferentes." });
      return;
    }

    setMensaje(null);

    startTransition(async () => {
      const result = await copiarConfiguracion(periodoOrigen, selectedPeriodo);
      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
      } else {
        setMensaje({ tipo: "success", texto: "Configuración copiada exitosamente." });
        await loadData();
      }
    });
  };

  const handleFirmaUpload = (firmante: "1" | "2", url: string) => {
    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        [firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url"]: url,
      });
      loadData();
    }
  };

  const handleFirmaDelete = (firmante: "1" | "2") => {
    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        [firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url"]: null,
      });
      loadData();
    }
  };

  const periodoActual = periodos.find((p) => p.id === selectedPeriodo);
  const periodosConConfig = configuraciones.map((c) => c.periodo_id);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/admin/constancias"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Constancias
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Configuración de Constancias</h1>
            <p className="text-muted-foreground mt-0.5">
              Define los datos institucionales para cada período escolar.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de período */}
      <div className="glass-card p-5 rounded-2xl">
        <label className="block text-sm font-medium mb-2">Seleccionar Período</label>
        <select
          value={selectedPeriodo}
          onChange={(e) => setSelectedPeriodo(e.target.value)}
          className="glass-input w-full md:w-80 px-4 py-3 rounded-xl text-sm"
        >
          <option value="">-- Seleccione un período --</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.activo ? "(Activo)" : ""} {periodosConConfig.includes(p.id) ? "✓" : ""}
            </option>
          ))}
        </select>
        {selectedPeriodo && (
          <p className="text-xs text-muted-foreground mt-2">
            {currentConfig
              ? "Este período ya tiene configuración. Puede editarla."
              : "Este período no tiene configuración. Se usarán los valores predeterminados hasta que cree una."}
          </p>
        )}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            mensaje.tipo === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {mensaje.tipo === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de configuración */}
      {selectedPeriodo && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destinatario */}
          <div className="glass-card p-5 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Datos del Destinatario</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2 mb-4">
              Persona a quien va dirigida la carta de constancia.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  type="text"
                  name="destinatario_nombre"
                  value={formData.destinatario_nombre}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Puesto</label>
                <input
                  type="text"
                  name="destinatario_puesto"
                  value={formData.destinatario_puesto}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Firmante 1 */}
          <div className="glass-card p-5 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Firmante 1 (Vo. Bo.)</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2 mb-4">
              Jefe del Departamento de Actividades Extraescolares.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  type="text"
                  name="firmante1_nombre"
                  value={formData.firmante1_nombre}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Puesto</label>
                <input
                  type="text"
                  name="firmante1_puesto"
                  value={formData.firmante1_puesto}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Firma digital */}
            {currentConfig && (
              <div className="pt-4 border-t border-border/30">
                <label className="text-sm font-medium block mb-3">Firma digital</label>
                <FirmaUpload
                  configId={currentConfig.id}
                  firmante="1"
                  firmaActual={currentConfig.firmante1_firma_url}
                  onUploadComplete={(url) => handleFirmaUpload("1", url)}
                  onDelete={() => handleFirmaDelete("1")}
                />
              </div>
            )}
            {!currentConfig && (
              <p className="text-xs text-muted-foreground italic pt-3 border-t border-border/30">
                Guarde la configuración primero para poder subir la firma digital.
              </p>
            )}
          </div>

          {/* Firmante 2 */}
          <div className="glass-card p-5 md:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold">Firmante 2</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2 mb-4">
              Jefe de la Oficina de Promoción Deportiva / Promotor.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre completo</label>
                <input
                  type="text"
                  name="firmante2_nombre"
                  value={formData.firmante2_nombre}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Puesto</label>
                <input
                  type="text"
                  name="firmante2_puesto"
                  value={formData.firmante2_puesto}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* Firma digital */}
            {currentConfig && (
              <div className="pt-4 border-t border-border/30">
                <label className="text-sm font-medium block mb-3">Firma digital</label>
                <FirmaUpload
                  configId={currentConfig.id}
                  firmante="2"
                  firmaActual={currentConfig.firmante2_firma_url}
                  onUploadComplete={(url) => handleFirmaUpload("2", url)}
                  onDelete={() => handleFirmaDelete("2")}
                />
              </div>
            )}
            {!currentConfig && (
              <p className="text-xs text-muted-foreground italic pt-3 border-t border-border/30">
                Guarde la configuración primero para poder subir la firma digital.
              </p>
            )}
          </div>

          {/* Valor curricular */}
          <div className="glass-card p-5 md:p-6 rounded-2xl space-y-4">
            <h3 className="font-bold">Valor Curricular</h3>
            <div className="max-w-xs">
              <input
                type="text"
                name="valor_curricular"
                value={formData.valor_curricular}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="Ej: 1 crédito"
                required
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {currentConfig ? "Guardar Cambios" : "Crear Configuración"}
            </button>

            {currentConfig && (
              <Link
                href={`/constancia/preview?periodo=${selectedPeriodo}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-border/50 transition-all"
              >
                <Eye className="w-4 h-4" /> Previsualizar
              </Link>
            )}
          </div>
        </form>
      )}

      {/* Copiar configuración */}
      {selectedPeriodo && !currentConfig && periodosConConfig.length > 0 && (
        <div className="glass-card p-5 md:p-6 rounded-2xl">
          <h3 className="font-bold mb-2">Copiar de otro período</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Puede copiar la configuración de un período anterior para no empezar desde cero.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium block mb-1.5">Período origen</label>
              <select
                value={periodoOrigen}
                onChange={(e) => setPeriodoOrigen(e.target.value)}
                className="glass-input w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm"
              >
                <option value="">-- Seleccione --</option>
                {periodos
                  .filter((p) => periodosConConfig.includes(p.id) && p.id !== selectedPeriodo)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCopiar}
              disabled={isPending || !periodoOrigen}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-accent/20 text-accent hover:bg-accent/30 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              Copiar configuración
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Nota: Las firmas digitales NO se copian. Deberá subirlas nuevamente.
          </p>
        </div>
      )}

      {/* Sin período seleccionado */}
      {!selectedPeriodo && (
        <div className="glass-card p-10 rounded-2xl text-center">
          <Settings className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Seleccione un período para configurar.</p>
        </div>
      )}
    </div>
  );
}
