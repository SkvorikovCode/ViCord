/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#1e1f22',
          darker: '#111214',
          gray: '#2b2d31',
          lightgray: '#313338',
          blue: '#5865f2',
          green: '#23a559',
          red: '#f23f43',
          text: '#dbdee1',
          textmuted: '#949ba4',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

