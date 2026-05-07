import Script from "next/script";

interface JsonLdProps<T> {
  data: T;
  id?: string;
}

export function JsonLd<T extends object>({ data, id }: JsonLdProps<T>) {
  // Escape `<` to neutralize any accidental `</script>` sequences in nested
  // strings — robust against XSS even if a future caller forwards user input.
  const safe = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <Script id={id ?? "ld-json"} type="application/ld+json" strategy="afterInteractive">
      {safe}
    </Script>
  );
}
