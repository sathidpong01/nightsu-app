import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-bg": "var(--brand-bg)",
        "brand-surface": "var(--brand-surface)",
        "brand-muted": "var(--brand-muted)",
        "brand-border": "var(--brand-border)",
        "brand-text": "var(--brand-text)",
        "brand-subtext": "var(--brand-subtext)",
        "brand-primary": "var(--brand-primary)",
        "brand-secondary": "var(--brand-secondary)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 6px 16px rgba(0,0,0,.25)",
      },
    },
  },
  plugins: [],
};

export default config;
