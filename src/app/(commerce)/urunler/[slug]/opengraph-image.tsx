import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/money";
import { SITE } from "@/config/site";

export const runtime = "nodejs";
export const alt = "Şimşek Mobilya — Ürün";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic OpenGraph image for each PDP. WhatsApp, Twitter, FB, LinkedIn
// hit /urunler/[slug]/opengraph-image when they preview a shared link.
// Render product cover + name + price + brand chip on the editorial card
// background so previews match the site's visual language.

export default async function ProductOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#FAFAF7",
            color: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-sans-serif",
            fontSize: 48,
            letterSpacing: -0.5,
          }}
        >
          {SITE.name}
        </div>
      ),
      size,
    );
  }

  const image = product.images[0]?.url ?? "";
  const price = formatPrice(product.salePriceKurus);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          display: "flex",
          alignItems: "stretch",
          fontFamily: "ui-sans-serif",
          color: "#111",
        }}
      >
        <div
          style={{
            flex: "0 0 50%",
            background: "#EFEAE0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              width={600}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ fontSize: 24, color: "#999" }}>—</div>
          )}
        </div>

        <div
          style={{
            flex: "1 1 50%",
            padding: "64px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                background: "#ED1C24",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#666",
              }}
            >
              {SITE.shortName}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              fontFamily: "serif",
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#999",
                fontFamily: "ui-sans-serif",
              }}
            >
              {product.categoryName}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 600,
                letterSpacing: -1,
                lineHeight: 1.05,
                color: "#1a1a1a",
              }}
            >
              {product.name.length > 60
                ? product.name.slice(0, 58) + "…"
                : product.name}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              borderTop: "1px solid #E5E0D5",
              paddingTop: 24,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: -0.5,
              }}
            >
              {price}
            </div>
            <div style={{ fontSize: 14, color: "#999" }}>KDV dahil</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
