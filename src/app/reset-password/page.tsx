import ResetPasswordForm from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nueva Contraseña | TallerTec",
  description: "Establece una nueva contraseña para tu cuenta TallerTec",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="w-full relative z-10">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
