require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');

const port = Number(process.env.PORT || 3000);
let server;

async function start() {
  try {
    await prisma.$connect();
    console.log('Berhasil konek ke database MySQL');
  } catch (error) {
    console.error('Gagal konek ke database:', error.message);
  }

  server = app.listen(port, () => {
    console.log(`Server Koa berjalan di http://localhost:${port}`);
  });
}

async function shutdown() {
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
start();