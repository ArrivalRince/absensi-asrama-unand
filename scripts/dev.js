const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
require('dotenv').config({ quiet: true });

const root = path.resolve(__dirname, '..');
const koaPort = Number(process.env.PORT || 3000);
const children = [];
let stopping = false;

function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') return resolve(false);
      reject(error);
    });
    server.listen(port, '0.0.0.0', () => server.close(() => resolve(true)));
  });
}

async function isProjectKoaRunning() {
  try {
    const response = await fetch(`http://127.0.0.1:${koaPort}/api/health`, {
      signal: AbortSignal.timeout(1500)
    });
    const body = await response.text();
    return response.status === 200 && body.includes('Server dan database MySQL terhubung');
  } catch {
    return false;
  }
}

async function findViteServer() {
  for (let port = 5173; port <= 5199; port += 1) {
    if (await isPortFree(port)) return { port, running: false };
    try {
      const response = await fetch(`http://127.0.0.1:${port}`, {
        signal: AbortSignal.timeout(1000)
      });
      const html = await response.text();
      if (response.ok && html.includes('/@vite/client') && html.includes('/src/main.jsx')) {
        return { port, running: true };
      }
    } catch {
      continue;
    }
  }
  throw new Error('Tidak menemukan port Vite yang tersedia (5173-5199).');
}

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGINT');
  const forceExit = setTimeout(() => {
    for (const child of children) child.kill('SIGTERM');
    process.exit(exitCode);
  }, 1500);
  forceExit.unref();
}

function start(label, script, args, extraEnv = {}) {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit'
  });
  children.push(child);
  child.once('error', (error) => {
    console.error(`[${label}] ${error.message}`);
    stopAll(1);
  });
  child.once('exit', (code, signal) => {
    if (stopping) return;
    if (code !== 0) console.error(`[${label}] berhenti (${signal || code}).`);
    stopAll(code || (signal ? 1 : 0));
  });
}

async function main() {
  if (await isPortFree(koaPort)) {
    start('SERVER', path.join(root, 'node_modules/nodemon/bin/nodemon.js'), ['src/server.js']);
  } else if (await isProjectKoaRunning()) {
    console.log(`[SERVER] Koa sudah berjalan di http://localhost:${koaPort}; memakai instance yang ada.`);
  } else {
    throw new Error(`Port ${koaPort} dipakai proses lain, bukan server Koa project ini.`);
  }

  const vite = await findViteServer();
  if (vite.running) {
    console.log(`[CLIENT] Vite sudah berjalan di http://localhost:${vite.port}/; memakai instance yang ada.`);
  } else {
    start('CLIENT', path.join(root, 'node_modules/vite/bin/vite.js'), ['--config', 'vite.config.js'], {
      VITE_PORT: String(vite.port)
    });
  }

  if (children.length === 0) {
    console.log('Frontend dan backend sudah aktif. Tidak ada server duplikat yang dijalankan.');
    return;
  }

  console.log('Tekan Ctrl+C untuk menghentikan server yang dijalankan oleh perintah ini.');
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});