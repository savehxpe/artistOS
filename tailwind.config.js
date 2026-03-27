/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "on-background": "var(--foreground)",
        surface: "var(--color-surface)",
        "on-surface": "var(--color-on-surface)",
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "brand-primary": "var(--color-brand-primary)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
      },
      fontFamily: {
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-label)", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
