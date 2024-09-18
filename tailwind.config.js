/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsh,mdx}'],
  theme: {
    extend: {}
  },
  plugins: [require('@catppuccin/tailwindcss')({ prefix: 'ctp', defaultFlavour: 'mocha' })]
}
