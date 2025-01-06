/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          text: '#E0E0E0',
          secondary: '#333333'
        }
      },
      backgroundColor: {
        light: {
          primary: '#f5f5f5',
          secondary: '#ffffff'
        },
        dark: {
          primary: '#121212',
          secondary: '#1E1E1E'
        }
      },
      textColor: {
        light: {
          primary: '#212121',
          secondary: '#666666'
        },
        dark: {
          primary: '#E0E0E0',
          secondary: '#A0A0A0'
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
} 