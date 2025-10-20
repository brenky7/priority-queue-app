"use client";

import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { system } from "../../theme";

function ChakraThemeRoot({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add("chakra-theme");
    return () => root.classList.remove("chakra-theme");
  }, []);
  return <>{children}</>;
}

export function Provider({
  children,
  ...props
}: React.PropsWithChildren<ColorModeProviderProps>) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider attribute="class" defaultTheme="light" {...props}>
        <ChakraThemeRoot>{children}</ChakraThemeRoot>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
