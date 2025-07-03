/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#1a1a1a", // custom gray for background blocks
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
