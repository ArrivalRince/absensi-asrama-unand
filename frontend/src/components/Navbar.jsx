import React from 'react';

export default function Navbar({ user, onLogout }) {
  const roleName = { penghuni: 'Penghuni', fasil: 'Fasilitator', admin: 'Administrator' }[user.role];
  return (
    <header className="top-header">
      <div className="top-header-left">
        <span className="portal-tag">ASRAMA UNAND</span>
        <span className="header-subtitle">Sistem Informasi Presensi Digital</span>
      </div>
      <div className="top-header-right">
        <div className="user-profile">
          <span className="user-avatar" aria-hidden="true">{user.name?.slice(0, 1).toUpperCase()}</span>
          <div className="user-info"><span className="user-name">{user.name}</span><span className="user-role">{roleName}</span></div>
          <button className="btn-logout-header" onClick={onLogout} type="button">Keluar</button>
        </div>
      </div>
    </header>
  );
}