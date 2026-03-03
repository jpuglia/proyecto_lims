/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#00A0DF',
                'secondary': '#616265',
                'bg-main': '#FFFFFF',
                'bg-surface': '#F8FAFC',
                'text-main': '#1E293B',
                'text-muted': '#64748B',
                'accent-primary': '#00A0DF',
                'accent-secondary': '#616265',
            },
            backgroundImage: {
                'grad-primary': 'linear-gradient(135deg, #00A0DF, #0087BD)',
            }
        },
    },
    plugins: [],
}
