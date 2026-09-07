/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'uis-green': '#006341',
        'uis-green-light': '#2e8b57',
        'uis-green-soft': '#e8f5ef',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
