/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        'dark-surface': '#111111',
        'card-surface': '#1A1A1A',
        'border-subtle': '#2A2A2A',
        gold: '#D4AF37',
        'gold-light': '#E8C547',
        'gold-dark': '#B8962E',
        silver: '#C0C0C0',
      },
    },
  },
  plugins: [],
};
