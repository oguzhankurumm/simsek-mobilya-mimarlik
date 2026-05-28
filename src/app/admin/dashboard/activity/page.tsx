import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  ORDER_STATUS_PATCH: "Sipariş durumu değiştirildi",
  ORDER_BULK_PATCH: "Toplu sipariş güncellemesi",
  ORDER_RECEIPT_PATCH: "Sipariş dekontu güncellendi",
  PRODUCT_CREATE: "Ürün eklendi",
  PRODUCT_PATCH: "Ürün güncellendi",
  PRODUCT_DELETE: "Ürün silindi",
  PRODUCT_BULK: "Toplu ürün işlemi",
  PRODUCT_NOTIFY_STOCK: "Stok bildirimleri gönderildi",
  CATEGORY_CREATE: "Kategori eklendi",
  CATEGORY_PATCH: "Kategori güncellendi",
  CATEGORY_DELETE: "Kategori silindi",
  IBAN_CREATE: "IBAN eklendi",
  IBAN_PATCH: "IBAN güncellendi",
  IBAN_DELETE: "IBAN silindi",
  WHATSAPP_CREATE: "WhatsApp hattı eklendi",
  WHATSAPP_PATCH: "WhatsApp hattı güncellendi",
  WHATSAPP_DELETE: "WhatsApp hattı silindi",
  HERO_CREATE: "Hero slide eklendi",
  HERO_PATCH: "Hero slide güncellendi",
  HERO_DELETE: "Hero slide silindi",
  SETTINGS_PATCH: "Ayarlar güncellendi",
};

export default async function ActivityPage() {
  const logs = await prisma.auditLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Son 200 Kayıt
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Aktivite Günlüğü
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Yöneticilerin yaptığı tüm önemli değişiklikler buraya kaydedilir.
        </p>
      </header>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Henüz kayıt yok.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {logs.map((log) => (
            <li key={log.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {ACTION_LABEL[log.action] ?? log.action}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {log.adminEmail}
                    {log.resourceId ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-mono">
                          {log.resource}/{log.resourceId.slice(0, 10)}
                        </span>
                      </>
                    ) : null}
                    {log.ip ? <> · {log.ip}</> : null}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {log.createdAt.toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              {log.detail ? (
                <pre className="mt-2 overflow-x-auto rounded bg-zinc-50 px-2 py-1 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {log.detail}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
