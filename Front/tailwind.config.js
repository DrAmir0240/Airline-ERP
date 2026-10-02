/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        // You can add custom colors here if needed
      },
      animation: {
        // Custom animations
      },
    },
  },
  plugins: [
    // Add any Tailwind plugins
  ],
};
