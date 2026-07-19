"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/components/toast";

type Props = {
  mode: "login" | "register";
  action: (formData: FormData) => Promise<{ error?: string }>;
};

export function AuthForm({ mode, action }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      toast(result.error, "error");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">{mode === "login" ? "Masuk" : "Daftar"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Masuk untuk mengelola kendaraan Anda."
            : "Buat akun untuk mulai menggunakan Trayekin."}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" placeholder="Nama Anda" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contoh@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required minLength={6} />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <Link href="/register" className="underline font-medium hover:text-foreground transition-colors">Daftar</Link>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <Link href="/login" className="underline font-medium hover:text-foreground transition-colors">Masuk</Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
