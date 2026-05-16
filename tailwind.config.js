/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
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
        peach: {
          DEFAULT: 'rgb(var(--color-peach) / <alpha-value>)',
          light: 'rgb(var(--color-peach-light) / <alpha-value>)',
        },
        lavender: {
          DEFAULT: 'rgb(var(--color-lavender) / <alpha-value>)',
          light: 'rgb(var(--color-lavender-light) / <alpha-value>)',
        },
        mint: {
          DEFAULT: 'rgb(var(--color-mint) / <alpha-value>)',
          light: 'rgb(var(--color-mint-light) / <alpha-value>)',
        },
        cocoa: 'rgb(var(--color-cocoa) / <alpha-value>)',
        stone: {
          100: 'rgb(var(--color-stone-100) / <alpha-value>)',
          200: 'rgb(var(--color-stone-200) / <alpha-value>)',
          300: 'rgb(var(--color-stone-300) / <alpha-value>)',
          500: 'rgb(var(--color-stone-500) / <alpha-value>)',
          400: 'rgb(var(--color-stone-400) / <alpha-value>)',
          800: 'rgb(var(--color-stone-800) / <alpha-value>)',
          900: 'rgb(var(--color-stone-900) / <alpha-value>)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
