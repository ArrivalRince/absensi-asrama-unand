const bcrypt = require('bcryptjs');
const { User } = require('../models');

function mapUser(row) {
  return {
    id: row.nim,
    nim_nip: row.nim,
    nama: row.nama,
    email: row.email,
    role: row.role,
    kamar: row.kamar_id === null ? null : {
      id: row.kamar_id,
      no_kamar: row.no_kamar,
      lantai: row.lantai,
      gedung: { nama_gedung: row.nama_gedung }
    }
  };
}

async function findByIdentifier(identifier) {
  return User.findByIdentifier(identifier);
}

async function findByNim(nim) {
  return User.findByNim(nim);
}

async function upgradePassword(user, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updatePassword(user.nim, user.password, passwordHash);
}

async function listUsers(role) {
  const users = (await User.list()).map(mapUser);
  return role ? users.filter((user) => user.role === role) : users;
}

async function listResidents() {
  return (await listUsers()).filter((user) => user.role === 'penghuni');
}

async function createUser(input) {
  const { nim_nip, nama, email, password, role, id_kamar } = input;
  if (!nim_nip || !nama || !email || !password || !role) {
    const error = new Error('NIM, nama, email, password, dan role wajib diisi');
    error.status = 400;
    throw error;
  }
  if (!['admin', 'fasil', 'penghuni'].includes(role)) {
    const error = new Error('Role tidak valid');
    error.status = 400;
    throw error;
  }
  if (password.length < 8) {
    const error = new Error('Password minimal 8 karakter');
    error.status = 400;
    throw error;
  }

  const row = await User.create({
    nim: nim_nip,
    name: nama,
    email,
    password: await bcrypt.hash(password, 12),
    role,
    roomId: id_kamar ? Number(id_kamar) : null
  });
  return mapUser(row);
}

module.exports = { findByIdentifier, findByNim, upgradePassword, listUsers, listResidents, createUser };