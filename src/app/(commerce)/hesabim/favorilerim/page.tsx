import Link from "next/link";

// MVP: client-side wishlist (zustand persist) is already wired. A future
// version will sync to the Wishlist Prisma model when the user is logged in
// (T+1 in Phase D). For now, the layout entry is visible but the page
// invites the user to browse — the bottom-tab wishlist surface is in
// Phase F polish.

export default function WishlistPage() {
  return (
    <div className="space-y-3 text-sm">
      <h2 className="text-base font-semibold">Favorilerim</h2>
      <p className="text-ink-muted">
        Beğendiğiniz ürünleri favorilere ekleyerek saklayabilirsiniz.{" "}
        <Link href="/urunler" className="text-brand hover:underline">
          Ürünlere göz at
        </Link>
        .
      </p>
      <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
        Server-side senkronlama Phase D+1&apos;de eklenecek — şu an favoriler
        sadece bu cihazda saklanıyor.
      </p>
    </div>
  );
}
