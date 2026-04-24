/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        ember: "#f97316",
        sand: "#fff7ed",
        mist: "#edf2f7",
        pine: "#0f766e",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(20, 33, 61, 0.12)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(249, 115, 22, 0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.2), transparent 28%)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Source Sans 3'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
