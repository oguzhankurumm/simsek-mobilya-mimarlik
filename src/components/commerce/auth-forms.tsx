"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(1, "Şifre zorunludur"),
});

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta giriniz"),
  phone: z.string().optional(),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

const fieldStyles =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function LoginForm({
  isAdmin = false,
  redirectTo = "/hesabim",
}: {
  isAdmin?: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, admin: isAdmin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Giriş başarısız");
      return;
    }
    toast.success("Hoş geldiniz");
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          E-posta
        </span>
        <input
          type="email"
          autoComplete="email"
          className={fieldStyles}
          {...register("email")}
        />
        {errors.email ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.email.message}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Şifre
        </span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={cn(fieldStyles, "pr-10")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-muted hover:text-ink"
            aria-label={showPassword ? "Gizle" : "Göster"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.password.message}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {isSubmitting ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>

      {!isAdmin ? (
        <div className="flex justify-between text-xs text-ink-muted">
          <Link href="/sifremi-unuttum" className="hover:text-brand">
            Şifremi unuttum
          </Link>
          <Link href="/kayit" className="hover:text-brand">
            Hesabın yok mu?
          </Link>
        </div>
      ) : null}
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Kayıt başarısız");
      return;
    }
    toast.success("Hesap oluşturuldu");
    router.replace("/hesabim");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Ad Soyad
        </span>
        <input
          autoComplete="name"
          className={fieldStyles}
          {...register("name")}
        />
        {errors.name ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.name.message}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          E-posta
        </span>
        <input
          type="email"
          autoComplete="email"
          className={fieldStyles}
          {...register("email")}
        />
        {errors.email ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.email.message}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Telefon (opsiyonel)
        </span>
        <input
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+90 5xx xxx xx xx"
          className={fieldStyles}
          {...register("phone")}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          Şifre
        </span>
        <input
          type="password"
          autoComplete="new-password"
          className={fieldStyles}
          {...register("password")}
        />
        {errors.password ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.password.message}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {isSubmitting ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
      </button>

      <p className="text-center text-xs text-ink-muted">
        Hesabın var mı?{" "}
        <Link href="/giris" className="text-brand hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string }>();

  async function onSubmit(values: { email: string }) {
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSent(true);
    toast.success("Kod gönderildi (varsa e-postanıza)");
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-ink-muted">
          Eğer bu e-posta sistemde kayıtlıysa, 6 haneli sıfırlama kodu
          gönderildi. 15 dakika içinde geçerli.
        </p>
        <Link
          href="/giris"
          className="inline-block text-sm text-brand hover:underline"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wide text-ink-muted">
          E-posta
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          className={fieldStyles}
          {...register("email")}
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {isSubmitting ? "Gönderiliyor…" : "Sıfırlama Kodu Gönder"}
      </button>
    </form>
  );
}
