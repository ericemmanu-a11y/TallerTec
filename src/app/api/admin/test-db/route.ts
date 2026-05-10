import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminClient = createAdminClient();

    // Test 1: Check periodos table
    const { data: periodos, error: periodosError } = await adminClient
      .from("periodos")
      .select("id")
      .limit(1);

    // Test 2: Check configuracion_constancias table
    const { data: configs, error: configsError } = await adminClient
      .from("configuracion_constancias")
      .select("id")
      .limit(1);

    return NextResponse.json({
      success: true,
      tests: {
        periodos: {
          ok: !periodosError,
          error: periodosError?.message || null,
          count: periodos?.length ?? 0,
        },
        configuracion_constancias: {
          ok: !configsError,
          error: configsError?.message || null,
          count: configs?.length ?? 0,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }, { status: 500 });
  }
}
