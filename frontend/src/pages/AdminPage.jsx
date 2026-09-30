import React, { useEffect, useState } from 'react';
import LoadState from '../components/LoadState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { request } from '../api/client.js';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const result = await request('/users');
      setUsers(result.users);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function createUser(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setNotice('');
    const form = new FormData(formElement);
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify({
          nim_nip: form.get('nim_nip'),
          nama: form.get('nama'),
          email: form.get('email'),
          password: form.get('password'),
          role: form.get('role')
        })
      });
      formElement.reset();
      setNotice('Akun berhasil dibuat.');
      await loadUsers();
    } catch (createError) {
      setNotice(createError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Manajemen Pengguna" description="Kelola akun penghuni, fasilitator, dan administrator." />
      <div className="admin-layout">
        <section className="card admin-list-panel">
          <div className="card-title-row"><h2>Daftar Pengguna</h2><button className="btn btn-outline btn-sm" onClick={loadUsers} type="button">Muat ulang</button></div>
          <LoadState loading={loading} error={error}>
            {users.length === 0 ? <p className="state-message">Belum ada akun.</p> : <div className="table-wrapper"><table className="custom-table"><thead><tr><th>Nama</th><th>NIM / NIP</th><th>Email</th><th>Role</th><th>Kamar</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.nama}</td><td>{user.nim_nip}</td><td>{user.email}</td><td>{user.role}</td><td>{user.kamar ? `${user.kamar.gedung?.nama_gedung || 'Gedung'} · ${user.kamar.no_kamar}` : '-'}</td></tr>)}</tbody></table></div>}
          </LoadState>
        </section>
        <section className="card admin-create-panel">
          <h2>Buat Akun</h2>
          <form className="admin-form" onSubmit={createUser}>
            <div className="form-group"><label className="form-label" htmlFor="new-nim">NIM / NIP</label><input autoComplete="off" className="form-input" id="new-nim" name="nim_nip" required /></div>
            <div className="form-group"><label className="form-label" htmlFor="new-name">Nama lengkap</label><input className="form-input" id="new-name" name="nama" required /></div>
            <div className="form-group"><label className="form-label" htmlFor="new-email">Email</label><input autoComplete="off" className="form-input" id="new-email" name="email" required type="email" /></div>
            <div className="form-group"><label className="form-label" htmlFor="new-password">Password awal</label><input autoComplete="new-password" className="form-input" id="new-password" minLength={8} name="password" required type="password" /></div>
            <div className="form-group"><label className="form-label" htmlFor="new-role">Role</label><select className="form-select" id="new-role" name="role" required><option value="penghuni">Penghuni</option><option value="fasil">Fasilitator</option><option value="admin">Administrator</option></select></div>
            <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? 'Menyimpan...' : 'Simpan Akun'}</button>
            {notice && <p className="notice-message" role="status">{notice}</p>}
          </form>
        </section>
      </div>
    </>
  );
}