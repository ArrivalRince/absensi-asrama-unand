import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MonitoringPage from './pages/MonitoringPage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

const initialPage = { penghuni: 'attendance', fasil: 'monitoring', admin: 'admin' };

function renderPage(page, role) {
  if (page === 'attendance' && role === 'penghuni') return <AttendancePage />;
  if (page === 'history') return <HistoryPage canManageLeave={['admin', 'fasil'].includes(role)} canRequestLeave={role === 'penghuni'} />;
  if (page === 'monitoring' && ['admin', 'fasil'].includes(role)) return <MonitoringPage />;
  if (page === 'admin' && role === 'admin') return <AdminPage />;
  return <p className="state-message">Halaman tidak tersedia untuk role akun ini.</p>;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState(null);

  if (loading) return <main className="app-loading" aria-live="polite">Memuat sesi...</main>;
  if (!user) return <LoginPage />;

  const activePage = page || initialPage[user.role] || 'attendance';
  return (
    <div className="app-container">
      <Sidebar role={user.role} page={activePage} onNavigate={setPage} />
      <div className="main-wrapper">
        <Navbar user={user} onLogout={logout} />
        <main className="content-body">{renderPage(activePage, user.role)}</main>
      </div>
    </div>
  );
}