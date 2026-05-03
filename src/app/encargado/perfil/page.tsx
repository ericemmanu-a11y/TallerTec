import { createClient } from "@/lib/supabase/server";
import { KeyRound, User, Mail, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = { title: "Seguridad | Encargado TallerTec" };

export default async function PerfilEncargadoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nombre = user.user_metadata?.nombre_completo ?? "Encargado";

  async function cambiarPassword(formData: FormData) {
    "use server";
    const sb = await createClient();
    const newPassword = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    if (newPassword !== confirm || newPassword.length < 8) return;
    await sb.auth.updateUser({ password: newPassword });
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Seguridad</h1>
        <p className="text-muted-foreground mt-1">Gestiona tu acceso al sistema.</p>
      </div>

      {/* Info */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-accent" /> Información de Cuenta
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium text-sm">{nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Correo institucional</p>
              <p className="font-medium text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="font-medium text-sm">Responsable de Taller</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
          <KeyRound className="w-5 h-5 text-accent" /> Cambiar Contraseña
        </h3>
        <form action={cambiarPassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Nueva Contraseña</label>
            <input type="password" name="password" minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Confirmar Contraseña</label>
            <input type="password" name="confirm" minLength={8} required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Repite la contraseña" />
          </div>
          <button type="submit"
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
