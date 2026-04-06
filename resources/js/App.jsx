import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// Bypass ngrok browser warning for API requests
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

const TITLES = {
  dashboard: 'Dashboard',
  proposals: 'Manajemen Proposal',
  verification: 'Verifikasi Evidence',
  portal: 'Portal Pemohon',
  master: 'Master Database'
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeRole, setActiveRole] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [portalTab, setPortalTab] = useState('home');

  const [proposals, setProposals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  const [newProposal, setNewProposal] = useState({
      kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogin = async (role) => {
    try {
        setLoading(true);
        const res = await axios.post('/api/login', { role });
        const { user: dbUser, token } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(dbUser);
        setActiveRole(role);
        fetchProposals();
        
        if (role === 'user') setActivePage('portal');
        else setActivePage('dashboard');
    } catch (e) {
        showToast('Login failed');
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common['Authorization'];
    setActiveRole(null);
    setUser(null);
    setActivePage('dashboard');
  };

  const fetchProposals = async () => {
      try {
          const res = await axios.get('/api/proposals');
          setProposals(res.data.data);
      } catch (e) { }
  };
  
  const handleCreateProposal = async () => {
      try {
          const formData = new FormData();
          formData.append('kegiatan', newProposal.kegiatan);
          formData.append('jenis', newProposal.jenis);
          formData.append('tgl_pelaksanaan', newProposal.tgl_pelaksanaan);
          formData.append('dana_diajukan', newProposal.dana_diajukan);
          formData.append('catatan', newProposal.catatan);
          if (newProposal.file) {
              formData.append('file_proposal', newProposal.file);
          }
          await axios.post('/api/proposals', formData);
          showToast('Proposal berhasil diajukan!');
          setNewProposal({ kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null });
          fetchProposals();
          setPortalTab('home');
      } catch (e) {
          let msg = 'Gagal mengajukan proposal.';
          if (e.response?.data) {
              if (e.response.data.errors) {
                  msg = Object.values(e.response.data.errors)[0][0];
              } else if (e.response.data.message) {
                  msg = e.response.data.message;
              }
          }
          showToast(msg);
      }
  };

  const handleUpdateStatus = async (id, status) => {
      try {
          await axios.put(`/api/proposals/${id}/status`, { status });
          showToast(`Status diubah menjadi: ${status}`);
          fetchProposals();
          setActiveModal(null);
      } catch (e) {
          showToast('Gagal update status');
      }
  };

  if (!activeRole) {
    return (
      <div className="overlay open" style={{ background: '#0f172a', zIndex: 9999, flexDirection: 'column' }}>
        <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', width: '400px', maxWidth: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.5px' }}>SIMDA Login</div>
          <div style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '32px' }}>Pilih peran untuk mensimulasikan sesi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-p" style={{ padding: '12px' }} disabled={loading} onClick={() => handleLogin('master')}>Super Admin</button>
            <button className="btn btn-d" style={{ padding: '12px' }} disabled={loading} onClick={() => handleLogin('reviewer')}>Admin Administrator</button>
            <button className="btn btn-d" style={{ padding: '12px' }} disabled={loading} onClick={() => handleLogin('user')}>User</button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleDetails = () => {
    if (activeRole === 'master') return { dot: 'SA', name: user?.name, role: 'Super Admin' };
    if (activeRole === 'reviewer') return { dot: 'AA', name: user?.name, role: 'Admin Administrator' };
    return { dot: 'U', name: user?.name, role: 'User' };
  };
  const { dot, name, role } = getRoleDetails();

  const getStatusClass = (status) => {
      if (status === 'Menunggu Evidence' || status === 'Menunggu Verif') return 'sw';
      if (status === 'Selesai') return 'sd';
      if (status === 'Gagal Bayar') return 'sf';
      if (status === 'Dalam Review') return 'sr';
      if (status === 'Menunggu Fisik') return 'sn';
      return 'sq';
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sb-top">
          <div className="logo">SIMDA</div>
          <div className="logo-sub">ADMIN PANEL</div>
        </div>
        <nav className="nav">
          <div className="nav-grp">
            <div className="nav-lbl">Menu</div>
            { (activeRole === 'master' || activeRole === 'reviewer') && (
              <>
                <div className={`ni ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>Dashboard</div>
                <div className={`ni ${activePage === 'proposals' ? 'active' : ''}`} onClick={() => setActivePage('proposals')}>Manajemen Proposal <span className="ni-c">{proposals.length}</span></div>
                <div className={`ni ${activePage === 'verification' ? 'active' : ''}`} onClick={() => setActivePage('verification')}>Verifikasi Evidence <span className="ni-c">{proposals.filter(p => p.status === 'Menunggu Verif').length}</span></div>
              </>
            )}
            { activeRole === 'user' && (
                <div className={`ni ${activePage === 'portal' ? 'active' : ''}`} onClick={() => setActivePage('portal')}>Portal Pemohon</div>
            )}
            { activeRole === 'master' && (
                <div className={`ni ${activePage === 'master' ? 'active' : ''}`} onClick={() => setActivePage('master')}>Master Database</div>
            )}
          </div>
        </nav>
        <div className="sb-foot">
          <div className="u-row" style={{ marginBottom: '14px' }}>
            <div className="u-dot" id="user-dot">{dot}</div>
            <div><div className="u-name" id="user-name">{name}</div><div className="u-role" id="user-role">{role}</div></div>
          </div>
          <button className="btn btn-d" style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: '#fca5a5' }} onClick={handleLogout}>Logout / Ganti Sesi</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="pg-title" id="pgTitle">{TITLES[activePage]}</div>
        </div>

        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="stats">
              <div className="sc"><div className="sc-l">Total Antrean</div><div className="sc-v">{proposals.filter(p=>p.status !== 'Selesai').length}</div><div className="sc-s">proposal aktif</div></div>
              <div className="sc"><div className="sc-l">Menunggu Review</div><div className="sc-v">{proposals.filter(p=>p.status === 'Dalam Review').length}</div><div className="sc-s">di meja pimpinan</div></div>
              <div className="sc"><div className="sc-l">Menunggu Evidence</div><div className="sc-v">{proposals.filter(p=>p.status === 'Menunggu Evidence').length}</div><div className="sc-s">belum upload</div></div>
              <div className="sc"><div className="sc-l">Selesai</div><div className="sc-v">{proposals.filter(p=>p.status === 'Selesai').length}</div><div className="sc-s">diarsipkan</div></div>
            </div>
            <div className="tc">
              <div className="tc-top">
                <div className="tc-h">Antrean Prioritas</div>
                <button className="btn btn-d btn-sm" onClick={() => setActivePage('proposals')}>Lihat semua</button>
              </div>
              <table>
                <thead><tr><th>Kode</th><th>Pemohon</th><th>Kegiatan</th><th>Tgl Rencana</th><th>Dana (Rp)</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {proposals.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td className="cid">{p.kode_tiket}</td>
                      <td><div className="cn">{p.user?.name || 'N/A'}</div><div className="cs">{p.user?.instansi || '-'}</div></td>
                      <td>{p.kegiatan}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{p.tgl_pelaksanaan}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{p.dana_diajukan}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td>
                         <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Lihat Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROPOSALS */}
        {activePage === 'proposals' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top"><div className="tc-h">Daftar Proposal</div><button className="exp-btn" onClick={() => fetchProposals()}>Refresh Data</button></div>
              <table>
                <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Jenis</th><th>Tgl Pelaksanaan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {proposals.map(p => (
                    <tr key={p.id} className="hi">
                      <td className="cid">{p.kode_tiket}</td>
                      <td><div className="cn">{p.user?.name}</div></td>
                      <td>{p.kegiatan}</td><td><span className="tt">{p.jenis}</span></td>
                      <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{p.tgl_pelaksanaan}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td className="ract">
                          <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('decision'); }}>Ubah Status</button>
                          <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VERIFICATION */}
        {activePage === 'verification' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top"><div className="tc-h">Verifikasi Evidence</div></div>
              <table>
                <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Dokumen Evidence</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {proposals.filter(p => p.status === 'Menunggu Verif').map(p => (
                  <tr key={p.id}>
                    <td className="cid">{p.kode_tiket}</td><td style={{ fontWeight: 500 }}>{p.user?.name}</td><td>{p.kegiatan}</td>
                    <td>{p.evidence_dokumen ? <span className="fl" onClick={()=>showToast('Lihat '+p.evidence_dokumen)}>{p.evidence_dokumen}</span> : 'Belum upload'}</td>
                    <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                    <td className="ract">
                        <button className="btn btn-p btn-sm" onClick={() => handleUpdateStatus(p.id, 'Selesai')}>Verifikasi Acc</button>
                        <button className="btn btn-d btn-sm" onClick={() => handleUpdateStatus(p.id, 'Menunggu Evidence')}>Tolak/Revisi</button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PORTAL */}
        {activePage === 'portal' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {portalTab === 'home' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>Selamat datang, {user?.name}!</div>
                    <div style={{ color: 'var(--t3)', fontSize: '14px', marginTop: '4px' }}>Pantau status pengajuan atau ajukan proposal anggaran baru Anda di sini.</div>
                  </div>
                  <button className="btn btn-p" onClick={() => setPortalTab('new')}>+ Ajukan Proposal Baru</button>
                </div>
                
                <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div className="sc" style={{ height: '90px' }}><div className="sc-l">Total Diajukan</div><div className="sc-v">{proposals.length}</div><div className="sc-s">Proposal Aktif / Riwayat</div></div>
                  <div className="sc" style={{ borderLeftColor: '#f59e0b', height: '90px' }}><div className="sc-l" style={{ color: '#b45309' }}>Perlu Tindakan Anda</div><div className="sc-v" style={{ color: '#b45309' }}>{proposals.filter(p=>p.status === 'Menunggu Evidence').length}</div><div className="sc-s">Menunggu Upload Evidence</div></div>
                  <div className="sc" style={{ borderLeftColor: '#22c55e', height: '90px' }}><div className="sc-l" style={{ color: '#15803d' }}>Proses Selesai</div><div className="sc-v" style={{ color: '#15803d' }}>{proposals.filter(p=>p.status === 'Selesai').length}</div><div className="sc-s">Dana Cair & Selesai</div></div>
                </div>

                <div className="tc">
                  <div className="tc-top"><div className="tc-h">Daftar Proposal Saya</div></div>
                  <table>
                    <thead><tr><th>ID</th><th>Kegiatan</th><th>Tgl Rencana</th><th>Dana Diajukan</th><th>Status Track</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {proposals.map(p => (
                      <tr key={p.id}>
                        <td className="cid">{p.kode_tiket}</td>
                        <td><div className="cn">{p.kegiatan}</div><div className="cs" style={{color: 'var(--t3)'}}>{p.jenis}</div></td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{p.tgl_pelaksanaan}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>Rp {p.dana_diajukan}</td>
                        <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                        <td><button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setPortalTab('detail'); }}>Track Progress</button></td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {portalTab === 'new' && (
              <div className="tc" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <button className="btn btn-d" onClick={() => setPortalTab('home')}>&larr; Kembali</button>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>Formulir Pengajuan Proposal Dana</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="lbl">Nama / Judul Kegiatan</label>
                    <input className="inp" value={newProposal.kegiatan} onChange={e => setNewProposal({...newProposal, kegiatan: e.target.value})} placeholder="Contoh: Seminar Nasional Mahasiswa Berprestasi..." style={{ width: '100%', padding: '10px 12px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="lbl">Tanggal Rencana Pelaksanaan</label>
                      <input className="inp" type="date" value={newProposal.tgl_pelaksanaan} onChange={e => setNewProposal({...newProposal, tgl_pelaksanaan: e.target.value})} style={{ width: '100%', padding: '10px 12px' }} />
                    </div>
                    <div>
                      <label className="lbl">Skema Pencairan</label>
                      <select className="inp" value={newProposal.jenis} onChange={e => setNewProposal({...newProposal, jenis: e.target.value})} style={{ width: '100%', padding: '10px 12px' }}>
                        <option value="Advance">Advance Payment (Dana Di Depan)</option>
                        <option value="Reimburse">Reimbursement (Diganti Kemudian)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="lbl">Total Dana Diajukan (Rp)</label>
                      <input className="inp" type="number" value={newProposal.dana_diajukan} onChange={e => setNewProposal({...newProposal, dana_diajukan: e.target.value})} placeholder="Contoh: 5000000" style={{ width: '100%', padding: '10px 12px' }} />
                    </div>
                    <div>
                      <label className="lbl">Upload File Proposal (PDF)</label>
                      <input className="inp" type="file" onChange={e => setNewProposal({...newProposal, file: e.target.files[0]})} style={{ width: '100%', padding: '7px 12px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="lbl">Catatan / Rincian Singkat Tambahan</label>
                    <textarea className="inp" rows="3" value={newProposal.catatan} onChange={e => setNewProposal({...newProposal, catatan: e.target.value})} placeholder="Tuliskan catatan khusus jika ada keterkaitan dengan dana..." style={{ width: '100%', padding: '10px 12px' }}></textarea>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                     <button className="btn btn-d" onClick={() => setPortalTab('home')}>Batal</button>
                     <button className="btn btn-p" style={{ padding: '0 24px' }} disabled={!newProposal.kegiatan || !newProposal.tgl_pelaksanaan || !newProposal.dana_diajukan} onClick={handleCreateProposal}>Kirim Pengajuan Anda</button>
                  </div>
                </div>
              </div>
            )}

            {portalTab === 'detail' && selectedProposal && (
              <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <button className="btn btn-d" style={{ marginBottom: '20px' }} onClick={() => { setPortalTab('home'); setSelectedProposal(null); }}>&larr; Kembali ke Daftar Status</button>
                <div className="tc">
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Kode Tiket: {selectedProposal.kode_tiket}</div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>{selectedProposal.kegiatan}</div>
                      </div>
                      <span className={`status ${getStatusClass(selectedProposal.status)}`} style={{ fontSize: '13px', padding: '5px 12px' }}>{selectedProposal.status}</span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    {selectedProposal.status === 'Menunggu Evidence' && (
                        <>
                            <div className="notice" style={{ marginBottom: '16px' }}>Status saat ini menuntut aksi Anda! Segera kompres Laporan (Absen, Foto Dokumentasi, dan Kuitansi) Anda menjadi satu file ZIP/PDF lalu unggah.</div>
                            <input type="file" id={`evidence-${selectedProposal.id}`} style={{marginBottom: '10px'}} />
                            <button className="btn btn-p" onClick={() => {
                                const fileInput = document.getElementById(`evidence-${selectedProposal.id}`);
                                if (fileInput.files.length > 0) {
                                  const formData = new FormData();
                                  formData.append('evidence_dokumen', fileInput.files[0]);
                                  axios.post(`/api/proposals/${selectedProposal.id}/upload-evidence`, formData).then(() => {
                                      showToast('Evidence berhasil dikirim!');
                                      fetchProposals();
                                      setPortalTab('home');
                                  });
                                } else showToast('Pilih file dulu!');
                            }}>Kirim Dokumen Evidence</button>
                        </>
                    )}
                    {selectedProposal.status !== 'Menunggu Evidence' && (
                        <div>Informasi selengkapnya silakan hubungi admin.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MASTER */}
        {activePage === 'master' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.2px' }}>Master Database</div>
                <div style={{ fontSize: '13.5px', color: 'var(--t3)', marginTop: '2px' }}>Seluruh rekaman proposal, bukti transfer, dan evidence tersimpan di sini.</div>
              </div>
            </div>
            
            <div className="tc">
              <table>
                <thead><tr><th>Kode</th><th>Pemohon</th><th>Kegiatan</th><th>Dana (Rp)</th><th>Status</th></tr></thead>
                <tbody>
                  {proposals.map(p => (
                  <tr key={p.id}>
                    <td className="cid">{p.kode_tiket}</td>
                    <td style={{ fontWeight: 500 }}>{p.user?.name}</td>
                    <td>{p.kegiatan}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>{p.dana_diajukan}</td>
                    <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {activeModal === 'detail' && selectedProposal && (
        <div className="overlay open" onClick={(e) => { if (e.target.className.includes('overlay')) setActiveModal(null); }}>
          <div className="modal">
            <div className="mh"><div className="mt">Detail Proposal</div><button className="cx" onClick={() => setActiveModal(null)}>&#x2715;</button></div>
            <div className="mb">
              <div className="ig">
                <div className="ii"><div className="ik">ID</div><div className="iv" style={{ fontFamily: 'var(--mono)' }}>{selectedProposal.kode_tiket}</div></div>
                <div className="ii"><div className="ik">Status</div><div className="iv"><span className={`status ${getStatusClass(selectedProposal.status)}`}>{selectedProposal.status}</span></div></div>
                <div className="ii"><div className="ik">Pemohon</div><div className="iv">{selectedProposal.user?.name}</div></div>
                <div className="ii"><div className="ik">NIK</div><div className="iv" style={{ fontFamily: 'var(--mono)', color: 'var(--t2)' }}>{selectedProposal.user?.nik || '-'}</div></div>
                <div className="ii"><div className="ik">Kegiatan</div><div className="iv">{selectedProposal.kegiatan}</div></div>
                <div className="ii"><div className="ik">Tgl Pelaksanaan</div><div className="iv" style={{ fontFamily: 'var(--mono)' }}>{selectedProposal.tgl_pelaksanaan}</div></div>
                <div className="ii"><div className="ik">Jenis</div><div className="iv"><span className="tt">{selectedProposal.jenis}</span></div></div>
                <div className="ii"><div className="ik">Dana Diajukan</div><div className="iv" style={{ fontFamily: 'var(--mono)' }}>Rp {selectedProposal.dana_diajukan}</div></div>
              </div>
            </div>
            <div className="mf"><button className="btn btn-d" onClick={() => setActiveModal(null)}>Tutup</button></div>
          </div>
        </div>
      )}

      {activeModal === 'decision' && selectedProposal && (
        <div className="overlay open" onClick={(e) => { if (e.target.className.includes('overlay')) setActiveModal(null); }}>
          <div className="modal">
            <div className="mh"><div className="mt">Ubah Status Proposal</div><button className="cx" onClick={() => setActiveModal(null)}>&#x2715;</button></div>
            <div className="mb">
               <p style={{marginBottom: '10px'}}>Pilih status baru yang akan diterapkan pada proposal <strong>{selectedProposal.kode_tiket}</strong>.</p>
               <select className="inp" style={{width: '100%', padding: '10px', marginBottom: '20px'}} id="statusSelect" defaultValue={selectedProposal.status}>
                  <option>Dalam Antrean</option>
                  <option>Dalam Review</option>
                  <option>Menunggu Fisik</option>
                  <option>Dana Cair</option>
                  <option>Menunggu Evidence</option>
                  <option>Selesai</option>
                  <option>Gagal Bayar</option>
               </select>
               <button className="btn btn-p" onClick={() => {
                   const s = document.getElementById('statusSelect').value;
                   handleUpdateStatus(selectedProposal.id, s);
               }}>Simpan Status</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div id="toast" style={{ display: 'block' }}>
          <div className="ti">{toastMsg}</div>
        </div>
      )}
    </>
  );
}
