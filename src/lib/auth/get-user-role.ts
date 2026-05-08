import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserRole = "ESTUDIANTE" | "RESPONSABLE_TALLER" | "ADMIN_OFICINA";

export interface AuthUser {
  id: string;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  numero_control?: string | null;
  carrera?: string | null;
  semestre?: number | null;
  telefono?: string | null;
}

/**
 * Obtiene el usuario autenticado con su rol verificado desde la tabla usuarios.
 * Esta es la fuente de verdad para el rol, no user_metadata.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Use admin client to query usuarios table (bypasses RLS)
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    // Fallback to metadata if admin client not configured
    return {
      id: user.id,
      email: user.email!,
      nombre_completo: user.user_metadata?.nombre_completo || user.email!,
      rol: (user.user_metadata?.rol as UserRole) || "ESTUDIANTE",
      numero_control: user.user_metadata?.numero_control,
      carrera: user.user_metadata?.carrera,
      semestre: user.user_metadata?.semestre,
      telefono: user.user_metadata?.telefono,
    };
  }

  // Consultar el rol desde la tabla usuarios (fuente de verdad)
  const { data: dbUser } = await adminClient
    .from("usuarios")
    .select("id, email, nombre_completo, rol, numero_control, carrera, semestre, telefono")
    .eq("id", user.id)
    .single();

  if (!dbUser) {
    // Usuario en auth pero no en tabla usuarios - usar metadata como fallback
    return {
      id: user.id,
      email: user.email!,
      nombre_completo: user.user_metadata?.nombre_completo || user.email!,
      rol: (user.user_metadata?.rol as UserRole) || "ESTUDIANTE",
      numero_control: user.user_metadata?.numero_control,
      carrera: user.user_metadata?.carrera,
      semestre: user.user_metadata?.semestre,
      telefono: user.user_metadata?.telefono,
    };
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    nombre_completo: dbUser.nombre_completo,
    rol: dbUser.rol as UserRole,
    numero_control: dbUser.numero_control,
    carrera: dbUser.carrera,
    semestre: dbUser.semestre,
    telefono: dbUser.telefono,
  };
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getAuthUser();
  return user?.rol === requiredRole;
}

/**
 * Obtiene el usuario o redirige si no está autenticado
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return user;
}

/**
 * Obtiene el usuario con rol específico o redirige
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  if (user.rol !== requiredRole) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
