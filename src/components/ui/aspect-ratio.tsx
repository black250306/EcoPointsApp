"use client";

import * as React from "react";
// ----------------------------------------------------
// ✅ CORRECCIÓN: Quitar @1.1.2
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"; 
// ----------------------------------------------------

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };