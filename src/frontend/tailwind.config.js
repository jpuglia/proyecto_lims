/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-dark': '#0a0b10',
                'accent-primary': '#3b82f6',
                'accent-secondary': '#8b5cf6',
                'text-main': '#f8fafc',
                'text-muted': '#94a3b8',
            },
            backgroundImage: {
                'grad-primary': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            }
        },
    },
    plugins: [],
}
