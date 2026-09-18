import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D93F46",
          dark: "#AC2A29",
          soft: "#FDECEC",
        },
        navy: "#111827",
        page: "#F7F8FA",
        ink: "#172033",
        muted: "#667085",
        line: "#E5E7EB",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        post: "#F5B400",
        "post-dark": "#E09B00",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.05)",
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        fab: "0 6px 16px rgba(217,63,70,0.35)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
