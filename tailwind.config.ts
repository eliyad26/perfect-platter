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
        brand: {
          50:  "#fdf8f3",
          100: "#f5e8d5",
          200: "#e8c9a0",
          300: "#d4a060",
          400: "#b87a35",
          500: "#8b5520",
          600: "#4a3020",
          700: "#3a2418",
          800: "#2a1a10",
          900: "#1a1008",
        },
        gold: {
          DEFAULT: "#c8963e",
          light: "#e8b86a",
          dark: "#a07030",
        },
        cream: {
          DEFAULT: "#f5efe6",
          warm:    "#fdfaf5",
          blush:   "#ede3d5",
        },
      },
      fontFamily: {
        sans:           ["var(--font-dm-sans)", "var(--font-heebo)", "system-ui", "sans-serif"],
        display:        ["var(--font-bebas)", "Impact", "sans-serif"],
        script:         ["var(--font-dancing)", "cursive"],
        "he-display":   ["var(--font-heebo)", "sans-serif"],
        "he-script":    ["var(--font-frank)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
