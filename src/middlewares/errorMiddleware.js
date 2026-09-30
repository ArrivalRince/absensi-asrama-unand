async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (error) {
    ctx.status = error.status || (error.code === 'P2002' ? 409 : error.code === 'P2003' ? 400 : 500);
    const message = error.code === 'P2002'
      ? 'NIM/NIP atau email sudah terdaftar'
      : error.code === 'P2003' ? 'Kamar yang dipilih tidak ditemukan' : error.message;
    ctx.body = { error: ctx.status < 500 ? message : 'Terjadi kesalahan pada server' };
    if (ctx.status === 500) console.error(error);
  }
}

module.exports = errorMiddleware;