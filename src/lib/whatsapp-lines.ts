import "server-only";
import { prisma } from "./prisma";

export interface PublicWhatsappLine {
  id: string;
  label: string;
  number: string;
  numberE164: string;
}

export const MOCK_WHATSAPP_LINE: PublicWhatsappLine = {
  id: "demo-whatsapp",
  label: "Sipariş Hattı",
  number: "+90 532 646 39 19",
  numberE164: "+905326463919",
};

export async function getActiveWhatsappLine(): Promise<PublicWhatsappLine | null> {
  try {
    const row = await prisma.whatsappLine.findFirst({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });
    if (!row) return MOCK_WHATSAPP_LINE;
    return {
      id: row.id,
      label: row.label,
      number: row.number,
      numberE164: row.numberE164,
    };
  } catch {
    return MOCK_WHATSAPP_LINE;
  }
}
