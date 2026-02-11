/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'liquid-1': '#1E1B4B',
        'liquid-2': '#4338CA',
        'liquid-3': '#701A75',
        'liquid-4': '#4C1D95',
        'glass-orb-bg': 'rgba(255, 255, 255, 0.1)',
        'glass-orb-border': 'rgba(255, 255, 255, 0.25)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      keyframes: {
        liquidFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
          '50%': { transform: 'scale(1.01)', boxShadow: '0 0 40px 5px rgba(255, 255, 255, 0.1)' },
        },
        springIn: {
          '0%': { transform: 'scale(0.9) translateY(20px)', opacity: '0' },
          '70%': { transform: 'scale(1.02) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      animation: {
        liquidFlow: 'liquidFlow 12s ease infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        springIn: 'springIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
