"use client";

import type { PropsWithChildren } from "react";
import { ProgressProvider } from "@bprogress/next/app";

export default function BProgressProvider({ children }: PropsWithChildren) {
  return (
    <ProgressProvider
      disableStyle
      options={{ showSpinner: false }}
      shallowRouting
      disableSameURL
    >
      {children}
    </ProgressProvider>
  );
}
