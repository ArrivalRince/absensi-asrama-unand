require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/database');

async function bootstrapAdmin() {
  const nim = process.env.INITIAL_ADMIN_NIM?.trim();
  const nama = process.env.INITIAL_ADMIN_NAME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!nim || !nama || !email || !password) {
    throw new Error('Isi INITIAL_ADMIN_NIM, INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, dan INITIAL_ADMIN_PASSWORD di .env');
  }
  if (password.length < 8) throw new Error('Password admin minimal 8 karakter');

  const [roleColumn] = await prisma.$queryRaw`
    SELECT COUNT(*) AS column_count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user' AND COLUMN_NAME = 'role'
  `;
  if (Number(roleColumn.column_count) === 0) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `user` ADD COLUMN `role` ENUM('admin', 'fasil', 'penghuni') NOT NULL DEFAULT 'penghuni'"
    );
  }

  const [existingUser] = await prisma.$queryRaw`
    SELECT nim FROM \`user\` WHERE nim = ${nim} OR email = ${email} LIMIT 1
  `;
  if (existingUser && existingUser.nim !== nim) {
    throw new Error('Email admin sudah digunakan oleh akun dengan NIM berbeda');
  }

  if (existingUser) {
    await prisma.$executeRaw`
      UPDATE \`user\` SET role = 'admin' WHERE nim = ${nim}
    `;
    console.log(`Role akun NIM ${nim} berhasil diubah menjadi admin.`);
    return;
  }

  await prisma.$executeRaw`
    INSERT INTO \`user\` (nim, nama, email, password, role)
    VALUES (${nim}, ${nama}, ${email}, ${await bcrypt.hash(password, 12)}, 'admin')
  `;
  console.log(`Akun admin berhasil dibuat untuk NIM ${nim}.`);
}

bootstrapAdmin()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
