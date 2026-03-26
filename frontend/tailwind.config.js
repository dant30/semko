import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
          200: "var(--color-brand-200)",
          300: "var(--color-brand-300)",
          400: "var(--color-brand-400)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
          800: "var(--color-brand-800)",
          900: "var(--color-brand-900)",
        },
        accent: {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },
        surface: {
          bg: "var(--surface-bg)",
          panel: "var(--surface-panel)",
          subtle: "var(--surface-subtle)",
          border: "var(--surface-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        feedback: {
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
        neutral: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        header: "var(--header-height)",
        "mobile-header": "3.5rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        hard: "0 18px 50px rgba(8, 24, 48, 0.18)",
        focus: "0 0 0 3px rgba(45, 115, 212, 0.25)",
        card: "0 1px 3px rgba(8, 24, 48, 0.08), 0 1px 2px rgba(8, 24, 48, 0.06)",
        "card-hover": "0 16px 35px -8px rgba(8, 24, 48, 0.18)",
        dropdown: "0 20px 45px rgba(8, 24, 48, 0.12)",
        sidebar: "8px 0 28px rgba(8, 24, 48, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-accent-600) 100%)",
        "gradient-forest": "linear-gradient(135deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)",
        "gradient-cobalt": "linear-gradient(135deg, var(--color-accent-700) 0%, var(--color-accent-500) 100%)",
        "gradient-sidebar": "linear-gradient(180deg, rgba(24, 78, 55, 0.98) 0%, rgba(19, 58, 115, 0.98) 100%)",
        "gradient-shell": "radial-gradient(circle at top left, rgba(37, 117, 74, 0.16), transparent 30%), radial-gradient(circle at top right, rgba(32, 98, 184, 0.14), transparent 26%), linear-gradient(180deg, var(--surface-bg) 0%, #eef5fb 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(37, 117, 74, 0.1) 0%, rgba(32, 98, 184, 0.06) 100%)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [forms, typography],
};
