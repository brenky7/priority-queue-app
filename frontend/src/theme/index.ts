import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#E6FFFA" },
          100: { value: "#B2F5EA" },
          200: { value: "#81E6D9" },
          300: { value: "#4FD1C5" },
          400: { value: "#38B2AC" },
          500: { value: "#319795" },
          600: { value: "#2C7A7B" },
          700: { value: "#285E61" },
          800: { value: "#234E52" },
          900: { value: "#1D4044" },
        },
        priority: {
          high: { value: "#F56565" },
          medium: { value: "#ED8936" },
          low: { value: "#ECC94B" },
          completed: { value: "#48BB78" },
        },
      },
    },

    semanticTokens: {
      colors: {
        appBg: {
          value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" },
        },
        appFg: {
          value: { base: "{colors.gray.800}", _dark: "{colors.gray.100}" },
        },
        cardBorder: {
          value: { base: "{colors.gray.200}", _dark: "{colors.gray.600}" },
        },
        cardBg: {
          value: { base: "{colors.gray.50}", _dark: "{colors.gray.800}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
export default system;
