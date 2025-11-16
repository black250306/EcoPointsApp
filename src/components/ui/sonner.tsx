"use client";

import * as React from "react";
// ----------------------------------------------------
// ✅ CORRECCIÓN 1: Quitar @0.4.6
import { useTheme } from "next-themes"; 

// ✅ CORRECCIÓN 2: Quitar @2.0.3
import { Toaster as Sonner, ToasterProps } from "sonner";
// ----------------------------------------------------
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
