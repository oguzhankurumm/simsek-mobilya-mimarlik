import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

// Legal/site identity bundle, cached for 5 minutes. Used by the footer + the
// legal pages so VKN/MERSIS/ETBİS surface where Turkish distance-selling
// regulation requires them. Falls back to safe blanks when DB is unreachable.

export interface PublicSiteSettings {
  siteName: string;
  vkn: string;
  mersisNo: string;
  etbisNo: string;
  legalAddress: string;
  whatsappFloatNumber: string;
  freeShippingThresholdKurus: number;
  maintenanceMode: boolean;
}

const DEFAULTS: PublicSiteSettings = {
  siteName: "Şimşek Mobilya & Mimarlık",
  vkn: "",
  mersisNo: "",
  etbisNo: "",
  legalAddress: "",
  whatsappFloatNumber: "",
  freeShippingThresholdKurus: 500_000, // 5.000 TL
  maintenanceMode: false,
};

export const getPublicSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const s = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
      });
      if (!s) return DEFAULTS;
      return {
        siteName: s.siteName,
        vkn: s.vkn,
        mersisNo: s.mersisNo,
        etbisNo: s.etbisNo,
        legalAddress: s.legalAddress,
        whatsappFloatNumber: s.whatsappFloatNumber,
        freeShippingThresholdKurus: Math.round(
          Number(s.freeShippingThreshold.toString()) * 100,
        ),
        maintenanceMode: s.maintenanceMode,
      };
    } catch {
      return DEFAULTS;
    }
  },
  ["site-settings"],
  { revalidate: 300, tags: ["site-settings"] },
);
