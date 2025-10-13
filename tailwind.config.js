/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          light: "#FF8C5A",
          dark: "#E65428",
        },
        secondary: {
          DEFAULT: "#2C3E50",
          light: "#34495E",
          dark: "#1A252F",
        },
        accent: {
          DEFAULT: "#3498DB",
          light: "#5DADE2",
          dark: "#2874A6",
        },
        success: "#27AE60",
        warning: "#F39C12",
        danger: "#E74C3C",
        info: "#3498DB",
        background: {
          DEFAULT: "#F5F7FA",
          dark: "#1A1A1A",
          card: "#FFFFFF",
        },
        text: {
          primary: "#2C3E50",
          secondary: "#7F8C8D",
          light: "#BDC3C7",
          dark: "#1A252F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
