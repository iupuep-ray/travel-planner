/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 動森風格配色（基於遊戲介面）
        'primary': '#7AC5AD',           // 青綠色（動森 Teal）
        'primary-light': '#9DD9C4',     // 淺青綠
        'primary-dark': '#5FA594',      // 深青綠

        'accent': '#E9A15A',            // 暖橘
        'accent-pink': '#E89EA3',       // 粉橘
        'accent-yellow': '#F4C542',     // 黃色標籤

        'brown': '#8B6F47',             // 動森棕（標題用）
        'brown-light': '#A88F6B',       // 淺棕
        'brown-dark': '#6B563A',        // 深棕

        'cream': '#F5EFE1',             // 主卡片背景
        'cream-light': '#FDFAF3',       // 更淺的奶油色
        'cream-dark': '#EFE8D8',        // 內層卡片背景

        'primary-text': '#6B563A',      // 深棕色文字
        'primary-bg': '#E8DCC8',        // 整體背景
        'card-shadow': '#D4C9B8',       // 陰影色
      },
      borderRadius: {
        'card': '32px',          // 大圓角
        'card-lg': '40px',       // 超大圓角
        'button': '24px',        // 按鈕圓角
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(107, 86, 58, 0.08)',
        'soft-lg': '0 4px 12px rgba(107, 86, 58, 0.12)',
        'inset-soft': 'inset 0 2px 4px rgba(107, 86, 58, 0.06)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
