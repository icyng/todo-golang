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
        surface: "#0f172a",
        card: "#0b1624",
        accent: "#22d3ee",
        accentMuted: "#0ea5e9",
        success: "#10b981",
        danger: "#f43f5e",
      },
      boxShadow: {
        glow: "0 12px 40px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
