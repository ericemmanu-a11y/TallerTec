import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextResponse } from "next/server";

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: "Error de configuración" }, { status: 500 });
  }

  const { data } = await adminClient
    .from("inscripciones")
    .select("id, horas_acumuladas, estado, fecha_inscripcion, talleres(nombre, categoria), usuarios(nombre_completo, numero_control, carrera, semestre, email)")
    .in("estado", ["ACTIVA", "COMPLETADA", "BAJA"])
    .order("horas_acumuladas", { ascending: false });

  const rows = [
    ["No. Control", "Nombre Completo", "Carrera", "Semestre", "Email", "Taller", "Categoría", "Horas Acumuladas", "Estado", "Fecha Inscripción"].join(","),
    ...(data ?? []).map((ins) => {
      const u = ins.usuarios as unknown as { nombre_completo: string; numero_control: string | null; carrera: string | null; semestre: number | null; email: string } | null;
      const t = ins.talleres as unknown as { nombre: string; categoria: string } | null;
      return [
        escapeCsv(u?.numero_control),
        escapeCsv(u?.nombre_completo),
        escapeCsv(u?.carrera),
        escapeCsv(u?.semestre),
        escapeCsv(u?.email),
        escapeCsv(t?.nombre),
        escapeCsv(t?.categoria),
        escapeCsv(Number(ins.horas_acumuladas).toFixed(1)),
        escapeCsv(ins.estado),
        escapeCsv(new Date(ins.fecha_inscripcion).toLocaleDateString("es-MX")),
      ].join(",");
    }),
  ].join("\n");

  const fecha = new Date().toISOString().slice(0, 10);
  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tallertec-alumnos-${fecha}.csv"`,
    },
  });
}
