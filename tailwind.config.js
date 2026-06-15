/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8fb',
          100: '#d6eef4',
          200: '#b0dce8',
          300: '#7cc3d7',
          400: '#42a2bd',
          500: '#2986a3',
          600: '#236c8a',
          700: '#215870',
          800: '#21495d',
          900: '#1f3e4f',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 42, 53, 0.06), 0 1px 2px -1px rgba(15, 42, 53, 0.08)',
      },
    },
  },
  plugins: [],
}
