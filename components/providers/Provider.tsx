"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import QueryProvider from "../container/TanStackQueryProvider";
import LenisLayout from "../common/LenisLayout";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <LenisLayout>
        <QueryProvider>{children}</QueryProvider>
      </LenisLayout>
    </NextThemesProvider>
  );
}
