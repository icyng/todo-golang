import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["\"Space Grotesk\"", "\"Plus Jakarta Sans\"", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        surface: "#111827",
        card: "#1f2937",
        accent: "#38bdf8",
        accentMuted: "#0ea5e9",
        success: "#10b981",
        danger: "#f43f5e",
      },
      boxShadow: {
        glow: "0 12px 30px rgba(2, 6, 23, 0.25)",
      },
    },
  },
  plugins: [],
};
