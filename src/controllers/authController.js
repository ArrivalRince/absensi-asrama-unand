const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const viewPermissions = {
	penghuni: ['view-camera', 'view-riwayat'],
	fasil: ['view-fasilitator', 'view-riwayat-fasil'],
	admin: ['view-admin', 'view-fasilitator', 'view-riwayat-fasil']
};

function serializeUser(user) {
	const role = user.role;
	return {
		id: user.nim,
		nim: user.nim,
		name: user.nama,
		email: user.email,
		role,
		roleTitle: role === 'penghuni' ? 'Penghuni' : role === 'fasil' ? 'Fasilitator' : 'Administrator',
		avatar: '',
		allowedViews: viewPermissions[role] || []
	};
}

async function login(ctx) {
	const { identifier, password } = ctx.request.body || {};
	if (!process.env.JWT_SECRET) ctx.throw(500, 'JWT_SECRET belum dikonfigurasi di file .env');
	if (!identifier || !password) {
		ctx.throw(400, 'NIM/NIP/email dan password wajib diisi');
	}

	const user = await userService.findByIdentifier(identifier);
	const isBcryptHash = user && /^\$2[aby]\$\d{2}\$/.test(user.password);
	const passwordIsValid = user && (isBcryptHash
		? await bcrypt.compare(password, user.password)
		: password === user.password);

	if (!passwordIsValid) {
		ctx.throw(401, 'NIM/NIP/email atau password tidak valid');
	}

	if (!isBcryptHash) {
		await userService.upgradePassword(user, password);
	}

	const token = jwt.sign(
		{ nim: user.nim, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: '12h' }
	);

	ctx.body = { token, user: serializeUser(user) };
}

async function me(ctx) {
	const user = await userService.findByNim(ctx.state.user.nim);
	if (!user) ctx.throw(404, 'Akun tidak ditemukan');
	ctx.body = { user: serializeUser(user) };
}

module.exports = { login, me, serializeUser };
