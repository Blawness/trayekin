import { register } from "@/lib/auth/register";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm mode="register" action={register} />
    </main>
  );
}
