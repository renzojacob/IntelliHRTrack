/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#14b8a6',
          to: '#0ea5a0',
        },
        brand: {
          50: '#f5fbff',
          100: '#e6f6ff',
          400: '#10b981',
          500: '#0ea5a0',
          700: '#047857',
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, var(--accent), var(--accent-to))',
      },
      boxShadow: {
        glow: '0 10px 30px -5px rgba(16,185,129,0.35), 0 8px 16px -8px rgba(59,130,246,0.25)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'pulse-subtle': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        shine: 'shine 2.5s linear infinite',
        shimmer: 'shimmer 1.2s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
