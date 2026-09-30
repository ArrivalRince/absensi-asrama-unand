# 🏛️ Sistem Absensi Asrama UNAND (Koa.js)

Tugas Akhir Mata Kuliah **Pengembangan Aplikasi Berbasis Framework**. REST API Backend untuk pengelolaan absensi subuh/malam, pengajuan izin, dan manajemen pengguna di Asrama UNAND.

## 🛠️ Tech Stack
* **Frontend:** React.js 19 + Vite
* **Backend Framework:** Koa.js
* **Runtime:** Node.js
* **Database:** MySQL
* **ORM:** Prisma ORM v5
* **Authentication:** JSON Web Token (JWT) & bcryptjs
* **File Upload:** `@koa/multer`

## Struktur Frontend

Frontend React berada di `frontend/src/`:

* `components/` berisi navigasi, header, dan komponen tampilan bersama.
* `contexts/` mengelola state autentikasi.
* `pages/` berisi halaman login, presensi, riwayat/izin, monitoring, dan admin.
* `api/` berisi client untuk komunikasi dengan REST API Koa.
* `assets/` dapat digunakan untuk aset frontend; CSS bersama berada di `styles.css`.

Backend tetap berada di `src/`, sedangkan `public/css/` menyimpan stylesheet desain yang digunakan frontend.

Struktur backend Koa berada di `src/`:

* `config/database.js` menginisialisasi koneksi Prisma/MySQL.
* `controllers/` menangani request HTTP untuk autentikasi, pengguna, izin, dan presensi.
* `models/` membungkus query data, sedangkan `services/` memuat logika pengguna.
* `routes/` memisahkan endpoint auth, users, izin, presensi, dan health.
* `middlewares/` berisi autentikasi, role, upload, dan penanganan error.
* `app.js` menyusun middleware dan routes; `server.js` membuka listener serta koneksi database.

## 🚀 Cara Menjalankan Project di Lokal

1. **Clone repository ini:**
   ```bash
   git clone [https://github.com/FatiaRahmah/sistem-absensi-asrama-unand-koa.git](https://github.com/FatiaRahmah/sistem-absensi-asrama-unand-koa.git)
   cd sistem-absensi-asrama-unand-koa
   ```

2. **Install dependency dan siapkan environment:**
   ```bash
   npm install
   Copy-Item .env.example .env
   ```
   Edit `.env` dan isi `DATABASE_URL` dengan user/password MySQL lokal. Nama database pada contoh adalah `asrama_db` (tanpa akhiran `.sql`); ganti jika nama database di MySQL berbeda. Ganti juga `JWT_SECRET` dengan secret acak yang panjang. Password MySQL yang berisi karakter khusus harus di-URL-encode.

3. **Generate Prisma Client dan jalankan frontend/backend untuk development:**
   ```bash
   npx prisma validate
   npx prisma generate
   npm run dev
   ```
   Buka `http://localhost:5173` untuk frontend React. Vite meneruskan permintaan API ke backend Koa di `http://localhost:3000`. Database harus sudah berisi tabel yang sesuai dengan model pada `prisma/schema.prisma`. Langkah ini tidak menjalankan migrasi, `db push`, atau mengubah struktur database.

Untuk database lama yang tabel `izin`-nya belum memiliki `status_izin`, hentikan server lalu jalankan migration aditif satu kali:
   ```bash
   npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20261001160000_add_izin_status/migration.sql
   ```
Setelah itu jalankan kembali `npm run dev`. Permohonan izin baru akan berstatus `pending` sampai fasilitator atau admin memilih Terima atau Tolak.

Untuk menjalankan mode produksi, buat frontend dengan `npm run build`, lalu jalankan backend dengan `npm start`. Koa akan menyajikan hasil build dari folder `dist/`.

Login memakai nilai `nim_nip` atau `email` dan password yang tersimpan sebagai hash bcrypt. Endpoint aplikasi dilayani dari origin yang sama; data presensi dan izin hanya dapat dibaca sesuai role akun yang login.

Untuk membuat akun admin, isi `INITIAL_ADMIN_NIM`, `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, dan `INITIAL_ADMIN_PASSWORD` di `.env`, lalu jalankan `npm run bootstrap:admin`. Script menambahkan kolom `role` pada tabel `user` jika belum ada; akun baru dibuat dengan role `admin`, atau akun dengan NIM yang sama dipromosikan menjadi admin. Setelah bootstrap, hapus `INITIAL_ADMIN_PASSWORD` dari `.env`. Role akun selanjutnya dibaca dari kolom `role` di database.