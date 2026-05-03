import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register") || path === "/";
  
  if (isAuthRoute) {
    if (user) {
      // Redirigir basado en el rol si ya está autenticado
      const role = user.user_metadata?.rol || 'ESTUDIANTE';
      if (role === 'ADMIN_OFICINA') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'RESPONSABLE_TALLER') return NextResponse.redirect(new URL('/encargado', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // Proteger las rutas privadas
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // RBAC: Control de Acceso Basado en Roles
  const role = user.user_metadata?.rol || 'ESTUDIANTE';

  if (path.startsWith('/admin') && role !== 'ADMIN_OFICINA') {
    return NextResponse.redirect(new URL(role === 'RESPONSABLE_TALLER' ? '/encargado' : '/dashboard', request.url));
  }

  if (path.startsWith('/encargado') && role !== 'RESPONSABLE_TALLER') {
    return NextResponse.redirect(new URL(role === 'ADMIN_OFICINA' ? '/admin' : '/dashboard', request.url));
  }

  if (path.startsWith('/dashboard') && role !== 'ESTUDIANTE') {
    return NextResponse.redirect(new URL(role === 'ADMIN_OFICINA' ? '/admin' : '/encargado', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
