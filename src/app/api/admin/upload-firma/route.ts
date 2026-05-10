import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export async function POST(request: NextRequest) {
  // 1. Verificar autenticación
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Obtener FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const configId = formData.get("configId") as string;
  const firmante = formData.get("firmante") as string;
  const file = formData.get("file") as File | null;

  // 3. Validaciones
  if (!configId || !firmante || !file) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (firmante !== "1" && firmante !== "2") {
    return NextResponse.json({ error: "Firmante inválido" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido. Use PNG o JPG." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo excede el tamaño máximo de 500KB" }, { status: 400 });
  }

  // 4. Crear cliente admin
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Error de configuración del sistema" }, { status: 500 });
  }

  // 5. Verificar que la configuración exista
  const { data: config } = await adminClient
    .from("configuracion_constancias")
    .select("id")
    .eq("id", configId)
    .single();

  if (!config) {
    return NextResponse.json({ error: "La configuración no existe" }, { status: 404 });
  }

  // 6. Preparar archivo para subir
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `firma_${firmante}_${configId}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  // 7. Subir a Supabase Storage
  const { error: uploadError } = await adminClient.storage
    .from("firmas")
    .upload(fileName, fileBuffer, {
      contentType: file.type,
      upsert: true, // Sobrescribir si ya existe
    });

  if (uploadError) {
    console.error("Error al subir firma:", uploadError);
    return NextResponse.json(
      { error: "Error al subir el archivo: " + uploadError.message },
      { status: 500 }
    );
  }

  // 8. Obtener URL pública
  const { data: urlData } = adminClient.storage.from("firmas").getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // 9. Actualizar la URL en la tabla
  const campo = firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url";
  const { error: updateError } = await adminClient
    .from("configuracion_constancias")
    .update({ [campo]: publicUrl })
    .eq("id", configId);

  if (updateError) {
    return NextResponse.json(
      { error: "Error al actualizar la configuración: " + updateError.message },
      { status: 500 }
    );
  }

  // 10. Retornar URL pública
  return NextResponse.json({ url: publicUrl, success: true });
}

export async function DELETE(request: NextRequest) {
  // 1. Verificar autenticación
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Obtener parámetros
  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("configId");
  const firmante = searchParams.get("firmante");

  if (!configId || !firmante) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  if (firmante !== "1" && firmante !== "2") {
    return NextResponse.json({ error: "Firmante inválido" }, { status: 400 });
  }

  // 3. Crear cliente admin
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Error de configuración del sistema" }, { status: 500 });
  }

  // 4. Eliminar archivo de Storage (intentamos varios formatos)
  const extensions = ["png", "jpg", "jpeg"];
  for (const ext of extensions) {
    const fileName = `firma_${firmante}_${configId}.${ext}`;
    await adminClient.storage.from("firmas").remove([fileName]);
  }

  // 5. Limpiar URL en la tabla
  const campo = firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url";
  const { error: updateError } = await adminClient
    .from("configuracion_constancias")
    .update({ [campo]: null })
    .eq("id", configId);

  if (updateError) {
    return NextResponse.json(
      { error: "Error al actualizar la configuración: " + updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
