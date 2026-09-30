const userService = require('../services/userService');

async function listUsers(ctx) {
  ctx.body = { users: await userService.listUsers(ctx.query.role) };
}

async function listResidents(ctx) {
  ctx.body = { users: await userService.listResidents() };
}

async function createUser(ctx) {
  ctx.status = 201;
  ctx.body = { user: await userService.createUser(ctx.request.body || {}) };
}

module.exports = { listUsers, listResidents, createUser };