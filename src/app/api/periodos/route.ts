import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("periodos")
      .select("*")
      .order("fecha_inicio", { ascending: false });

    if (error) return NextResponse.json([], { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
