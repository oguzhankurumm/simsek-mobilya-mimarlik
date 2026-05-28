import { SITE } from "@/config/site";
import { kurusToTl } from "@/lib/money";
import type { PublicProduct } from "@/lib/products";

interface ProductJsonLdProps {
  product: PublicProduct;
}

// schema.org Product + Offer JSON-LD. Lets Google Shopping + rich snippets
// pick up the catalog without an external feed. We expose price as a
// 2-decimal TL string (schema.org prefers strings to avoid float ambiguity)
// and use schema.org/InStock / OutOfStock for availability — Google maps
// these to the merchant-feed status field automatically.

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const url = `${SITE.url}/urunler/${product.slug}`;
  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — ${product.categoryName}`,
    image: product.images.map((img) => img.url).filter(Boolean),
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand || SITE.shortName },
    category: product.categoryName,
    ...(product.material.length > 0
      ? { material: product.material.join(", ") }
      : {}),
    ...(product.color.length > 0
      ? { color: product.color.join(", ") }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: kurusToTl(product.salePriceKurus).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.legalName },
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD MUST go in an inline script for crawlers to pick it up. Next's
      // <Script> + JSX text breaks the structured data because React escapes
      // entities and trailing whitespace. Inline + dangerouslySetInnerHTML is
      // the recommended Google/Next.js pattern — we sanitize via safeJsonLd()
      // which escapes `</script>`, `<!--`, and Unicode line separators that
      // could otherwise break out of the script tag.
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

// JSON-LD serializer that survives being inlined into <script>. Strips the
// attack vectors that could break out of the script context:
//   - `<`, `>`, `&` → \uXXXX escapes (defangs `</script>` + `<!--`)
//   - U+2028 / U+2029 (line / paragraph separator), illegal in JS string
//     literals but allowed in JSON — older parsers can choke.
// Built with `new RegExp("\\u2028", "g")` rather than a regex literal so the
// source file stays ASCII and grep-friendly.
const LINE_SEP_RE = new RegExp("\\u2028", "g");
const PARA_SEP_RE = new RegExp("\\u2029", "g");

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP_RE, "\\u2028")
    .replace(PARA_SEP_RE, "\\u2029");
}
