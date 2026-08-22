/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      colors: {
        canvas: {
          DEFAULT: '#0B0F17',
          deep: '#070A0F',
        },
        surface: {
          DEFAULT: '#111827',
          elevated: '#161F30',
          hover: '#1F293D',
          border: '#1F2937',
          subtle: '#374151',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          teal: '#0D9488',
        },
        status: {
          present: '#10B981',
          absent: '#F59E0B',
          leave: '#0EA5E9',
          danger: '#F43F5E',
        }
      },
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}

