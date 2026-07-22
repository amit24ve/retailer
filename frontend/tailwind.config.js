import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand: Mint #d5f7f3 scale
        primary: {
          50:  '#f0fdfb',
          100: '#d5f7f3',   // ← brand mint
          200: '#a8ede6',
          300: '#6dddd4',
          400: '#3cc9be',
          500: '#1aafa4',
          600: '#128c83',
          700: '#0e6e67',
          800: '#0c5650',
          900: '#0a3e39',
        },
        // Accent: Cyan
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Sidebar mint bg
        sidebar: {
          DEFAULT: '#d5f7f3',
          dark:    '#a8ede6',
          text:    '#1a4a45',
        },
        accent: {
          gold:   '#e6dbae',
          'gold-dark': '#c9b96e',
          mint:   '#d5f7f3',
          cyan:   '#06b6d4',
          amber:  '#f59e0b',
          green:  '#10b981',
          rose:   '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-card':    'linear-gradient(135deg, #ffffff 0%, #f0fdfb 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #d5f7f3 0%, #a8ede6 100%)',
        'gold-gradient':    'linear-gradient(135deg, #e6dbae 0%, #c9b96e 100%)',
        'mint-gradient':    'linear-gradient(135deg, #d5f7f3 0%, #a8ede6 100%)',
      },
      boxShadow: {
        'card':         '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-lg':      '0 10px 24px -3px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.06)',
        'glow-gold':    '0 0 20px rgba(201,185,110,0.40)',
        'glow-mint':    '0 0 20px rgba(213,247,243,0.60)',
        'glow-primary': '0 0 20px rgba(213,247,243,0.60)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer':  'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },  '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [forms],
}
