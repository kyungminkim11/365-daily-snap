/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        paper: "#f5f1e8",
        warm: "#ebe4d8",
        stone: "#d8d0c3",
        line: "#d7cec0",
        ink: "#1d1b18",
        charcoal: "#34302a",
        muted: "#766f65",
      },
      borderRadius: {
        frame: "2px",
        soft: "8px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(29, 27, 24, 0.08)",
      },
    },
  },
  plugins: [],
};
