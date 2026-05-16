/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        pink: {
          DEFAULT: 'rgb(var(--color-pink) / <alpha-value>)',
          light: 'rgb(var(--color-pink-light) / <alpha-value>)',
          dark: 'rgb(var(--color-pink-dark) / <alpha-value>)',
        },
        stone: {
          200: 'rgb(var(--color-stone-200) / <alpha-value>)',
          900: 'rgb(var(--color-stone-900) / <alpha-value>)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
