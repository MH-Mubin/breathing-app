import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const port = Number(process.env.PORT) || Number(process.env.VITE_PORT) || 5174;

export default defineConfig({
	plugins: [react()],
	server: {
		port,
		proxy: {
			'/api': {
				target: 'http://localhost:5000',
				changeOrigin: true
			}
		}
	}
});
