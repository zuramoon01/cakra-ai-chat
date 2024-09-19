import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "havelock-blue": {
          50: "#EEF5FC",
          100: "#D9E9F7",
          200: "#B7D5F1",
          300: "#90BEE9",
          400: "#6EAAE2",
          500: "#4893DB",
          600: "#2778C4",
          700: "#1D5991",
          800: "#133C62",
          900: "#091D2F",
          950: "#05101A",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
