// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.html", "./src/**/*.ts", "./static/**/*.html", "./static/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Varela", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    textColor: ['group-hover']
  },
  plugins: [],
};