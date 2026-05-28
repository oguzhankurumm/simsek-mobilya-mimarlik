"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import {
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  selectCartItems,
  selectSavingsKurus,
  selectTotalKurus,
  useCartStore,
} from "@/lib/store/cart";
import { formatPrice, kurusToTl } from "@/lib/money";
import {
  IDEMPOTENCY_HEADER,
  generateClientIdempotencyKey,
} from "@/lib/idempotency";
import {
  buildOrderReceiptMessage,
  buildWhatsappUrl,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { IbanCard, type IbanCardData } from "@/components/commerce/iban-card";
import type { PublicWhatsappLine } from "@/lib/whatsapp-lines";

const STEPS = ["Sepet Özeti", "Ödeme Bilgileri", "Dekont Gönder"] as const;

interface CheckoutFlowProps {
  ibans: IbanCardData[];
  whatsapp: PublicWhatsappLine | null;
}

export function CheckoutFlow({ ibans, whatsapp }: CheckoutFlowProps) {
  const router = useRouter();

  const { items, totalKurus, savingsKurus } = useCartStore(
    useShallow((s) => ({
      items: selectCartItems(s),
      totalKurus: selectTotalKurus(s),
      savingsKurus: selectSavingsKurus(s),
    })),
  );
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Idempotency key persists across the session so retry after a network
  // glitch returns the same order instead of creating a duplicate. Cleared
  // on Step 3.
  const [idempotencyKey] = useState(() => generateClientIdempotencyKey());

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIbanId, setSelectedIbanId] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(
    null,
  );

  const cartItems = mounted ? items : [];
  const displayTotal = mounted ? totalKurus : 0;
  const displaySavings = mounted ? savingsKurus : 0;
  const subtotal = displayTotal + displaySavings;

  async function handleSubmitOrder() {
    if (!selectedIbanId) {
      setSubmitError("Lütfen ödeme yapacağınız IBAN'ı seçin.");
      return;
    }
    if (!acceptTerms) {
      setSubmitError(
        "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme onayı zorunludur.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [IDEMPOTENCY_HEADER]: idempotencyKey,
        },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          ibanId: selectedIbanId,
          whatsappLineId: whatsapp?.id ?? null,
          acceptedTerms: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error ?? "Sipariş oluşturulamadı, tekrar deneyin.",
        );
      }

      const created = (await res.json()) as { orderNumber: string };
      setCreatedOrderNumber(created.orderNumber);
      setCurrentStep(3);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="container mx-auto max-w-xl px-4 py-8 md:py-12">
      <StepIndicator current={currentStep} />

      <div className="mt-6 rounded-2xl border border-border bg-background p-5 shadow-sm md:p-7">
        {currentStep === 1 ? (
          <Step1
            cartItems={cartItems}
            subtotal={subtotal}
            savings={displaySavings}
            total={displayTotal}
            onNext={() => setCurrentStep(2)}
          />
        ) : null}

        {currentStep === 2 ? (
          <Step2
            ibans={ibans}
            selectedIbanId={selectedIbanId}
            onSelectIban={(id) => {
              setSelectedIbanId(id);
              setSubmitError(null);
            }}
            acceptTerms={acceptTerms}
            onToggleTerms={(v) => {
              setAcceptTerms(v);
              setSubmitError(null);
            }}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmitOrder}
            onBack={() => setCurrentStep(1)}
            total={displayTotal}
          />
        ) : null}

        {currentStep === 3 && createdOrderNumber ? (
          <Step3
            orderNumber={createdOrderNumber}
            whatsapp={whatsapp}
            cartItems={cartItems}
            total={displayTotal}
            onFinish={() => {
              clearCart();
              router.push("/");
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-brand text-white"
                    : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-surface-2 text-ink-muted",
                )}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium uppercase tracking-wide sm:block",
                  isActive
                    ? "text-brand"
                    : isDone
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mx-1 h-0.5 w-12 sm:w-20",
                  isDone ? "bg-emerald-500" : "bg-surface-2",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ─────── Step 1 ───────
type CartLine = ReturnType<typeof selectCartItems>[number];

function Step1({
  cartItems,
  subtotal,
  savings,
  total,
  onNext,
}: {
  cartItems: CartLine[];
  subtotal: number;
  savings: number;
  total: number;
  onNext: () => void;
}) {
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <Package className="h-12 w-12 text-ink-faint" />
        <p className="text-base font-medium">Sepetiniz boş.</p>
        <Link
          href="/urunler"
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Ürünlere Göz At
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Sipariş Özeti</h2>
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
        {cartItems.map(({ product, quantity }) => (
          <li key={product.id} className="flex gap-3 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
              <Image
                src={product.image || "/placeholder-product.svg"}
                alt={product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center text-sm">
              <p className="line-clamp-1 font-medium">{product.name}</p>
              <p className="text-xs text-ink-muted">
                {formatPrice(product.salePriceKurus)} × {quantity} adet
              </p>
            </div>
            <span className="self-center text-sm font-semibold tabular-nums">
              {formatPrice(product.salePriceKurus * quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Ara Toplam</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {savings > 0 ? (
          <div className="mt-1 flex justify-between">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Toplam Tasarruf
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              − {formatPrice(savings)}
            </span>
          </div>
        ) : null}
        <hr className="my-2 border-border" />
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">Ödenecek Toplam</span>
          <span className="text-lg font-bold tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-ink-faint">KDV dahildir.</p>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand/90"
      >
        Ödemeye Geç →
      </button>
    </div>
  );
}

// ─────── Step 2 ───────
function Step2({
  ibans,
  selectedIbanId,
  onSelectIban,
  acceptTerms,
  onToggleTerms,
  isSubmitting,
  submitError,
  onSubmit,
  onBack,
  total,
}: {
  ibans: IbanCardData[];
  selectedIbanId: string | null;
  onSelectIban: (id: string) => void;
  acceptTerms: boolean;
  onToggleTerms: (v: boolean) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
  onBack: () => void;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Ödeme Bilgileri</h2>

      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Ödeme açıklamasına sipariş numaranızı yazınız. Tutar:{" "}
          <strong className="tabular-nums">{formatPrice(total)}</strong>.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-ink-faint">
          Ödeme yapacağınız hesabı seçin
        </p>
        <div className="flex flex-col gap-2.5">
          {ibans.map((iban) => (
            <IbanCard
              key={iban.id}
              iban={iban}
              selected={selectedIbanId === iban.id}
              onSelect={() => onSelectIban(iban.id)}
            />
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => onToggleTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
        />
        <span className="text-ink-muted leading-relaxed">
          {" "}
          <Link
            href="/mesafeli-satis-sozlesmesi"
            target="_blank"
            className="text-brand underline"
          >
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link
            href="/iade-politikasi"
            target="_blank"
            className="text-brand underline"
          >
            Ön Bilgilendirme
          </Link>{" "}
          metinlerini okudum, onaylıyorum.
        </span>
      </label>

      {submitError ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {submitError}
        </p>
      ) : null}

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-opacity hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sipariş oluşturuluyor…" : "Ödemeyi Yaptım →"}
      </button>
      <p className="text-center text-[10px] text-ink-faint">
        Bu buton ödeme yükümlülüğü doğurur.
      </p>
      <button
        onClick={onBack}
        className="w-full text-xs text-ink-muted hover:text-ink"
      >
        ← Sepete Dön
      </button>
    </div>
  );
}

// ─────── Step 3 ───────
function Step3({
  orderNumber,
  whatsapp,
  cartItems,
  total,
  onFinish,
}: {
  orderNumber: string;
  whatsapp: PublicWhatsappLine | null;
  cartItems: CartLine[];
  total: number;
  onFinish: () => void;
}) {
  const message = buildOrderReceiptMessage({
    orderNumber,
    totalTl: formatPrice(total),
    items: cartItems.map((c) => ({
      name: c.product.name,
      quantity: c.quantity,
      unitPriceTl: formatPrice(c.product.salePriceKurus * c.quantity),
    })),
  });

  const waHref = whatsapp
    ? buildWhatsappUrl(whatsapp.numberE164, message)
    : "#";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 py-2">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h2 className="text-center text-xl font-semibold tracking-tight">
          Siparişiniz alındı.
        </h2>
        <p className="text-center text-sm text-ink-muted">
          Son adım: ödeme dekontunuzu WhatsApp&apos;tan gönderin. Hemen
          sonra ekibimiz sipariş onayını paylaşır.
        </p>
      </div>

      <div className="rounded-xl border-2 border-brand bg-brand/5 px-4 py-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted">
          Sipariş Numaranız
        </p>
        <p className="mt-1 text-2xl font-bold tracking-wider text-brand tabular-nums">
          {orderNumber}
        </p>
      </div>

      {whatsapp ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-sm font-semibold text-white shadow-lg transition-transform hover:bg-[#1ebe5d] active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          Dekontu WhatsApp&apos;tan Gönder
        </a>
      ) : (
        <p className="text-center text-sm text-red-700">
          WhatsApp hattı tanımlı değil — info@simsekmobilya.com adresine
          dekontu gönderebilirsiniz.
        </p>
      )}

      <div className="rounded-xl border border-border bg-surface-2/40 px-4 py-3 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">Toplam ürün</span>
          <span className="tabular-nums">
            {cartItems.reduce((s, i) => s + i.quantity, 0)} adet
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-ink-muted">Ödenecek tutar</span>
          <span className="font-semibold tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-background hover:bg-ink/90"
      >
        Yeni Alışveriş Yap
      </button>
    </div>
  );
}

// Silence the unused warning — kurusToTl is exported and may be needed later.
void kurusToTl;
