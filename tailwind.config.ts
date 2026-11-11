import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#FBF1E8",
          100: "#F2C6A0",
          200: "#E8A87C",
          300: "#C97B5A",
          400: "#A85E42",
          500: "#7C4230",
        },
        skyblue: {
          100: "#DCEBF8",
          200: "#BFD9EC",
          300: "#8FB8DE",
          400: "#6A93BC",
        },
        midnight: {
          700: "#1B2436",
          800: "#131C2E",
          900: "#0B1020",
        },
        ink: "#3A2E28",
        cream: "#E8E3DD",
        muted: "#A99C90",
        moss: "#7FB77E",
        clay: "#D9736B",
        honey: "#E2B86B",
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
        display: ['"Songti SC"', '"Noto Serif SC"', '"STSong"', "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 48px rgba(232, 168, 124, 0.35)",
        "glow-sm": "0 0 22px rgba(232, 168, 124, 0.28)",
        glass: "0 20px 60px rgba(12, 10, 18, 0.28)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.12)", opacity: "0.85" },
        },
        flicker: {
          "0%, 100%": { transform: "scaleY(1) translateY(0)", opacity: "0.9" },
          "25%": { transform: "scaleY(1.14) translateY(-3px)", opacity: "1" },
          "50%": { transform: "scaleY(0.92) translateY(2px)", opacity: "0.78" },
          "75%": { transform: "scaleY(1.08) translateY(-1px)", opacity: "0.95" },
        },
        drift: {
          "0%": { transform: "translateX(-8%) translateY(0)" },
          "100%": { transform: "translateX(8%) translateY(-6px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.25)" },
        },
        rainfall: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "20%": { opacity: "0.65" },
          "100%": { transform: "translateY(240px)", opacity: "0" },
        },
        snowfall: {
          "0%": { transform: "translateY(-20px) translateX(0)", opacity: "0" },
          "15%": { opacity: "0.8" },
          "100%": { transform: "translateY(260px) translateX(28px)", opacity: "0" },
        },
        floatup: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "25%": { opacity: "0.9" },
          "100%": { transform: "translateY(-120px) translateX(18px)", opacity: "0" },
        },
        doorsway: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-1.2deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
      animation: {
        breathe: "breathe 9s ease-in-out infinite",
        flicker: "flicker 1.6s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite alternate",
        twinkle: "twinkle 4s ease-in-out infinite",
        rainfall: "rainfall 1.1s linear infinite",
        snowfall: "snowfall 6s linear infinite",
        floatup: "floatup 5s ease-in-out infinite",
        doorsway: "doorsway 4s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
