/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5a300', // Reference --amber
          600: '#d68f00', // Reference --amber-deep
          700: '#a05e00', // Reference --amber-text
          800: '#78350f',
          900: '#451a03',
          950: '#280e02',
          DEFAULT: '#f5a300',
        },
        ink: {
          DEFAULT: '#0F1420',
          2: '#171D2C',
          3: '#242C3D',
        },
        fresh: {
          DEFAULT: '#00C896',
          soft: 'rgba(0, 200, 150, 0.10)',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          alt: '#F9FAFB',
        },
        line: {
          DEFAULT: 'rgba(15, 20, 32, 0.09)',
          dark: 'rgba(241, 242, 240, 0.12)',
        },
        slate: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280', // Reference --slate
          600: '#4B5563',
          700: '#374151',
          800: '#171D2C',
          900: '#0F1420', // Reference --ink
          950: '#080B11',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      maxWidth: {
        'site': '1160px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(15, 20, 32, 0.05)',
        'card': '0 8px 28px rgba(20, 20, 20, 0.06)',
        'card-hover': '0 16px 40px rgba(15, 20, 32, 0.08)',
        'btn-amber': '0 10px 26px rgba(240, 162, 2, 0.35)',
        'popover': '0 18px 46px rgba(15, 20, 32, 0.13)',
        'glass': '0 8px 32px rgba(15, 20, 32, 0.08)',
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
        'xl': '14px',
      },
    },
  },
  plugins: [],
};
