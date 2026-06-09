/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#fff5f5',
          soft: '#ffe3e3',
          red: '#dc3545',
          dark: '#c82333',
        },
        surface: '#fff9f9',
      }
    },
  },
  plugins: [],
}
