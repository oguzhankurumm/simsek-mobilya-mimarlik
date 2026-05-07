import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name} — ${SITE.taglineTr}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse 70% 60% at 30% 20%, #1c1c1c 0%, #050505 70%)",
          color: "#fafaf7",
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 6,
              height: 64,
              background: "#ED1C24",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              Şimşek
            </span>
            <span
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#a1a1a1",
                fontFamily: "ui-sans-serif, system-ui",
              }}
            >
              Mobilya & Mimarlık
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 80,
              lineHeight: 1.05,
              letterSpacing: -3,
              maxWidth: 920,
              fontWeight: 300,
            }}
          >
            Eviniz, <span style={{ fontStyle: "italic", color: "#ED1C24" }}>atölyemizden.</span>
          </span>
          <span
            style={{
              fontSize: 22,
              color: "#bdbdbd",
              marginTop: 24,
              maxWidth: 720,
              lineHeight: 1.5,
              fontFamily: "ui-sans-serif, system-ui",
            }}
          >
            28 yılı aşkın tecrübe. Özel tasarım mobilya ve mimari proje. İstanbul.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 16,
            color: "#7a7a7a",
            fontFamily: "ui-sans-serif, system-ui",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>simsekmobilya.com</span>
          <span>0 (532) 646 39 19</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
