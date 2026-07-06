/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // App background — soft pastel blue-white (#F8FBFF)
        background: '#F8FBFF',
        // Primary brand blue, anchored on #7CC6FE
        primary: {
          50: '#F2FAFF',
          100: '#E6F5FF',
          200: '#D3EDFF',
          300: '#B7E1FE',
          400: '#9AD4FE',
          500: '#7CC6FE',
          600: '#5EB3FA',
          700: '#3F9EF0',
          800: '#2E7FD1',
          900: '#235F9E',
          950: '#16406B',
        },
        // Secondary — doubles as the app's cool blue-grey neutral scale,
        // with the brand secondary (#BDE7FF) placed at 300 for soft panels/badges
        secondary: {
          50: '#F8FBFF',
          100: '#EFF6FC',
          200: '#E1EDF7',
          300: '#BDE7FF',
          400: '#A9C3D9',
          500: '#8AA9C4',
          600: '#6689A8',
          700: '#4C6883',
          800: '#34495F',
          900: '#1F2E3D',
          950: '#131C26',
        },
        // Accent — lightest pastel blue (#DFF4FF), used for highlights/badges
        accent: {
          50: '#F5FCFF',
          100: '#DFF4FF',
          200: '#C7EBFF',
          300: '#A3DEFF',
          400: '#7BCDFB',
          500: '#55B8EE',
          600: '#3A9BD1',
          700: '#2C7BAA',
          800: '#215D82',
          900: '#17415C',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(124, 198, 254, 0.12)',
        'soft-lg': '0 8px 24px 0 rgba(124, 198, 254, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
