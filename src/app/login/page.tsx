import { signIn } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm
        mode="login"
        action={async (formData) => {
          "use server";
          try {
            await signIn("credentials", {
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              redirect: false,
            });
            return {};
          } catch {
            return { error: "Email atau password salah." };
          }
        }}
      />
    </main>
  );
}
