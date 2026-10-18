import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('./web',import.meta.url)),base:'/assets/',plugins:[react()],publicDir:fileURLToPath(new URL('../public',import.meta.url)),build:{outDir:fileURLToPath(new URL('./app/src/main/assets',import.meta.url)),emptyOutDir:true}});
