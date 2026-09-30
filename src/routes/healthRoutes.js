const Router = require('@koa/router');
const prisma = require('../config/database');

const router = new Router({ prefix: '/api' });

router.get('/health', async (ctx) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    ctx.body = { message: 'Server dan database MySQL terhubung' };
  } catch {
    ctx.throw(503, 'Database MySQL belum terhubung');
  }
});

module.exports = router;