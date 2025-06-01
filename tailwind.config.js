/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cop-blue': '#2B5CE6',
        'cop-dark-blue': '#1A3A8A',
        'cop-light-blue': '#E6F2FF',
      },
      fontFamily: {
        'noto-sans': ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}