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
        luxury: {
          blue: 'var(--luxury-blue, #1B263B)',
          gold: 'var(--luxury-gold, #C5A059)',
          'gold-light': '#F4E4BC',
          'gold-dark': '#B8941D',
        },
        'luxury-blue': 'var(--luxury-blue, #1B263B)',
        'luxury-gold': 'var(--luxury-gold, #C5A059)',
        'primary': 'var(--primary-color, #1B263B)',
        'secondary': 'var(--secondary-color, #C5A059)',
        'background': 'var(--background-color, #FFFFFF)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
