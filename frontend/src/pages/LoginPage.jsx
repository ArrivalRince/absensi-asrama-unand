import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import asramaMark from '../assets/asrama-mark.svg';

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(identifier.trim(), password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen-overlay">
      <section className="login-card">
        <div className="login-brand">
          <img className="login-brand-logo" src={asramaMark} alt="" />
          <div><h1>Portal Asrama UNAND</h1><p>Sistem Presensi &amp; Monitoring Terpadu</p></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">NIM / NIP / Username</label>
            <input className="form-input" id="login-identifier" autoComplete="username" onChange={(event) => setIdentifier(event.target.value)} placeholder="Masukkan NIM atau NIP..." required value={identifier} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="password-field-wrapper">
              <input className="form-input" id="login-password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi..." required type={showPassword ? 'text' : 'password'} value={password} />
              <button className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)} type="button">{showPassword ? 'Sembunyikan' : 'Tampilkan'}</button>
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">{submitting ? 'Memeriksa...' : 'Masuk ke Portal'}</button>
        </form>
      </section>
    </main>
  );
}