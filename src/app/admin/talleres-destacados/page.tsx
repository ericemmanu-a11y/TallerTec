"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Image as ImageIcon, Eye, EyeOff, Upload, X, Pencil, Camera, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  crearTallerDestacado,
  actualizarTallerDestacado,
  eliminarTallerDestacado,
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
  const [editingTaller, setEditingTaller] = useState<TallerDestacado | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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
    setEditingTaller(null);
    setShowForm(false);
    setPreviewImage(null);
    setPendingFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setMensaje({ tipo: "error", texto: "Solo se permiten archivos PNG, JPG o WebP" });
        return;
      }
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMensaje({ tipo: "error", texto: "El archivo excede el tamaño máximo de 2MB" });
        return;
      }

      setPendingFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (tallerId: string, file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tallerDestacadoId", tallerId);

    try {
      const res = await fetch("/api/admin/upload-taller-foto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setMensaje({ tipo: "error", texto: data.error || "Error al subir imagen" });
        return false;
      }
      return true;
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión al subir imagen" });
      return false;
    }
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
      let tallerId: string | null = null;

      if (editingTaller) {
        result = await actualizarTallerDestacado(editingTaller.id, fd);
        tallerId = editingTaller.id;
      } else {
        result = await crearTallerDestacado(fd);
        if (result.data) {
          tallerId = result.data.id;
        }
      }

      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
        return;
      }

      // Si hay imagen pendiente, subirla
      if (pendingFile && tallerId) {
        const uploadSuccess = await uploadImage(tallerId, pendingFile);
        if (!uploadSuccess) {
          // Ya se mostró el mensaje de error en uploadImage
          await loadData();
          resetForm();
          return;
        }
      }

      setMensaje({ tipo: "success", texto: editingTaller ? "Taller actualizado correctamente" : "Taller agregado correctamente" });
      resetForm();
      await loadData();
    });
  };

  const handleEdit = (taller: TallerDestacado) => {
    setForm({
      nombre: taller.nombre,
      descripcion: taller.descripcion,
      color: taller.color,
      activo: taller.activo,
    });
    setEditingTaller(taller);
    setPreviewImage(taller.imagen_url);
    setPendingFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este taller de la página principal?")) return;

    startTransition(async () => {
      const result = await eliminarTallerDestacado(id);
      if (result.error) {
        setMensaje({ tipo: "error", texto: result.error });
      } else {
        setMensaje({ tipo: "success", texto: "Taller eliminado" });
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
        setMensaje({
          tipo: "success",
          texto: taller.activo ? "Taller ocultado de la página principal" : "Taller visible en la página principal"
        });
      }
    });
  };

  // Subir imagen directamente a un taller existente
  const handleDirectImageUpload = async (tallerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMensaje({ tipo: "error", texto: "Solo se permiten archivos PNG, JPG o WebP" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMensaje({ tipo: "error", texto: "El archivo excede el tamaño máximo de 2MB" });
      return;
    }

    setUploadingId(tallerId);
    setMensaje(null);

    const success = await uploadImage(tallerId, file);

    if (success) {
      setMensaje({ tipo: "success", texto: "Imagen actualizada correctamente" });
      await loadData();
    }

    setUploadingId(null);
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Talleres en Página Principal</h1>
              <p className="text-muted-foreground mt-0.5">
                Gestiona qué talleres se muestran a los visitantes.
              </p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Agregar Taller
            </button>
          )}
        </div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${mensaje.tipo === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {mensaje.tipo === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de Crear/Editar */}
      {showForm && (
        <div className="glass-card p-6 rounded-2xl space-y-5 border-2 border-primary/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">
              {editingTaller ? `Editando: ${editingTaller.nombre}` : "Agregar Nuevo Taller"}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sección de Imagen - MUY VISIBLE */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Imagen del Taller (opcional)
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Preview de imagen */}
                <div className={`w-full md:w-64 h-48 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden relative ${previewImage ? '' : 'bg-white/5'}`}>
                  {previewImage ? (
                    <>
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { setPreviewImage(null); setPendingFile(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${getColorClass(form.color)}/20 flex items-center justify-center`}>
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sin imagen</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Se usará el color de fondo</p>
                    </div>
                  )}
                </div>

                {/* Botón de subir */}
                <div className="flex-1 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-all cursor-pointer border border-border/50 w-full md:w-auto"
                  >
                    <Upload className="w-4 h-4" />
                    {previewImage ? "Cambiar Imagen" : "Subir Imagen"}
                  </label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Formatos: PNG, JPG o WebP</p>
                    <p>• Tamaño máximo: 2MB</p>
                    <p>• Recomendado: 800 x 600 píxeles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campos del formulario */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Nombre del Taller *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Ej: Fútbol, Voleibol, Básquetbol..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Color de Fondo</label>
                <p className="text-xs text-muted-foreground mb-2">Se usa cuando no hay imagen</p>
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
              <label className="text-sm font-semibold">Descripción *</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                rows={3}
                placeholder="Descripción breve del taller que se mostrará a los visitantes..."
                required
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary"
                />
                <span className="text-sm font-medium">Visible en la página principal</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/30">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingTaller ? "Guardar Cambios" : "Agregar Taller"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-3 px-6 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 transition-all"
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
      ) : talleres.length === 0 && !showForm ? (
        <div className="glass-card p-10 rounded-2xl text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-accent/50" />
          </div>
          <h3 className="font-bold text-lg mb-2">No hay talleres configurados</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Agrega talleres para que aparezcan en la sección "Conoce Nuestros Talleres" de la página principal.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar Primer Taller
          </button>
        </div>
      ) : talleres.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{talleres.filter(t => t.activo).length}</span> de {talleres.length} talleres visibles
            </p>
            <Link
              href="/"
              target="_blank"
              className="text-sm text-primary hover:underline"
            >
              Ver página principal →
            </Link>
          </div>

          <div className="grid gap-4">
            {talleres.map((taller) => (
              <div
                key={taller.id}
                className={`glass-card rounded-2xl overflow-hidden ${!taller.activo ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Imagen/Color */}
                  <div className={`w-full md:w-56 h-40 md:h-auto relative flex items-center justify-center ${getColorClass(taller.color)}/20`}>
                    {taller.imagen_url ? (
                      <Image
                        src={taller.imagen_url}
                        alt={taller.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className={`w-14 h-14 ${getColorClass(taller.color)}/30 rounded-xl flex items-center justify-center mx-auto`}>
                          <ImageIcon className="w-7 h-7 text-white/50" />
                        </div>
                        <p className="text-xs text-white/50 mt-2">Sin imagen</p>
                      </div>
                    )}

                    {/* Botón para cambiar imagen - SIEMPRE VISIBLE */}
                    <div className="absolute bottom-2 right-2">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleDirectImageUpload(taller.id, e)}
                        className="hidden"
                        id={`upload-${taller.id}`}
                        disabled={uploadingId === taller.id}
                      />
                      <label
                        htmlFor={`upload-${taller.id}`}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-medium cursor-pointer transition-all ${uploadingId === taller.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {uploadingId === taller.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                        {taller.imagen_url ? "Cambiar" : "Subir"} foto
                      </label>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg">{taller.nombre}</h3>
                          <span className={`w-3 h-3 rounded-full shrink-0 ${getColorClass(taller.color)}`} title={`Color: ${taller.color}`} />
                          {!taller.activo && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                              Oculto
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{taller.descripcion}</p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleActivo(taller)}
                          disabled={isPending}
                          className={`p-2.5 rounded-xl transition-colors ${taller.activo ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                          title={taller.activo ? "Clic para ocultar" : "Clic para mostrar"}
                        >
                          {taller.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(taller)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar taller"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(taller.id)}
                          disabled={isPending}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Eliminar taller"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota informativa */}
      {talleres.length > 0 && (
        <div className="glass-card p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            Información
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Los talleres con el ícono <Eye className="w-3 h-3 inline text-green-400" /> están visibles en la página principal.</li>
            <li>• Usa el botón <Camera className="w-3 h-3 inline" /> <span className="text-xs">Subir foto</span> para agregar o cambiar la imagen.</li>
            <li>• Los cambios se reflejan inmediatamente en la página principal.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
