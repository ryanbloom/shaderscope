const colors = require('tailwindcss/colors')

module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        annotation: 'var(--light-code)',
      }
    }
  },
  plugins: [],
}
