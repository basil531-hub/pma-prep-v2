import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        primary: { DEFAULT: "#14532d", foreground: "#ffffff" },
        accent: "#d4a72c",
      },
      boxShadow: { card: "0 12px 32px rgba(15, 23, 42, .07)" },
    },
  },
  plugins: [],
} satisfies Config;
