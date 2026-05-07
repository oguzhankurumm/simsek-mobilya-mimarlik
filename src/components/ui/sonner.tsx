"use client";

import { Toaster as SonnerToaster } from "sonner";
import type { ComponentProps } from "react";
import { useTheme } from "next-themes";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !text-foreground !border !border-border !shadow-elevated !rounded-xl",
          description: "!text-muted-foreground",
          success: "!text-success",
          error: "!text-destructive",
        },
      }}
      {...props}
    />
  );
}
