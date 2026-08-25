import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium, restrained funeral home color palette
        walnut: {
          50: "#FAF9F7",
          100: "#F2EFEA",
          200: "#E5E0D8",
          300: "#D2C9BD",
          400: "#B0A393",
          500: "#8C7E6E",
          600: "#6B5E50",
          700: "#4D4237",
          800: "#2C221E", // Core primary color
          900: "#1A1310",
        },
        brass: {
          300: "#D4C596",
          400: "#C2B17B",
          500: "#A8935D", // Accent
          600: "#8C7A4A",
        },
        marble: {
          50: "#F8F7F4", // Baseline canvas background
          100: "#F0EEE9",
          200: "#E5E2DC", // Border color
          300: "#D5D1C8",
        },
      },
      fontFamily: {
        display: ["var(--font-lora)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      // Dual 8-Grid & 4-Grid micro-spacing system
      spacing: {
        '0.5': '2px',   // 2px micro
        '1': '4px',     // 4px step
        '1.5': '6px',   // 6px micro
        '2': '8px',     // 8px step
        '2.5': '10px',  // 10px micro
        '3': '12px',    // 12px step (4x3)
        '3.5': '14px',  // 14px micro
        '4': '16px',    // 16px step (8x2, 4x4)
        '5': '20px',    // 20px step (4x5)
        '6': '24px',    // 24px step (8x3, 4x6)
        '7': '28px',    // 28px step (4x7)
        '8': '32px',    // 32px step (8x4, 4x8)
        '9': '36px',    // 36px step (4x9)
        '10': '40px',   // 40px step (8x5, 4x10)
        '11': '44px',   // 44px step (4x11)
        '12': '48px',   // 48px step (8x6, 4x12)
        '14': '56px',   // 56px step (8x7, 4x14)
        '16': '64px',   // 64px step (8x8, 4x16)
        '18': '72px',   // 72px step (4x18)
        '20': '80px',   // 80px step (8x10, 4x20)
        '24': '96px',   // 96px step (8x12, 4x24)
      },
    },
  },
  plugins: [],
};
export default config;
