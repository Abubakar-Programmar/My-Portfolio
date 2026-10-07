import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// Design tokens. Light theme only; one accent colour; two fonts.
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        ink: '#0F1220',
        body: '#3C4257',
        muted: '#5B6275',
        line: '#E7E8EE',
        surface: '#F6F6F9',
        paper: '#FBFBFD',
        accent: {
          DEFAULT: '#5B3DF5',
          dark: '#4528D8',
          soft: '#EFEBFF',
          ring: '#A78BFA'
        },
        success: '#1F8A4C',
        danger: '#C92A2A',
        warn: '#B45309'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Inter', 'ui-sans-serif', 'sans-serif']
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(15,18,32,.04), 0 8px 24px rgba(15,18,32,.06)',
        lift: '0 2px 6px rgba(15,18,32,.05), 0 24px 48px rgba(15,18,32,.12)',
        glow: '0 10px 30px rgba(91,61,245,.35)'
      },
      maxWidth: { page: '76rem' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 7s ease-in-out infinite'
      }
    }
  },
  plugins: [typography]
} satisfies Config
