import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// Design tokens. Warm cream light theme; one maroon accent; two fonts.
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        ink: '#1F0B10',
        body: '#4B3A3E',
        muted: '#7A6A6D',
        line: '#E7DDCF',
        surface: '#F0E9DA',
        paper: '#FBF8F1',
        cream: '#F7F3E8',
        accent: {
          DEFAULT: '#6B0F1A',
          dark: '#470910',
          soft: '#F6E6E3',
          ring: '#C8707B'
        },
        gold: '#C9A24B',
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
        soft: '0 1px 2px rgba(31,11,16,.04), 0 8px 24px rgba(31,11,16,.07)',
        lift: '0 2px 6px rgba(31,11,16,.05), 0 24px 48px rgba(31,11,16,.13)',
        glow: '0 10px 30px rgba(107,15,26,.35)'
      },
      maxWidth: { page: '76rem' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'blob-a': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(8vw,10vh,0) scale(1.15)' },
          '66%': { transform: 'translate3d(-4vw,18vh,0) scale(.95)' }
        },
        'blob-b': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '40%': { transform: 'translate3d(-10vw,-8vh,0) scale(1.1)' },
          '75%': { transform: 'translate3d(5vw,-16vh,0) scale(1.2)' }
        },
        'blob-c': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(12vw,-10vh,0) scale(1.25)' }
        },
        'grid-pan': { to: { backgroundPosition: '44px 44px' } },
        'pulse-ring': { '0%': { transform: 'scale(1)', opacity: '.55' }, '100%': { transform: 'scale(1.9)', opacity: '0' } }
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 7s ease-in-out infinite',
        'blob-a': 'blob-a 26s ease-in-out infinite',
        'blob-b': 'blob-b 32s ease-in-out infinite',
        'blob-c': 'blob-c 38s ease-in-out infinite',
        'grid-pan': 'grid-pan 30s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite'
      }
    }
  },
  plugins: [typography]
} satisfies Config
