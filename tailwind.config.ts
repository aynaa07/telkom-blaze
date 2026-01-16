import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        alice: ["var(--font-alice)"],
        belleza: ["var(--font-belleza)"],
      },
    },
  },
  plugins: [],
};
export default config;