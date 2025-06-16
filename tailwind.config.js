/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "activlingo-primary": "#155dfc",
        "activlingo-secondary": "#4f39f6",
        "activlingo-primary-light": "#3b82f6",
        "activlingo-secondary-light": "#6366f1",
        "activlingo-primary-dark": "#1e40af",
        "activlingo-secondary-dark": "#4338ca",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in-from-top-2": "slideInFromTop 0.3s ease-out",
        "bounce-in": "bounceIn 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromTop: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
          "70%": { transform: "scale(0.9)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
