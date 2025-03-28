/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'aragon-primary': '#FF6D42',
          'aragon-secondary': '#FFB44F',
          'aragon-dark': '#262626',
          'aragon-light': '#F7F7F7',
          'aragon-success': '#4BB543',
          'aragon-error': '#FF3333',
        },
      },
    },
    plugins: [],
  }