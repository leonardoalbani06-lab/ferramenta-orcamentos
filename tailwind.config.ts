import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          olive: "#3E4633",
          oliveDark: "#2E3526",
          oliveDeep: "#1F251A",
          oliveLight: "#5A6449",
          lime: "#D0E1A5",
          limeLight: "#F4FEDB",
          cream: "#EDE9D8",
          gold: "#D4AF5A",
          goldLight: "#E8CE69",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
