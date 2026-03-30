/** @type {import("tailwindcss").Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ["Space Grotesk", 'sans-serif'],
        mono: ["JetBrains Mono", 'monospace'],
      },
    },
  },
  plugins: [],
}