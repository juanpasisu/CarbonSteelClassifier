/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#18222d',
        copper: '#c46b38',
      },
    },
  },
  plugins: [],
}
