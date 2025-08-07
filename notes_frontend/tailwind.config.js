module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#fde047",
        background: "#fff",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};
