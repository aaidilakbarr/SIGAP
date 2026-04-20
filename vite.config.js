import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        proxy: {
            '/api': {
                target: 'http://admin_dashboard_laravel.test',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
