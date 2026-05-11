import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextRequest, NextResponse } from "next/server";
import { actualizarImagenTallerDestacado } from "@/app/actions/talleres-destacados";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tallerDestacadoId = formData.get("tallerDestacadoId") as string;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    if (!tallerDestacadoId) {
      return NextResponse.json({ error: "ID de taller destacado requerido" }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Solo se permiten archivos PNG, JPG o WebP" }, { status: 400 });
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 2MB" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Generar nombre único para el archivo
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `taller_${tallerDestacadoId}_${Date.now()}.${ext}`;

    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("talleres-fotos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo archivo:", uploadError);
      return NextResponse.json({ error: "Error al subir el archivo: " + uploadError.message }, { status: 500 });
    }

    // Obtener URL pública
    const { data: urlData } = adminClient.storage
      .from("talleres-fotos")
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    // Actualizar el registro en la base de datos
    const result = await actualizarImagenTallerDestacado(tallerDestacadoId, publicUrl);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e) {
    console.error("Error en upload-taller-foto:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tallerDestacadoId = searchParams.get("tallerDestacadoId");

    if (!tallerDestacadoId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Actualizar el registro para quitar la imagen
    const result = await actualizarImagenTallerDestacado(tallerDestacadoId, "");

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error eliminando foto:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
