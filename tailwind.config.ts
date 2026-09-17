import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBFAF6",
        surface: "#FFFFFF",
        "surface-alt": "#F1EEE6",
        ink: "#16241F",
        "ink-soft": "#4B5B54",
        teal: {
          DEFAULT: "#0B4F4A",
          bright: "#157A72",
          wash: "#E6EFEC",
        },
        clay: {
          DEFAULT: "#B8703D",
          soft: "#F0DFC9",
        },
        risk: {
          low: "#4A7C59",
          "low-wash": "#E4EFE6",
          mod: "#C68B2E",
          "mod-wash": "#F6EBD6",
          high: "#A8442E",
          "high-wash": "#F3E1DA",
        },
        line: "#DDD6C7",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
