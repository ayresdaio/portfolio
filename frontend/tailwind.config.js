/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Permite alternar temas com a classe .dark
  theme: {
    extend: {
      colors: {
        // Mapeamento semântico das variáveis CSS com suporte a opacidade (ex: bg-brandBlue/50)
        darkBg: 'rgb(var(--bg) / <alpha-value>)',
        darkSurface: 'rgb(var(--surface) / <alpha-value>)',
        darkBorder: 'rgb(var(--border) / <alpha-value>)',
        textPrimary: 'rgb(var(--text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        brandBlue: 'rgb(var(--brand) / <alpha-value>)',
        brandPurple: 'rgb(var(--brand) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' },
          '50%': { transform: 'scale(1.08)', opacity: '1', boxShadow: '0 0 25px rgba(59, 130, 246, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
