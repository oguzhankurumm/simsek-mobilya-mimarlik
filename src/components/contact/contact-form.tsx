"use client";

import { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { contactFormSchema, type ContactFormInput } from "@/lib/contact-schema";
import { submitContactAction } from "@/server/contact-action";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  locale: Locale;
}

const SERVICE_KEYS = ["custom", "architectural", "renovation", "consultancy", "other"] as const;

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations("contact.form");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "custom",
      message: "",
      consent: false as unknown as true,
      website: "",
      locale,
    },
  });

  function onSubmit(values: ContactFormInput) {
    startTransition(async () => {
      const result = await submitContactAction({ ...values, locale });
      if (result.ok) {
        toast.success(t("successTitle"), { description: t("successBody") });
        setDone(true);
        reset();
      } else {
        toast.error(t("errorTitle"), { description: t("errorBody") });
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-surface-1 p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-4 text-display text-2xl tracking-tight">{t("successTitle")}</h3>
        <p className="mt-2 text-ink-muted max-w-md mx-auto leading-relaxed">{t("successBody")}</p>
        <Button
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => setDone(false)}
        >
          {locale === "tr" ? "Yeni mesaj" : "New message"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <h3 className="text-display text-2xl md:text-3xl tracking-tight">{t("title")}</h3>
      <p className="text-ink-muted -mt-2">{t("subtitle")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.name && t(`validation.${errors.name.message}` as never)}>
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input id="name" {...register("name")} placeholder={t("namePlaceholder")} autoComplete="name" />
        </Field>
        <Field error={errors.email && t(`validation.${errors.email.message}` as never)}>
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input id="email" type="email" {...register("email")} placeholder={t("emailPlaceholder")} autoComplete="email" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.phone && t(`validation.${errors.phone.message}` as never)}>
          <Label htmlFor="phone">{t("phoneLabel")}</Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder={t("phonePlaceholder")} autoComplete="tel" />
        </Field>
        <Field>
          <Label htmlFor="service">{t("serviceLabel")}</Label>
          <Controller
            control={control}
            name="service"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="service">
                  <SelectValue placeholder={t("servicePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {t(`serviceOptions.${k}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field error={errors.message && t(`validation.${errors.message.message}` as never)}>
        <Label htmlFor="message">{t("messageLabel")}</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder={t("messagePlaceholder")}
          rows={5}
        />
      </Field>

      {/* Honeypot — must stay empty for non-bots */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {/* KVKK consent — açık rıza zorunlu (form gönderilemez yoksa) */}
      <div className="space-y-1.5 pt-1">
        <label className="flex items-start gap-3 text-sm text-ink-muted leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            {...register("consent")}
            className={cn(
              "mt-1 h-4 w-4 shrink-0 rounded border-border accent-brand cursor-pointer",
              errors.consent && "ring-2 ring-destructive"
            )}
          />
          <span>
            {locale === "tr" ? (
              <>
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-ink underline-offset-2 hover:underline hover:text-brand"
                >
                  KVKK Aydınlatma Metni
                </Link>
                {"'ni okudum, kişisel verilerimin bu kapsamda işlenmesine açık rıza veriyorum."}
              </>
            ) : (
              <>
                {"I have read the "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-ink underline-offset-2 hover:underline hover:text-brand"
                >
                  KVKK / Privacy Notice
                </Link>
                {" and consent to the processing of my personal data."}
              </>
            )}
          </span>
        </label>
        {errors.consent ? (
          <p className="flex items-center gap-1.5 text-xs text-destructive ml-7">
            <AlertCircle className="h-3 w-3" />
            {locale === "tr"
              ? "Devam etmek için onay vermeniz gerekiyor."
              : "Please confirm consent to continue."}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="rounded-full bg-ink text-background hover:bg-ink/85 group h-12 px-6 mt-2"
      >
        <span>{isPending ? t("submitting") : t("submit")}</span>
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </form>
  );
}

function Field({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className={cn("[&>label]:mb-1.5 [&>label]:block", error && "[&_input]:border-destructive [&_textarea]:border-destructive")}>
        {children}
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
