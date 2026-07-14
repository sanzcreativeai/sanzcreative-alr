import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d4ff',
          300: '#92b4fd',
          400: '#608cfa',
          500: '#3d6af5',
          600: '#2a4eea',
          700: '#1f3cd7',
          800: '#2033ae',
          900: '#1e3189',
          950: '#161f5a',
        },
        surface: {
          DEFAULT: '#0f1117',
          1: '#161b27',
          2: '#1c2336',
          3: '#222b42',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
