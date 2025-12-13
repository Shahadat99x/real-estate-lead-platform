/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7ff',
          100: '#e5edff',
          200: '#c2d8ff',
          300: '#9ec2ff',
          400: '#5a94ff',
          500: '#1e66ff',
          600: '#124ad1',
          700: '#0f3ca8',
          800: '#0c2f83',
          900: '#0a2568',
        },
      },
    },
  },
  plugins: [],
};
