/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0df259', // Neon Green
        'primary-dark': '#0ab842',
        'accent': '#f25c0d', // Burnt Orange
        'background-light': '#f5f8f6',
        'background-dark': '#0a0f0d', // Very dark, almost black
        'surface-dark': '#161b18', // Slightly lighter for cards
        'surface-border': '#2a3830',
        'text-muted': '#8ca395',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
