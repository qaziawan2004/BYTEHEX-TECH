/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c0f',
        panel: '#14171b',
        panelAlt: '#1b1f24',
        line: '#262b31',
        ink: '#eef1f5',
        inkDim: '#7c8591',
        accent: '#5bb8ff',
        accentWarm: '#ffb454',
        accentRed: '#ff5c6c',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
