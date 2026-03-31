/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#a7f3d0', // açık yeşil
          DEFAULT: '#10b981', // yeşil
          dark: '#047857',
        },
        background: {
          light: '#f8fafc', // açık beyaz
          DEFAULT: '#ffffff',
          dark: '#0f172a', // karanlık
        },
      },
    },
  },
  plugins: [],
};
