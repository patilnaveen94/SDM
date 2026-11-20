/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: 'rgb(var(--sdm-obsidian) / <alpha-value>)',
        'dark-surface': 'rgb(var(--sdm-dark-surface) / <alpha-value>)',
        'card-surface': 'rgb(var(--sdm-card-surface) / <alpha-value>)',
        'border-subtle': 'rgb(var(--sdm-border-subtle) / <alpha-value>)',
        gold: 'rgb(var(--sdm-gold) / <alpha-value>)',
        'gold-light': 'rgb(var(--sdm-gold-light) / <alpha-value>)',
        'gold-dark': 'rgb(var(--sdm-gold-dark) / <alpha-value>)',
        silver: 'rgb(var(--sdm-silver) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
