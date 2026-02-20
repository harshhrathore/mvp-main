export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wellness: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          }
        }
      },
      backgroundImage: {
        'leaf-pattern': "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M20,20 Q30,10 40,20 Q30,30 20,20\" fill=\"%2322c55e\" opacity=\"0.1\"/></svg>')",
      }
    },
  },
  plugins: [],
};
