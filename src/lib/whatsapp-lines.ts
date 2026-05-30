import "server-only";
import { prisma } from "./prisma";
import { DEMO_DATA_ENABLED, logDbFallback } from "./demo-mode";

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
    if (!row) return DEMO_DATA_ENABLED ? MOCK_WHATSAPP_LINE : null;
    return {
      id: row.id,
      label: row.label,
      number: row.number,
      numberE164: row.numberE164,
    };
  } catch (err) {
    logDbFallback("whatsapp-lines", err);
    return DEMO_DATA_ENABLED ? MOCK_WHATSAPP_LINE : null;
  }
}
