import React, { useEffect, useState } from 'react';
import LoadState from '../components/LoadState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { request } from '../api/client.js';

function todayKey() {
  return new Date().toLocaleDateString('sv-SE');
}

export default function MonitoringPage() {
  const [residents, setResidents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([request('/residents'), request('/presensi'), request('/izin')])
      .then(([residentResult, attendanceResult, leaveResult]) => {
        setResidents(residentResult.users);
        setAttendance(attendanceResult.records);
        setLeaves(leaveResult.records);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const todayAttendance = attendance.filter((record) => String(record.tanggal).slice(0, 10) === todayKey());
  const todayLeaves = leaves.filter((record) => String(record.tanggal_izin).slice(0, 10) === todayKey());
  const presentNims = new Set(todayAttendance.map((record) => record.nim));
  const approvedNims = new Set(todayLeaves.filter((record) => record.status_izin === 'disetujui').map((record) => record.nim));
  const pendingNims = new Set(todayLeaves.filter((record) => record.status_izin === 'pending').map((record) => record.nim));

  return (
    <>
      <PageHeader title="Monitoring Asrama" description="Ringkasan presensi penghuni untuk hari ini." />
      <LoadState loading={loading} error={error}>
        <div className="stats-row">
          <article className="card stat-panel"><span>Jumlah penghuni</span><strong>{residents.length}</strong></article>
          <article className="card stat-panel"><span>Sudah presensi</span><strong>{presentNims.size}</strong></article>
          <article className="card stat-panel"><span>Izin disetujui</span><strong>{approvedNims.size}</strong></article>
          <article className="card stat-panel"><span>Menunggu keputusan</span><strong>{pendingNims.size}</strong></article>
        </div>
        <section className="card monitoring-panel">
          <div className="card-title-row"><h2>Presensi Hari Ini</h2><span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></div>
          {residents.length === 0 ? <p className="state-message">Data penghuni belum tersedia.</p> : <div className="table-wrapper"><table className="custom-table"><thead><tr><th>Penghuni</th><th>NIM</th><th>Kamar</th><th>Status Hari Ini</th><th>Waktu</th></tr></thead><tbody>{residents.map((resident) => {
            const record = todayAttendance.find((item) => item.nim === resident.nim);
            const leave = todayLeaves.find((item) => item.nim === resident.nim);
            const status = record ? record.status : leave ? `Izin ${leave.status_izin}` : 'Belum presensi';
            const statusClass = record ? 'status-present' : leave?.status_izin === 'disetujui' || leave?.status_izin === 'pending' ? 'status-leave' : 'status-missing';
            return <tr key={resident.id}><td>{resident.nama}</td><td>{resident.nim_nip}</td><td>{resident.kamar ? `${resident.kamar.gedung?.nama_gedung || 'Gedung'} · ${resident.kamar.no_kamar}` : 'Belum ditetapkan'}</td><td><span className={`status-label ${statusClass}`}>{status}</span></td><td>{record ? new Date(record.waktu_presensi).toLocaleTimeString('id-ID') : '-'}</td></tr>;
          })}</tbody></table></div>}
        </section>
      </LoadState>
    </>
  );
}