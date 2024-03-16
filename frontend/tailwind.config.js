/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: "#382D63",
        "light-purple": "#B7ACDF",
        violet: "#120D24",
        "light-violet": "#171031",
      },
      fontFamily: {
        mono: '"JetBrains Mono", monospace',
      },
    },
  },
  plugins: [],
};
