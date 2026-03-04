import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        profit: "#00ff88",
        "profit-muted": "rgba(0, 255, 136, 0.15)",
        loss: "#ff4757",
        "loss-muted": "rgba(255, 71, 87, 0.15)",
        neutral: "#3b82f6",
        "neutral-muted": "rgba(59, 130, 246, 0.15)",
        surface: "#0f1419",
        "surface-card": "#1a2332",
        "surface-elevated": "#243044",
        border: "#2d3a4f",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
