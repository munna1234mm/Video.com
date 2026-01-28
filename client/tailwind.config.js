/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                youtube: {
                    red: '#FF0000',
                    black: '#0F0F0F',
                    dark: '#0F0F0F',
                    gray: '#272727',
                    light: '#F1F1F1',
                }
            },
            fontFamily: {
                sans: ['Roboto', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
