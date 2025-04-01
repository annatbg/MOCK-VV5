/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        darkGreen: '#004337',
        lightGreen: '#006660'
      },
    },
  },
  plugins: [],
}