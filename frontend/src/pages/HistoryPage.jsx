import React, { useEffect, useState } from 'react';
import LoadState from '../components/LoadState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { request } from '../api/client.js';

function readableDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
  return { pending: 'Menunggu', disetujui: 'Diterima', ditolak: 'Ditolak', hadir: 'Hadir', terlambat: 'Terlambat', alpa: 'Alpa' }[status] || status || '-';
}

export default function HistoryPage({ canRequestLeave, canManageLeave }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  async function loadRecords() {
    setLoading(true);
    setError('');
    try {
      const [attendance, leaves] = await Promise.all([request('/presensi'), request('/izin')]);
      const attendanceRows = attendance.records.map((record) => ({
        key: `attendance-${record.id}`,
        date: record.tanggal,
        type: record.jenis_presensi === 'subuh' ? 'Presensi Shubuh' : 'Presensi Malam',
        detail: `${record.status} · ${record.waktu_presensi || '-'}`,
        status: record.status,
        file: record.foto_wajah
      }));
      const leaveRows = leaves.records.map((record) => ({
        key: `leave-${record.id}`,
        id: record.id,
        date: record.tanggal_izin,
        type: 'Permohonan izin',
        detail: record.alasan,
        status: record.status_izin,
        file: record.file_bukti
      }));
      setRecords([...attendanceRows, ...leaveRows].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRecords(); }, []);

  async function updateLeaveStatus(record, status) {
    setNotice('');
    setProcessingId(record.id);
    try {
      await request(`/izin/${record.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_izin: status })
      });
      setNotice(`Permohonan izin berhasil ${status}.`);
      await loadRecords();
    } catch (updateError) {
      setNotice(updateError.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function submitLeave(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setNotice('');
    const formData = new FormData(formElement);
    try {
      await request('/izin', { method: 'POST', body: formData });
      formElement.reset();
      setNotice('Permohonan izin berhasil dikirim.');
      await loadRecords();
    } catch (submitError) {
      setNotice(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title={canRequestLeave ? 'Riwayat & Form Izin' : 'Riwayat Presensi'} description="Catatan presensi dan permohonan izin akun." />
      <LoadState loading={loading} error={error}>
        <section className="card history-panel">
          <div className="card-title-row"><h2>Riwayat</h2><button className="btn btn-outline btn-sm" onClick={loadRecords} type="button">Muat ulang</button></div>
          {notice && !canRequestLeave && <p className="notice-message" role="status">{notice}</p>}
          {records.length === 0 ? <p className="state-message">Belum ada catatan.</p> : <div className="table-wrapper"><table className="custom-table"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Detail</th><th>Status</th><th>Bukti</th>{canManageLeave && <th>Aksi</th>}</tr></thead><tbody>{records.map((record) => <tr key={record.key}><td>{readableDate(record.date)}</td><td>{record.type}</td><td>{record.detail}</td><td><span className={`status-label status-${record.status || 'pending'}`}>{statusLabel(record.status)}</span></td><td>{record.file ? <a href={record.file} rel="noreferrer" target="_blank">Lihat bukti</a> : '-'}</td>{canManageLeave && <td>{record.key.startsWith('leave-') && record.status === 'pending' ? <div className="approval-actions"><button className="btn btn-primary btn-sm" disabled={processingId === record.id} onClick={() => updateLeaveStatus(record, 'disetujui')} type="button">{processingId === record.id ? 'Memproses...' : 'Terima'}</button><button className="btn btn-danger btn-sm" disabled={processingId === record.id} onClick={() => updateLeaveStatus(record, 'ditolak')} type="button">Tolak</button></div> : '-'}</td>}</tr>)}</tbody></table></div>}
        </section>
      </LoadState>
      {canRequestLeave && <section className="card leave-form-panel"><h2>Ajukan Izin</h2><form className="leave-form" onSubmit={submitLeave}><div className="form-group"><label className="form-label" htmlFor="leave-date">Tanggal izin</label><input className="form-input" id="leave-date" name="tanggal_izin" required type="date" /></div><div className="form-group"><label className="form-label" htmlFor="leave-reason">Alasan</label><textarea className="form-textarea" id="leave-reason" maxLength={1000} name="alasan" required rows={4} /></div><div className="form-group"><label className="form-label" htmlFor="leave-proof">Bukti (PDF, JPG, PNG; maks. 5 MB)</label><input accept="application/pdf,image/jpeg,image/png" className="form-input file-input" id="leave-proof" name="bukti" required type="file" /></div><button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? 'Mengirim...' : 'Kirim Permohonan'}</button>{notice && <p className="notice-message" role="status">{notice}</p>}</form></section>}
    </>
  );
}