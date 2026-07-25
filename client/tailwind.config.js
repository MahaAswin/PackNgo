/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '20px',
        '4xl': '28px',
      },
      colors: {
        accent: {
          blue: '#2563EB',
          sky: '#38BDF8',
          teal: '#14B8A6',
        }
      }
    },
  },
  plugins: [],
};
