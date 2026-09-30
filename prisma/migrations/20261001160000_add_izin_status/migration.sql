ALTER TABLE `izin`
ADD COLUMN `status_izin` ENUM('pending', 'disetujui', 'ditolak') NOT NULL DEFAULT 'pending'
AFTER `file_bukti`;