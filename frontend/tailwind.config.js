/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        creem: {
          primary: "#1F8A8A",
          secondary: "#F29F67",
          dark: "#101820",
          bg: "#F3EEE6",
          white: "#FFFFFF",
          accent: "#E9F7F7",
          ink: "#274156",
        }
      },
      boxShadow: {
        brutal: "6px 6px 0px 0px #101820",
        "brutal-lg": "10px 10px 0px 0px #101820",
        "brutal-sm": "3px 3px 0px 0px #101820",
        "brutal-active": "0px 0px 0px 0px #101820",
      }
    },
  },
  plugins: [],
};
