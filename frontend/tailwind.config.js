/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Sidebar / brand
        navy:   { DEFAULT: '#0F2744', 700: '#142D50', 600: '#1A3A63', 500: '#1E4A7A', 400: '#2A5F9E', 300: '#3B7BC4', 200: '#7AAED9', 100: '#BDD6EC', 50: '#EBF3FA' },
        // Accent sky-blue for active states
        sky:    { DEFAULT: '#0EA5E9', dark: '#0284C7', light: '#BAE6FD' },
        // Medical semantic
        teal:   { DEFAULT: '#0D9488', light: '#CCFBF1', dark: '#0F766E' },
        // Backgrounds
        surface: { DEFAULT: '#FFFFFF', muted: '#F8FAFD', page: '#EEF2F7', border: '#E4EAF2' },
        // Text
        ink:    { DEFAULT: '#1C2B3A', secondary: '#4A6077', muted: '#8FA3B8' },
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,39,68,0.06), 0 1px 2px rgba(15,39,68,0.04)',
        'card-hover': '0 4px 12px rgba(15,39,68,0.10)',
        focus: '0 0 0 2px #2563EB33',
      },
    },
  },
  plugins: [],
}
