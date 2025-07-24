/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./content/**/*.md",
      "./layouts/**/*.html",
      "./hugo_/**/*.html", // If you have custom Hugo layouts/partials outside of default layouts/
    ],
    theme: {
      extend: {
        // You can remove gridTemplateColumns if you're not using it elsewhere
        // gridTemplateColumns: {
        //   'fluid-images': 'repeat(auto-fit, minmax(200px, 1fr))',
        // },
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
    plugins: [],
  }