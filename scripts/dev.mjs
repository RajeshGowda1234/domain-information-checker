/** Runs backend + Vite without concurrently. */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const server = spawn('node', ['server/index.js'], { cwd: root, stdio: 'inherit', shell: true });
const vite = spawn('node', ['node_modules/vite/bin/vite.js'], { cwd: root, stdio: 'inherit', shell: true });

process.on('SIGINT', () => { server.kill(); vite.kill(); process.exit(0); });
process.on('SIGTERM', () => { server.kill(); vite.kill(); process.exit(0); });

server.on('error', (e) => { console.error('[dev] Server:', e.message); process.exit(1); });
vite.on('error', (e) => { console.error('[dev] Vite:', e.message); process.exit(1); });
