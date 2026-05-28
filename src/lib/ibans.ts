import "server-only";
import { prisma } from "./prisma";

export interface PublicIban {
  id: string;
  title: string;
  bankName: string;
  accountHolder: string;
  ibanNumber: string;
}

export const MOCK_IBANS: PublicIban[] = [
  {
    id: "demo-iban-1",
    title: "Garanti BBVA",
    bankName: "Garanti BBVA",
    accountHolder: "Şimşek Mobilya & Mimarlık",
    ibanNumber: "TR00 0000 0000 0000 0000 0000 00",
  },
  {
    id: "demo-iban-2",
    title: "İş Bankası",
    bankName: "Türkiye İş Bankası",
    accountHolder: "Şimşek Mobilya & Mimarlık",
    ibanNumber: "TR11 1111 1111 1111 1111 1111 11",
  },
];

export async function getActiveIbans(): Promise<PublicIban[]> {
  try {
    const rows = await prisma.iban.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });
    if (rows.length === 0) return MOCK_IBANS;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      bankName: r.bankName,
      accountHolder: r.accountHolder,
      ibanNumber: r.ibanNumber,
    }));
  } catch {
    return MOCK_IBANS;
  }
}
