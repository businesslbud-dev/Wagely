import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1E2A4E",
        orange: "#E8883C",
        paper: "#F5F7FA",
        slate: "#64748B",
        success: "#2FA84F",
        error: "#DC2F45"
      },
      maxWidth: { "content": "1200px" },
      boxShadow: { "card": "0 1px 2px rgba(15,23,42,.04)" }
    }
  },
  plugins: []
};

export default config;