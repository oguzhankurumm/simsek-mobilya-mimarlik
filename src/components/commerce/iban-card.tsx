"use client";

import { useState } from "react";
import { Copy, Check, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface IbanCardData {
  id: string;
  title: string;
  bankName: string;
  accountHolder: string;
  ibanNumber: string;
}

interface IbanCardProps {
  iban: IbanCardData;
  selected: boolean;
  onSelect: () => void;
}

export function IbanCard({ iban, selected, onSelect }: IbanCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const plain = iban.ibanNumber.replace(/\s+/g, "");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(plain)
        .then(() => {
          setCopied(true);
          toast.success("IBAN kopyalandı");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() =>
          toast.error("Kopyalanamadı — manuel seçip kopyalayabilirsiniz"),
        );
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex w-full flex-col gap-2 rounded-2xl border-2 px-4 py-4 text-left transition-colors",
        selected
          ? "border-brand bg-brand/5"
          : "border-border bg-background hover:border-ink/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-ink-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {iban.bankName}
            </span>
            <span className="text-xs text-ink-muted">
              {iban.accountHolder}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-brand bg-brand" : "border-border bg-background",
          )}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-background" />
          ) : null}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="font-mono text-xs tabular-nums text-ink">
          {iban.ibanNumber}
        </span>
        <span
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          aria-label="IBAN kopyala"
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-ink-muted transition-colors hover:bg-surface-2",
            copied && "border-emerald-500 text-emerald-700 dark:text-emerald-400",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Kopyalandı
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Kopyala
            </>
          )}
        </span>
      </div>
    </button>
  );
}
