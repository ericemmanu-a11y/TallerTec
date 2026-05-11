"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Image as ImageIcon, Eye, EyeOff, GripVertical, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  crearTallerDestacado,
  actualizarTallerDestacado,
  eliminarTallerDestacado,
  reordenarTalleresDestacados,
} from "@/app/actions/talleres-destacados";

interface TallerDestacado {
  id: string;
  taller_id: string | null;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  color: string;
  orden: number;
  activo: boolean;
}

const COLORES = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "orange", label: "Naranja", class: "bg-orange-500" },
  { value: "purple", label: "Morado", class: "bg-purple-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "pink", label: "Rosa", class: "bg-pink-500" },
  { value: "red", label: "Rojo", class: "bg-red-500" },
  { value: "yellow", label: "Amarillo", class: "bg-yellow-500" },
  { value: "cyan", label: "Cian", class: "bg-cyan-500" },
];

export default function TalleresDestacadosPage() {
  const [talleres, setTalleres] = useState<TallerDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    color: "blue",
    activo: true,
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/talleres-destacados");
      if (res.ok) {
        const data = await res.json();
        setTalleres(data);
      }
    } catch {
      console.error("Error cargando talleres destacados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "", color: "blue", activo: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const fd = new FormData();
    fd.append("nombre", form.nombre);
    fd.append("descripcion", form.descripcion);
    fd.append("color", form.color);
    fd.append("activo", String(form.activo));

    startTransition(async () => {
      let result;
      if (editingId) {
        result = await actualizarTallerDestacado(editingId, fd);
      } else {
        result = await crearTallerDestacado(fd);
      }

      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
      } else {
        setMensaje({ tipo: "success", texto: editingId ? "Taller actualizado." : "Taller agregado." });
        resetForm();
        await loadData();
      }
    });
  };

  const handleEdit = (taller: TallerDestacado) => {
    setForm({
      nombre: taller.nombre,
      descripcion: taller.descripcion,
      color: taller.color,
      activo: taller.activo,
    });
    setEditingId(taller.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este taller de la página principal?")) return;

    startTransition(async () => {
      const result = await eliminarTallerDestacado(id);
      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
      } else {
        setMensaje({ tipo: "success", texto: "Taller eliminado." });
        await loadData();
      }
    });
  };

  const handleToggleActivo = async (taller: TallerDestacado) => {
    const fd = new FormData();
    fd.append("nombre", taller.nombre);
    fd.append("descripcion", taller.descripcion);
    fd.append("color", taller.color);
    fd.append("activo", String(!taller.activo));

    startTransition(async () => {
      const result = await actualizarTallerDestacado(taller.id, fd);
      if (!result.error) {
        await loadData();
      }
    });
  };

  const handleImageUpload = async (tallerId: string, file: File) => {
    setUploadingId(tallerId);
    setMensaje(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tallerDestacadoId", tallerId);

    try {
      const res = await fetch("/api/admin/upload-taller-foto", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: "error", texto: data.error || "Error al subir imagen" });
      } else {
        setMensaje({ tipo: "success", texto: "Imagen subida correctamente." });
        await loadData();
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión" });
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileSelect = (tallerId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(tallerId, file);
    }
    e.target.value = "";
  };

  const getColorClass = (color: string) => {
    return COLORES.find(c => c.value === color)?.class || "bg-blue-500";
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Panel
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Talleres en Página Principal</h1>
              <p className="text-muted-foreground mt-0.5">
                Gestiona qué talleres se muestran en la sección "Conoce Nuestros Talleres".
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar Taller
          </button>
        </div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`p-4 rounded-xl ${mensaje.tipo === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{editingId ? "Editar Taller" : "Nuevo Taller"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre del Taller</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Ej: Fútbol, Voleibol, Danza..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Color del fondo</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-lg ${c.class} transition-all ${form.color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "opacity-60 hover:opacity-100"}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripción corta</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                rows={3}
                placeholder="Breve descripción que se mostrará en la tarjeta..."
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Mostrar en página principal</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Guardar Cambios" : "Agregar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de talleres */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : talleres.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No hay talleres destacados configurados.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold bg-primary/20 text-primary hover:bg-primary/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar el primero
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {talleres.filter(t => t.activo).length} de {talleres.length} talleres visibles en la página principal.
          </p>

          <div className="grid gap-4">
            {talleres.map((taller) => (
              <div
                key={taller.id}
                className={`glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row ${!taller.activo ? "opacity-60" : ""}`}
              >
                {/* Imagen */}
                <div className={`w-full md:w-48 h-36 md:h-auto relative bg-gradient-to-br from-${taller.color}-500/20 to-${taller.color}-600/10 flex items-center justify-center`}>
                  {taller.imagen_url ? (
                    <Image
                      src={taller.imagen_url}
                      alt={taller.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={`w-16 h-16 ${getColorClass(taller.color)}/20 rounded-2xl flex items-center justify-center`}>
                      <ImageIcon className={`w-8 h-8 text-${taller.color}-400`} />
                    </div>
                  )}

                  {/* Botón subir imagen */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileSelect(taller.id)}
                      className="hidden"
                      id={`upload-${taller.id}`}
                    />
                    <label
                      htmlFor={`upload-${taller.id}`}
                      className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/20 hover:bg-white/30 cursor-pointer text-white text-sm font-medium transition-all"
                    >
                      {uploadingId === taller.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {taller.imagen_url ? "Cambiar" : "Subir"} imagen
                    </label>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{taller.nombre}</h3>
                        <span className={`w-3 h-3 rounded-full ${getColorClass(taller.color)}`} />
                        {!taller.activo && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            Oculto
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{taller.descripcion}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActivo(taller)}
                        className={`p-2 rounded-lg transition-colors ${taller.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                        title={taller.activo ? "Ocultar" : "Mostrar"}
                      >
                        {taller.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(taller)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(taller.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="glass-card p-5 rounded-2xl bg-primary/5 border-primary/20">
        <h4 className="font-bold text-sm mb-2">Información</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Los talleres marcados como "activos" aparecerán en la página principal.</li>
          <li>• Las imágenes recomendadas son de 800x600 píxeles (formato 4:3).</li>
          <li>• Formatos aceptados: PNG, JPG, WebP. Tamaño máximo: 2MB.</li>
          <li>• Los cambios se reflejan inmediatamente en la página principal.</li>
        </ul>
      </div>
    </div>
  );
}
