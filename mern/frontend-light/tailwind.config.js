/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Define the base theme first (don't use extend for font families in v4)
    fontFamily: {
      // sans: ['Poppins', 'sans-serif'],
      serif: ['Playfair Display', 'serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        secondary: {
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        }
      },
    },
  },
  plugins: [],
}