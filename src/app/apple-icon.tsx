import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ED1C24",
          fontWeight: 800,
          fontSize: 110,
          fontFamily: "ui-serif, Georgia, serif",
          letterSpacing: -6,
        }}
      >
        Ş
        <div
          style={{
            marginTop: 6,
            height: 4,
            width: 56,
            background: "#ED1C24",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
