const prisma = require('../config/database');

async function findByIdentifier(identifier) {
  const users = await prisma.$queryRaw`
    SELECT nim, nama, email, password, kamar_id, role
    FROM \`user\`
    WHERE nim = ${identifier} OR email = ${identifier}
    LIMIT 1
  `;
  return users[0] || null;
}

async function findByNim(nim) {
  const users = await prisma.$queryRaw`
    SELECT nim, nama, email, kamar_id, role
    FROM \`user\`
    WHERE nim = ${nim}
    LIMIT 1
  `;
  return users[0] || null;
}

async function updatePassword(nim, currentPassword, passwordHash) {
  return prisma.$executeRaw`
    UPDATE \`user\`
    SET password = ${passwordHash}
    WHERE nim = ${nim} AND password = ${currentPassword}
  `;
}

async function list() {
  return prisma.$queryRaw`
    SELECT u.nim, u.nama, u.email, u.kamar_id, u.role,
           k.no_kamar, k.lantai, g.nama AS nama_gedung
    FROM \`user\` u
    LEFT JOIN kamar k ON k.id = u.kamar_id
    LEFT JOIN gedung g ON g.id = k.gedung_id
    ORDER BY u.nama
  `;
}

async function create({ nim, name, email, password, role, roomId }) {
  await prisma.$executeRaw`
    INSERT INTO \`user\` (nim, nama, email, password, role, kamar_id)
    VALUES (${nim}, ${name}, ${email}, ${password}, ${role}, ${roomId})
  `;
  const users = await prisma.$queryRaw`
    SELECT u.nim, u.nama, u.email, u.kamar_id, u.role,
           k.no_kamar, k.lantai, g.nama AS nama_gedung
    FROM \`user\` u
    LEFT JOIN kamar k ON k.id = u.kamar_id
    LEFT JOIN gedung g ON g.id = k.gedung_id
    WHERE u.nim = ${nim}
    LIMIT 1
  `;
  return users[0];
}

module.exports = { findByIdentifier, findByNim, updatePassword, list, create };