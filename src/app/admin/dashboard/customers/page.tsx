import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersAdminPage() {
  const customers = await prisma.user
    .findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      take: 200,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Kayıtlı Müşteriler
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Müşteriler
          {customers.length > 0 ? (
            <span className="ml-2 text-sm font-normal text-zinc-500 tabular-nums">
              ({customers.length})
            </span>
          ) : null}
        </h1>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {customers.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Henüz kayıtlı müşteri yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-[10px] uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Ad Soyad</th>
                <th className="px-4 py-2.5">E-posta</th>
                <th className="px-4 py-2.5">Telefon</th>
                <th className="px-4 py-2.5">Sipariş</th>
                <th className="px-4 py-2.5">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/dashboard/customers/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                    <a
                      href={`mailto:${c.email}`}
                      className="hover:underline"
                    >
                      {c.email}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {c._count.orders}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {c.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
