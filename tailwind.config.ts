import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",

        // M3 Primary colors
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--on-primary) / <alpha-value>)",
          container: "hsl(var(--primary-container) / <alpha-value>)",
        },
        "on-primary": "hsl(var(--on-primary) / <alpha-value>)",
        "primary-container": "hsl(var(--primary-container) / <alpha-value>)",
        "on-primary-container": "hsl(var(--on-primary-container) / <alpha-value>)",

        // M3 Secondary colors
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--on-secondary) / <alpha-value>)",
          container: "hsl(var(--secondary-container) / <alpha-value>)",
        },
        "on-secondary": "hsl(var(--on-secondary) / <alpha-value>)",
        "secondary-container": "hsl(var(--secondary-container) / <alpha-value>)",
        "on-secondary-container": "hsl(var(--on-secondary-container) / <alpha-value>)",

        // M3 Tertiary colors
        tertiary: {
          DEFAULT: "hsl(var(--tertiary) / <alpha-value>)",
          foreground: "hsl(var(--on-tertiary) / <alpha-value>)",
          container: "hsl(var(--tertiary-container) / <alpha-value>)",
        },
        "on-tertiary": "hsl(var(--on-tertiary) / <alpha-value>)",
        "tertiary-container": "hsl(var(--tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "hsl(var(--on-tertiary-container) / <alpha-value>)",

        // M3 Error colors
        error: {
          DEFAULT: "hsl(var(--error) / <alpha-value>)",
          foreground: "hsl(var(--on-error) / <alpha-value>)",
          container: "hsl(var(--error-container) / <alpha-value>)",
        },
        "on-error": "hsl(var(--on-error) / <alpha-value>)",
        "error-container": "hsl(var(--error-container) / <alpha-value>)",
        "on-error-container": "hsl(var(--on-error-container) / <alpha-value>)",

        // M3 Surface colors
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          variant: "hsl(var(--surface-variant) / <alpha-value>)",
        },
        "on-surface": "hsl(var(--on-surface) / <alpha-value>)",
        "surface-variant": "hsl(var(--surface-variant) / <alpha-value>)",
        "on-surface-variant": "hsl(var(--on-surface-variant) / <alpha-value>)",

        // M3 Outline colors
        outline: {
          DEFAULT: "hsl(var(--outline) / <alpha-value>)",
          variant: "hsl(var(--outline-variant) / <alpha-value>)",
        },
        "outline-variant": "hsl(var(--outline-variant) / <alpha-value>)",

        // Legacy compatibility
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
