/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#ff9447',
        blue: '#3c84f0',
        grey: '#e5e5e5',
        wasabiYellow: '#ff9800',
        red: '#ff5858',
      },
    },
  },
  plugins: [],
};
