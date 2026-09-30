const path = require('path');
const fs = require('fs');
const serve = require('koa-static');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const presensiRoutes = require('./routes/presensiRoutes');
const izinRoutes = require('./routes/izinRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = new Koa();

app.use(errorMiddleware);
app.use(bodyParser({ jsonLimit: '5mb' }));
for (const router of [healthRoutes, authRoutes, userRoutes, presensiRoutes, izinRoutes]) {
  app.use(router.routes());
  app.use(router.allowedMethods());
}
app.use(async (ctx, next) => {
  if (!ctx.path.startsWith('/uploads/')) return next();
  const uploadRoot = path.resolve(__dirname, '../uploads');
  const requestedPath = path.resolve(uploadRoot, ctx.path.slice('/uploads/'.length));
  if (!requestedPath.startsWith(`${uploadRoot}${path.sep}`) || !fs.existsSync(requestedPath)) {
    ctx.throw(404, 'Berkas tidak ditemukan');
  }
  ctx.type = path.extname(requestedPath);
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.body = fs.createReadStream(requestedPath);
});
app.use(serve(path.join(__dirname, '../dist')));

module.exports = app;