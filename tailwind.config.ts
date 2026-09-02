import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        ornament: "var(--ornament)",
        badge: {
          popular: {
            DEFAULT: "var(--badge-popular)",
            foreground: "var(--badge-popular-foreground)",
          },
          new: {
            DEFAULT: "var(--badge-new)",
            foreground: "var(--badge-new-foreground)",
          },
          spicy: {
            DEFAULT: "var(--badge-spicy)",
            foreground: "var(--badge-spicy-foreground)",
          },
          vegetarian: {
            DEFAULT: "var(--badge-vegetarian)",
            foreground: "var(--badge-vegetarian-foreground)",
          },
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "var(--radius-card)",
        image: "var(--radius-image)",
        drawer: "var(--radius-drawer)",
      },
      fontFamily: {
        sans: ["IRANSans", "var(--font-vazir)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      fontSize: {
        body: ["15px", { lineHeight: "1.9" }],
        secondary: ["12.5px", { lineHeight: "1.8" }],
        "card-title": ["15.5px", { lineHeight: "1.5", fontWeight: "700" }],
        section: ["22px", { lineHeight: "1.3" }],
        hero: ["36px", { lineHeight: "1.2" }],
        price: ["15px", { lineHeight: "1.5", fontWeight: "700" }],
      },
      boxShadow: {
        warm: "0 8px 24px rgb(42 33 26 / 0.08)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "260ms",
        slow: "450ms",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
