import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#49225B',
          800: '#6E3482',
          500: '#A56ABD',
          100: '#E7DBEF',
          50:  '#F5EBFA',
        },
      },
      fontFamily: {
        sans: ['var(--font-shantell)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-shantell)', 'ui-sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
