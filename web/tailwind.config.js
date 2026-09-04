/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      tablet: '768px',
      desktop: '1024px',
      wide: '1440px',
    },
    extend: {},
  },
  plugins: [],
};