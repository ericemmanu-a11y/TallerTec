import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("periodos")
    .select("*")
    .order("fecha_inicio", { ascending: false });

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
