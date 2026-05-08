import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren auth
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/sobre-nosotros") ||
    path.startsWith("/ayuda") ||
    path.startsWith("/contacto") ||
    path.startsWith("/auth/callback");

  // Solo redirigir desde rutas de auth si ya está logueado
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password");

  if (isPublicRoute) {
    // Si está en ruta de auth y ya está logueado, redirigir a su panel
    if (user && isAuthRoute) {
      let role = user.user_metadata?.rol;
      if (!role) {
        const { data: dbUser } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id", user.id)
          .single();
        role = dbUser?.rol || "ESTUDIANTE";
      }

      if (role === "ADMIN_OFICINA") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "RESPONSABLE_TALLER") return NextResponse.redirect(new URL("/encargado", request.url));
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Permitir acceso a otras rutas públicas sin redirigir
    return supabaseResponse;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Consultar rol desde la tabla usuarios (fuente de verdad)
  let role = user.user_metadata?.rol;
  if (!role) {
    const { data: dbUser } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", user.id)
      .single();
    role = dbUser?.rol || "ESTUDIANTE";
  }

  if (path.startsWith("/admin") && role !== "ADMIN_OFICINA") {
    return NextResponse.redirect(new URL(role === "RESPONSABLE_TALLER" ? "/encargado" : "/dashboard", request.url));
  }
  if (path.startsWith("/encargado") && role !== "RESPONSABLE_TALLER") {
    return NextResponse.redirect(new URL(role === "ADMIN_OFICINA" ? "/admin" : "/dashboard", request.url));
  }
  if (path.startsWith("/dashboard") && role !== "ESTUDIANTE") {
    return NextResponse.redirect(new URL(role === "ADMIN_OFICINA" ? "/admin" : "/encargado", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
