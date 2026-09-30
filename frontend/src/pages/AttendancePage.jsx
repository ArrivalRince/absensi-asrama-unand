import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { request } from '../api/client.js';

function activeSession(date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 240 && minutes <= 360) return 'subuh';
  if (minutes >= 1080 && minutes <= 1230) return 'malam';
  return null;
}

export default function AttendancePage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');
  const [clock, setClock] = useState(new Date());
  const [cameraError, setCameraError] = useState('');
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      setCameraError('');
      streamRef.current?.getTracks().forEach((track) => track.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
          audio: false
        });
        if (cancelled) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (error) {
        setCameraError(error.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Aktifkan izin kamera di browser.'
          : 'Kamera tidak tersedia pada perangkat ini.');
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  async function captureAttendance() {
    const session = activeSession(new Date());
    if (!session) return setNotice('Presensi hanya dapat dikirim pada sesi Shubuh atau Malam.');
    const video = videoRef.current;
    if (!streamRef.current || !video || video.readyState < 2) {
      return setNotice('Aktifkan kamera sebelum mengirim presensi.');
    }

    setSending(true);
    setNotice('');
    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Perangkat tidak mendukung lokasi GPS.'));
        navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Izin lokasi GPS diperlukan.')), {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext('2d');
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();
      await request('/presensi', {
        method: 'POST',
        body: JSON.stringify({
          jenis_presensi: session,
          lat: position.coords.latitude,
          long: position.coords.longitude,
          foto: canvas.toDataURL('image/jpeg')
        })
      });
      setNotice('Presensi berhasil dicatat. Foto dan koordinat tersimpan.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSending(false);
    }
  }

  const session = activeSession(clock);
  return (
    <>
      <div className="breadcrumb"><span className={`pill-badge-green${session ? '' : ' badge-warning'}`}>{session ? `SESI ${session.toUpperCase()} BERLANGSUNG` : 'DI LUAR JADWAL PRESENSI'}</span><span>WIB · Asrama UNAND</span></div>
      <PageHeader title="Presensi Mandiri Kamera" description="Kehadiran dicatat dengan bukti foto dan lokasi perangkat." actions={<div className="session-info-widget"><div><div className="clock-date">{clock.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</div><div className="clock-time">{clock.toLocaleTimeString('id-ID')} WIB</div></div></div>} />
      <div className="alert-banner-green"><strong>Jadwal Presensi:</strong> Shubuh 04.00-06.00 dan Malam 18.00-20.30 WIB.</div>
      <div className="grid-camera-layout attendance-layout">
        <section className="camera-column">
          <div className="camera-viewport-card">
            <div className="camera-header-tags"><span className="cam-tag">Kamera perangkat</span><span className="cam-tag">GPS diminta saat mengirim</span></div>
            <div className="camera-video-container">
              <video className="attendance-video" ref={videoRef} autoPlay playsInline muted />
              <div className="face-guide-oval" aria-hidden="true" />
              <span className="liveness-badge">BUKTI FOTO</span>
              {cameraError && <p className="camera-error" role="status">{cameraError}</p>}
            </div>
            <div className="camera-controls-bar">
              <button className="btn btn-primary" disabled={sending || Boolean(cameraError)} onClick={captureAttendance} type="button">{sending ? 'Mengirim...' : 'Ambil Foto & Catat Kehadiran'}</button>
              <button className="btn btn-outline" onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')} type="button">Ganti Kamera</button>
            </div>
          </div>
          {notice && <p className="notice-message" role="status">{notice}</p>}
          <section className="card sop-panel"><h2>Panduan Presensi</h2><div className="sop-grid"><div className="sop-card"><h3>Wajah terlihat jelas</h3><p>Pastikan pencahayaan cukup saat mengambil foto.</p></div><div className="sop-card"><h3>Lokasi diizinkan</h3><p>Koordinat perangkat disimpan bersama catatan presensi.</p></div><div className="sop-card"><h3>Ikuti jadwal</h3><p>Shubuh pukul 04.00-06.00, Malam pukul 18.00-20.30.</p></div></div></section>
        </section>
        <aside className="card schedule-panel"><h2>Jadwal Sesi Presensi</h2><div className="schedule-item"><strong>Sesi Shubuh</strong><span>04.00-06.00 WIB</span></div><div className="schedule-item"><strong>Sesi Malam</strong><span>18.00-20.30 WIB</span></div><p>Validasi area asrama belum diaktifkan.</p></aside>
      </div>
    </>
  );
}