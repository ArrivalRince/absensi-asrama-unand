const prisma = require('../config/database');

async function list(ctx) {
	const rows = await prisma.$queryRaw`
		SELECT i.id, i.nim, i.tanggal, i.alasan, i.file_bukti, i.status_izin,
		       u.nama, u.email, u.kamar_id, k.no_kamar, k.lantai, g.nama AS nama_gedung
		FROM izin i
		JOIN \`user\` u ON u.nim = i.nim
		LEFT JOIN kamar k ON k.id = u.kamar_id
		LEFT JOIN gedung g ON g.id = k.gedung_id
		ORDER BY i.tanggal DESC, i.id DESC
	`;
	const visibleRows = ctx.state.user.role === 'penghuni'
		? rows.filter(row => row.nim === ctx.state.user.nim)
		: rows;
	ctx.body = {
		records: visibleRows.map(row => ({
			id: row.id,
			nim: row.nim,
			id_user: row.nim,
			tanggal_izin: row.tanggal,
			created_at: row.tanggal,
			alasan: row.alasan,
			file_bukti: row.file_bukti,
			status_izin: row.status_izin,
			user: {
				id: row.nim,
				nim_nip: row.nim,
				nama: row.nama,
				email: row.email,
				kamar: row.kamar_id === null ? null : {
					no_kamar: row.no_kamar,
					lantai: row.lantai,
					gedung: { nama_gedung: row.nama_gedung }
				}
			}
		}))
	};
}

async function create(ctx) {
	const body = ctx.request.body || {};
	const file = ctx.request.file;
	if (!body.tanggal_izin || !body.alasan || !file) {
		ctx.throw(400, 'Tanggal, alasan, dan berkas bukti wajib diisi');
	}
	const date = new Date(`${body.tanggal_izin}T00:00:00`);
	if (Number.isNaN(date.getTime())) ctx.throw(400, 'Tanggal izin tidak valid');

	const tanggal = date.toLocaleDateString('sv-SE');
	const filePath = `/uploads/bukti_izin/${file.filename}`;
	await prisma.$executeRaw`
		INSERT INTO izin (nim, tanggal, alasan, file_bukti)
		VALUES (${ctx.state.user.nim}, ${tanggal}, ${body.alasan}, ${filePath})
	`;
	ctx.status = 201;
	ctx.body = { record: { nim: ctx.state.user.nim, tanggal, alasan: body.alasan, file_bukti: filePath, status_izin: 'pending' } };
}

async function updateStatus(ctx) {
	const id = Number(ctx.params.id);
	const { status_izin } = ctx.request.body || {};
	if (!Number.isSafeInteger(id) || id < 1) ctx.throw(400, 'ID permohonan izin tidak valid');
	if (!['disetujui', 'ditolak'].includes(status_izin)) {
		ctx.throw(400, 'Status izin harus disetujui atau ditolak');
	}

	const records = await prisma.$queryRaw`
		SELECT id, status_izin FROM izin WHERE id = ${id} LIMIT 1
	`;
	if (!records.length) ctx.throw(404, 'Permohonan izin tidak ditemukan');
	if (records[0].status_izin !== 'pending') ctx.throw(409, 'Permohonan izin sudah diproses');

	const updated = await prisma.$executeRaw`
		UPDATE izin SET status_izin = ${status_izin}
		WHERE id = ${id} AND status_izin = 'pending'
	`;
	if (updated !== 1) ctx.throw(409, 'Permohonan izin sudah diproses oleh pengguna lain');
	ctx.body = { record: { id, status_izin } };
}

module.exports = { list, create, updateStatus };
