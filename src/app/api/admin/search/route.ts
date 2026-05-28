import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export const runtime = "nodejs";

// Powers the Cmd+K admin command palette. Searches across orders, products,
// and customers in a single round-trip; returns up to 5 hits per kind.

export async function GET(req: Request) {
  const admin = await getCurrentUser({ admin: true });
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ orders: [], products: [], customers: [] });

  try {
    const [orders, products, customers] = await Promise.all([
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { guestName: { contains: q, mode: "insensitive" } },
            { guestEmail: { contains: q, mode: "insensitive" } },
            { guestPhone: { contains: q, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          ],
        },
        select: {
          orderNumber: true,
          status: true,
          createdAt: true,
          guestName: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          active: true,
          stock: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({ orders, products, customers });
  } catch {
    return NextResponse.json({ orders: [], products: [], customers: [] });
  }
}
