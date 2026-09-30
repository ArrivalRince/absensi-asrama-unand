import React from 'react';
import asramaMark from '../assets/asrama-mark.svg';

const navigationByRole = {
  penghuni: [
    { id: 'attendance', label: 'Presensi Kamera', icon: '◉' },
    { id: 'history', label: 'Riwayat & Form Izin', icon: '▤' }
  ],
  fasil: [
    { id: 'monitoring', label: 'Dashboard Fasilitator', icon: '⌂' },
    { id: 'history', label: 'Riwayat Presensi', icon: '▤' }
  ],
  admin: [
    { id: 'admin', label: 'Manajemen Pengguna', icon: '⚙' },
    { id: 'monitoring', label: 'Monitoring Asrama', icon: '⌂' },
    { id: 'history', label: 'Riwayat Presensi', icon: '▤' }
  ]
};

export default function Sidebar({ role, page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img className="brand-mark" src={asramaMark} alt="" />
          <div className="brand-text"><h2>Portal Asrama</h2><p>Universitas Andalas</p></div>
        </div>
        <div className="sidebar-subcard">
          <span className="subcard-badge">{role === 'admin' ? 'ADMINISTRATOR' : role === 'fasil' ? 'FASILITATOR' : 'PENGHUNI'}</span>
          <div className="subcard-title">Sistem presensi dan monitoring terpadu</div>
        </div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {(navigationByRole[role] || []).map((item) => (
            <button
              className={`nav-item${page === item.id ? ' active' : ''}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar-footer"><span>Tahun Akademik</span><span className="pill-badge-green">2026/2027</span></div>
    </aside>
  );
}