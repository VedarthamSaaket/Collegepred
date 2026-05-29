import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        sans: ["Cormorant Garamond", "serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
      colors: {
        cream: {
          50: "#FFFDF5",
          100: "#FFF8E7",
          200: "#FFF0CC",
          300: "#FFE499",
          400: "#FFD666",
          500: "#FFC933",
          600: "#D4A825",
          700: "#AA881E",
          800: "#806817",
          900: "#554810",
        },
        coffee: {
          50: "#F5EDE4",
          100: "#E8D5C0",
          200: "#D4B896",
          300: "#C09B6D",
          400: "#AC7E4A",
          500: "#8B653B",
          600: "#6F512F",
          700: "#543D23",
          800: "#3A2917",
          900: "#1F150C",
        },
        accent: {
          DEFAULT: "#543D23",
          light: "#8B653B",
          dark: "#3A2917",
        },
      },
      backgroundImage: {
        "grain-pattern": "url('/grain.png')",
      },
    },
  },
  plugins: [],
};
export default config;