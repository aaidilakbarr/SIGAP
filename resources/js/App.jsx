import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import './index.css';
import webIcon from './assets/icon-web.svg';
import bannerLogo from './assets/banner.svg';
import UserPortal from './components/UserPortal';

// Bypass ngrok browser warning for API requests
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
axios.defaults.baseURL = window.APP_URL || '';

const TITLES = {
  dashboard: 'Dashboard',
  proposals: 'Manajemen Proposal',
  verification: 'Verifikasi Evidence',
  portal: 'Portal Pemohon',
  master: 'Master Database',
  logs: 'Activity Log'
};

const STATUS_STAGES = [
  { key: 'Dalam Antrean', label: 'Input', desc: 'Proposal disubmit dan masuk antrean sistem.' },
  { key: 'Dalam Review', label: 'Review', desc: 'Proposal sedang direview oleh pimpinan.' },
  { key: 'Menunggu Fisik', label: 'Fisik', desc: 'Menunggu penyerahan berkas fisik proposal.' },
  { key: 'Dana Cair', label: 'Dana Cair', desc: 'Dana telah berhasil dicairkan kepada pemohon.' },
  { key: 'Menunggu Evidence', label: 'Upload LPJ', desc: 'Pemohon harus mengunggah bukti/evidence.' },
  { key: 'Selesai', label: 'Selesai', desc: 'Seluruh proses telah selesai dan laporan diterima.' }
];

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(angka);
};

const renderTimeline = (currentStatus) => {
  let currentIndex = STATUS_STAGES.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === 'Gagal Bayar';
  if (isFailed) currentIndex = 3;

  // Fallback if not found
  if (currentIndex === -1 && !isFailed) currentIndex = 0;

  return (
    <div className="tl">
      {STATUS_STAGES.map((stage, idx) => {
        const isDone = idx < currentIndex || currentStatus === 'Selesai';
        const isNow = idx === currentIndex && !isFailed;
        const isFailStep = isFailed && idx === 3;

        return (
          <div key={stage.key} className={`tls ${isDone ? 'done' : ''} ${isNow ? 'now' : ''}`}>
            <div className={`tld ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${isFailStep ? 'fail' : ''}`}>
              {isDone ? '\u2713' : (isFailStep ? '\u2715' : (idx + 1))}
            </div>
            <div className="tll">
              <div style={{ fontWeight: 600 }}>{stage.label}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', lineHeight: '1.4', fontWeight: 'normal' }}>{stage.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function App() {


  const renderPagination = (currPage, totPage, handleFetch) => {
    if (totPage <= 1) return null;
    return (
      <div className="tc-pagination">
        <span className="tc-pag-info">Halaman <strong>{currPage}</strong> dari <strong>{totPage}</strong></span>
        <div className="tc-pag-actions">
          <button className="tc-pag-btn" disabled={currPage === 1} onClick={() => handleFetch(currPage - 1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span style={{ marginLeft: '4px' }}>Sebelumnya</span>
          </button>
          <button className="tc-pag-btn" disabled={currPage === totPage} onClick={() => handleFetch(currPage + 1)}>
            <span style={{ marginRight: '4px' }}>Selanjutnya</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    );
  };


  const [activePage, setActivePage] = useState('dashboard');
  const [activeRole, setActiveRole] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [portalTab, setPortalTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [proposals, setProposals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [decisionStatus, setDecisionStatus] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const [newProposal, setNewProposal] = useState({
    kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null
  });
  const [catatanRevisi, setCatatanRevisi] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [chartFilterMonth, setChartFilterMonth] = useState('');

  const filteredProposals = proposals; // Filtered in backend

  // Trigger fetch when filters or page change
  useEffect(() => {
    if (activeRole) fetchProposals(1);
  }, [searchQuery, filterStatus, filterDateFrom, filterDateTo, activePage]);

  const renderSearchBar = (showStatus = true, showDate = true) => (
    <div className="search-filter-bar">
      <div className="search-box">
        <span className="search-icon">&#x1F50D;</span>
        <input className="inp" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={showStatus ? "Cari ID, Nama, atau Kegiatan..." : "Cari ID, Nama Pemohon, Kegiatan... "} />
      </div>
      {showStatus && (
        <select className="inp filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="Dalam Antrean">Dalam Antrean</option>
          <option value="Dalam Review">Dalam Review</option>
          <option value="Menunggu Fisik">Menunggu Fisik</option>
          <option value="Dana Cair">Dana Cair</option>
          <option value="Menunggu Evidence">Menunggu Evidence</option>
          <option value="Menunggu Verif">Menunggu Verif</option>
          <option value="Selesai">Selesai</option>
          <option value="Gagal Bayar">Gagal Bayar</option>
        </select>
      )}
      {showDate && (
        <>
          <div className="filter-date-wrap">
            <span className="filter-date-lbl">Dari Tanggal</span>
            <input className="inp filter-date" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          </div>
          <div className="filter-date-wrap">
            <span className="filter-date-lbl">Sampai Tanggal</span>
            <input className="inp filter-date" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
        </>
      )}
      {(searchQuery || filterStatus || filterDateFrom || filterDateTo) && (
        <>
          <span className="filter-count">Menampilkan {proposals.length} dari total {totalItems} data</span>
          <button className="btn btn-d btn-sm filter-reset" onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }}>✕ Reset</button>
        </>
      )}
    </div>
  );

  const chartDataStatus = useMemo(() => {
    if (!dashboardStats) return [];
    return Object.keys(dashboardStats.status_counts).map(key => ({ name: key, value: dashboardStats.status_counts[key] }));
  }, [dashboardStats]);

  const CHART_COLORS = {
    'Dalam Antrean': 'url(#grad-antrean)',
    'Dalam Review': 'url(#grad-review)',
    'Revisi Proposal': 'url(#grad-revisi)',
    'Menunggu Fisik': 'url(#grad-fisik)',
    'Dana Cair': 'url(#grad-cair)',
    'Menunggu Evidence': 'url(#grad-evidence)',
    'Menunggu Verif': 'url(#grad-verif)',
    'Selesai': 'url(#grad-selesai)',
    'Gagal Bayar': 'url(#grad-gagal)'
  };

  const chartDataMonthly = useMemo(() => {
    if (!dashboardStats) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const data = months.map((m, idx) => ({ name: m, total: dashboardStats.monthly_counts[idx + 1] || 0 }));
    return data;
  }, [dashboardStats]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleExportCSV = async (filename) => {
    try {
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const fStatus = filterStatus ? `&status=${encodeURIComponent(filterStatus)}` : '';
      const fDateF = filterDateFrom ? `&date_from=${encodeURIComponent(filterDateFrom)}` : '';
      const fDateT = filterDateTo ? `&date_to=${encodeURIComponent(filterDateTo)}` : '';
      const res = await axios.get(`/api/proposals?export=1${q}${fStatus}${fDateF}${fDateT}`);
      const data = res.data.data;
      if (!data || data.length === 0) {
        showToast('Tidak ada data untuk diekspor');
        return;
      }
      const headers = ['Kode Tiket', 'Pemohon', 'Instansi', 'Kegiatan', 'Jenis', 'Tanggal Pelaksanaan', 'Dana Diajukan (Rp)', 'Status', 'Nama Bank', 'Nomor Rekening'];
      const csvContent = [
        headers.join(','),
        ...data.map(p => {
          const row = [ p.kode_tiket, p.user?.name || '', p.user?.instansi || '', p.kegiatan, p.jenis, p.tgl_pelaksanaan, p.dana_diajukan, p.status, p.nama_bank || '', p.nomor_rekening || '' ];
          return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        })
      ].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data berhasil diekspor ke CSV!');
    } catch (e) {
      showToast('Gagal mengekspor data');
    }
  };

  const handleLogin = async (role) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/login', { role });
      const { user: dbUser, token } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(dbUser);
      setActiveRole(role === 'user2' ? 'user' : role);
      fetchProposals();

      if (role === 'user' || role === 'user2') setActivePage('portal');
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

  const fetchStats = async () => {
    try {
      const q = chartFilterMonth ? `?month=${chartFilterMonth}` : '';
      const res = await axios.get(`/api/proposals/stats${q}`);
      setDashboardStats(res.data.data);
    } catch (e) { }
  };

  const fetchProposals = async (page = 1) => {
    try {
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      let s = filterStatus;
      if (activePage === 'verification') s = 'Menunggu Verif';
      const fStatus = s ? `&status=${encodeURIComponent(s)}` : '';
      const fDateF = filterDateFrom ? `&date_from=${encodeURIComponent(filterDateFrom)}` : '';
      const fDateT = filterDateTo ? `&date_to=${encodeURIComponent(filterDateTo)}` : '';
      const res = await axios.get(`/api/proposals?page=${page}${q}${fStatus}${fDateF}${fDateT}`);
      setProposals(res.data.data.data || []);
      setCurrentPage(res.data.data.current_page || 1);
      setTotalPages(res.data.data.last_page || 1);
      setTotalItems(res.data.data.total || 0);
    } catch (e) { }
  };

  const fetchLogs = async (page = 1) => {
    try {
      const res = await axios.get(`/api/logs?page=${page}`);
      setLogs(res.data.data.data || []);
      setLogsCurrentPage(res.data.data.current_page || 1);
      setLogsTotalPages(res.data.data.last_page || 1);
    } catch (e) { }
  };

  useEffect(() => {
    if (activeRole) {
      if (activePage === 'logs') {
        fetchLogs();
      }
      if (activePage === 'dashboard') {
        fetchStats();
      }
    }
  }, [activePage, chartFilterMonth, activeRole]);

  const handleCreateProposal = async () => {
    try {
      const formData = new FormData();
      formData.append('kegiatan', newProposal.kegiatan);
      formData.append('jenis', newProposal.jenis);
      formData.append('tgl_pelaksanaan', newProposal.tgl_pelaksanaan);
      formData.append('dana_diajukan', newProposal.dana_diajukan.toString().replace(/\./g, ''));
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

  const handleUpdateStatus = async (id, status, catatan = '') => {
    try {
      await axios.put(`/api/proposals/${id}/status`, { status, catatan_revisi: catatan });
      showToast(`Status diubah menjadi: ${status}`);
      fetchProposals();
      setActiveModal(null);
    } catch (e) {
      showToast('Gagal update status');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan revisi ini?')) return;
    try {
      await axios.delete(`/api/proposals/comments/${commentId}`);
      showToast('Catatan berhasil dihapus');
      if (selectedProposal) {
        setSelectedProposal({
          ...selectedProposal,
          comments: selectedProposal.comments.filter(c => c.id !== commentId)
        });
      }
      fetchProposals();
    } catch (e) {
      showToast('Gagal menghapus catatan');
    }
  };

  if (!activeRole) {
    return (
      <div className="overlay open" style={{ background: '#ffffff', zIndex: 9999, flexDirection: 'column' }}>
        <div style={{ background: 'var(--surface)', padding: '54px 48px', borderRadius: '24px', width: '450px', maxWidth: '95%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <img src={webIcon} alt="Logo" style={{ width: '180px', height: 'auto' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-1px' }}>SIGAP Login</div>
          <div style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '32px', lineHeight: '1.6' }}>Pilih peran untuk mensimulasikan sesi dan mengakses dashboard monitoring.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-p" style={{ padding: '14px', background: '#1a5e1f', borderColor: '#1a5e1f', height: '52px', fontSize: '15px' }} disabled={loading} onClick={() => handleLogin('master')}>Super Admin</button>
            <button className="btn btn-p" style={{ padding: '14px', background: '#237227', borderColor: '#237227', height: '52px', fontSize: '15px' }} disabled={loading} onClick={() => handleLogin('reviewer')}>Admin Administrator</button>
            <button className="btn btn-d" style={{ padding: '14px', height: '52px', fontSize: '15px', color: '#1a5e1f', borderColor: '#e2e8f0', fontWeight: 700 }} disabled={loading} onClick={() => handleLogin('user')}>User 1 / Pemohon (Ahmad)</button>
            <button className="btn btn-d" style={{ padding: '14px', height: '52px', fontSize: '15px', color: '#1a5e1f', borderColor: '#e2e8f0', fontWeight: 700 }} disabled={loading} onClick={() => handleLogin('user2')}>User 2 / Pemohon (Siti)</button>
          </div>
          <div style={{ marginTop: '32px', fontSize: '11px', color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Sistem Informasi Gerak Alur Proposal</div>
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
    if (status === 'Dalam Review' || status === 'Revisi Proposal') return 'sr';
    if (status === 'Menunggu Fisik') return 'sn';
    return 'sq';
  }

  return (
    <>
      {/* Mobile Sidebar Overlay (only for user on mobile) */}
      {activeRole === 'user' && (
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${activeRole === 'user' && sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sb-top" style={{ padding: '8px' }}>
          <img src={bannerLogo} alt="SIGAP" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <nav className="nav">
          <div className="nav-grp">
            <div className="nav-lbl">Menu</div>
            {(activeRole === 'master' || activeRole === 'reviewer') && (
              <>
                <div className={`ni ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>Dashboard</div>
                <div className={`ni ${activePage === 'proposals' ? 'active' : ''}`} onClick={() => setActivePage('proposals')}>Manajemen Proposal <span className="ni-c">{totalItems}</span></div>
                <div className={`ni ${activePage === 'verification' ? 'active' : ''}`} onClick={() => setActivePage('verification')}>Verifikasi Evidence <span className="ni-c">{dashboardStats?.total_evidence || 0}</span></div>
              </>
            )}
            {activeRole === 'user' && (
              <div className={`ni ${activePage === 'portal' ? 'active' : ''}`} onClick={() => { setActivePage('portal'); setSidebarOpen(false); }}>Portal Pemohon</div>
            )}
            {activeRole === 'master' && (
              <>
                <div className={`ni ${activePage === 'master' ? 'active' : ''}`} onClick={() => setActivePage('master')}>Master Database</div>
                <div className={`ni ${activePage === 'logs' ? 'active' : ''}`} onClick={() => setActivePage('logs')}>Activity Log</div>
              </>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Hamburger — hanya untuk user di mobile */}
            {activeRole === 'user' && (
              <button
                id="hamburger-btn"
                className="hamburger-btn"
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Buka menu"
              >
                ☰
              </button>
            )}
            <div>
              <div className="pg-title" id="pgTitle">
                {activePage === 'portal' && portalTab === 'new' ? 'Ajukan Proposal Baru' :
                  activePage === 'portal' && portalTab === 'detail' ? 'Track Progress' :
                    TITLES[activePage]}
              </div>
              <div className="pg-subtitle" style={{ fontSize: '13.5px', color: 'var(--t2)', marginTop: '4px' }}>
                {activePage === 'dashboard' && 'Ringkasan antrean dan status proposal saat ini.'}
                {activePage === 'proposals' && 'Kelola dan ubah status proposal yang masuk.'}
                {activePage === 'verification' && 'Review dan verifikasi dokumen evidence untuk pencairan dana.'}
                {activePage === 'master' && 'Seluruh rekaman proposal, bukti transfer, dan evidence tersimpan di sini.'}
                {activePage === 'logs' && 'Pantau seluruh aktivitas yang terjadi di dalam sistem.'}
                {activePage === 'portal' && portalTab === 'home' && `Selamat datang, ${user?.name || 'User'}!`}
                {activePage === 'portal' && portalTab === 'new' && 'Isi formulir dengan lengkap dan benar.'}
                {activePage === 'portal' && portalTab === 'detail' && 'Pantau perkembangan proposal Anda.'}
              </div>
            </div>
          </div>
          <div className="topbar-actions">
            {activePage === 'portal' && portalTab === 'home' && (
              <button className="btn btn-p" style={{ whiteSpace: 'nowrap' }} onClick={() => setPortalTab('new')}>+ Ajukan Baru</button>
            )}
          </div>
        </div>

        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="sc">
                <div className="sc-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="sc-l">Total Antrean</div>
                <div className="sc-v">{dashboardStats?.total_queue || 0}</div>
                <button className="sc-btn" onClick={() => setActivePage('proposals')}>View Details</button>
              </div>
              <div className="sc">
                <div className="sc-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="sc-l">Menunggu Review</div>
                <div className="sc-v">{dashboardStats?.total_review || 0}</div>
                <button className="sc-btn" onClick={() => setActivePage('proposals')}>View Details</button>
              </div>
              <div className="sc">
                <div className="sc-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div className="sc-l">Menunggu Evidence</div>
                <div className="sc-v">{dashboardStats?.total_evidence || 0}</div>
                <button className="sc-btn" onClick={() => setActivePage('verification')}>View Details</button>
              </div>
              <div className="sc">
                <div className="sc-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="sc-l">Selesai</div>
                <div className="sc-v">{dashboardStats?.total_selesai || 0}</div>
                <button className="sc-btn" onClick={() => setActivePage('master')}>View Details</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>Analitik Berdasarkan Waktu</div>
              <select className="inp" value={chartFilterMonth} onChange={e => setChartFilterMonth(e.target.value)} style={{ padding: '8px 14px', width: '220px', fontSize: '13px' }}>
                <option value="">Semua Bulan</option>
                <option value="0">Januari</option>
                <option value="1">Februari</option>
                <option value="2">Maret</option>
                <option value="3">April</option>
                <option value="4">Mei</option>
                <option value="5">Juni</option>
                <option value="6">Juli</option>
                <option value="7">Agustus</option>
                <option value="8">September</option>
                <option value="9">Oktober</option>
                <option value="10">November</option>
                <option value="11">Desember</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <div className="tc" style={{ height: '440px', display: 'flex', flexDirection: 'column' }}>
                <div className="tc-top"><div className="tc-h">Proporsi Status Proposal</div></div>
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="grad-antrean" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient>
                        <linearGradient id="grad-review" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#93c5fd" /></linearGradient>
                        <linearGradient id="grad-revisi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#fdba74" /></linearGradient>
                        <linearGradient id="grad-fisik" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fcd34d" /></linearGradient>
                        <linearGradient id="grad-cair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#6ee7b7" /></linearGradient>
                        <linearGradient id="grad-evidence" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#c4b5fd" /></linearGradient>
                        <linearGradient id="grad-verif" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f9a8d4" /></linearGradient>
                        <linearGradient id="grad-selesai" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#86efac" /></linearGradient>
                        <linearGradient id="grad-gagal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#fca5a5" /></linearGradient>
                      </defs>
                      <Pie data={chartDataStatus} cx="50%" cy="50%" innerRadius={80} outerRadius={105} paddingAngle={-10} cornerRadius={15} dataKey="value" stroke="none">
                        {chartDataStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#cbd5e1'} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', marginTop: '-18px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: '1' }}>
                      {chartDataStatus.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500, marginTop: '4px' }}>Proposal</div>
                  </div>
                </div>
              </div>
              <div className="tc" style={{ height: '440px', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div className="tc-top" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                  <div className="tc-h" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f172a' }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    Tren Pengajuan Bulanan
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, paddingRight: '15px', paddingTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', fontWeight: 600, color: '#0f172a' }} />
                      <Bar dataKey="total" name="Total Proposal" fill="url(#barGradient)" background={{ fill: '#f1f5f9', radius: 20 }} radius={20} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
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
                      <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: 500 }}>{p.tgl_pelaksanaan}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>Rp {formatRupiah(p.dana_diajukan)}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td>
                        <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Lihat Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentPage, totalPages, fetchProposals)}
            </div>
          </div>
        )}

        {/* PROPOSALS */}
        {activePage === 'proposals' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top">
                <div className="tc-h">Daftar Proposal</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleExportCSV('daftar_proposal')}>
                    <span style={{ fontSize: '14px' }}>📊</span> Ekspor CSV
                  </button>
                  <button className="exp-btn" onClick={() => fetchProposals()}>Refresh Data</button>
                </div>
              </div>
              {renderSearchBar()}
              <table>
                <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Jenis</th><th>Tgl Pelaksanaan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {filteredProposals.map(p => (
                    <tr key={p.id} className="hi">
                      <td className="cid">{p.kode_tiket}</td>
                      <td><div className="cn">{p.user?.name}</div></td>
                      <td>{p.kegiatan}</td><td><span className="tt">{p.jenis}</span></td>
                      <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: 500 }}>{p.tgl_pelaksanaan}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td className="ract">
                        <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setDecisionStatus(p.status); setUploadFile(null); setCatatanRevisi(''); setActiveModal('decision'); }}>Ubah Status</button>
                        <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentPage, totalPages, fetchProposals)}
            </div>
          </div>
        )}

        {/* VERIFICATION */}
        {activePage === 'verification' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top">
                <div className="tc-h">Verifikasi Evidence</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="exp-btn" onClick={() => fetchProposals()}>Refresh Data</button>
                </div>
              </div>
              {renderSearchBar(false, true)}
              <table>
                <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Dokumen Evidence</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {proposals.map(p => (
                    <tr key={p.id}>
                      <td className="cid">{p.kode_tiket}</td><td style={{ fontWeight: 500 }}>{p.user?.name}</td><td>{p.kegiatan}</td>
                      <td>{p.evidence_dokumen ? <span className="fl" onClick={() => showToast('Lihat ' + p.evidence_dokumen)}>{p.evidence_dokumen}</span> : 'Belum upload'}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td className="ract">
                        <button className="btn btn-p btn-sm" onClick={() => handleUpdateStatus(p.id, 'Selesai')}>Verifikasi Acc</button>
                        <button className="btn btn-d btn-sm" onClick={() => handleUpdateStatus(p.id, 'Menunggu Evidence')}>Tolak/Revisi</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentPage, totalPages, fetchProposals)}
            </div>
          </div>
        )}

        {/* PORTAL — Menggunakan komponen UserPortal (mobile-first) */}
        {activePage === 'portal' && (
          <UserPortal
            user={user}
            proposals={proposals}
            showToast={showToast}
            fetchProposals={fetchProposals}
            portalTab={portalTab}
            setPortalTab={setPortalTab}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            dashboardStats={dashboardStats}
            sidebarOpen={sidebarOpen}
          />
        )}

        {/* MASTER */}
        {activePage === 'master' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top">
                <div className="tc-h">Master Database</div>
                <button className="btn btn-success btn-sm" onClick={() => handleExportCSV('master_database')}>
                  <span style={{ fontSize: '14px' }}>📊</span> Ekspor CSV
                </button>
              </div>
              {renderSearchBar()}
              <table>
                <thead><tr><th>Kode</th><th>Pemohon</th><th>Kegiatan</th><th>Dana (Rp)</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {filteredProposals.map(p => (
                    <tr key={p.id}>
                      <td className="cid">{p.kode_tiket}</td>
                      <td style={{ fontWeight: 500 }}>{p.user?.name}</td>
                      <td>{p.kegiatan}</td>
                      <td style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap' }}>Rp {formatRupiah(p.dana_diajukan)}</td>
                      <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                      <td className="ract">
                        <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Lihat Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(currentPage, totalPages, fetchProposals)}
            </div>
          </div>
        )}
        {/* LOGS */}
        {activePage === 'logs' && (
          <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="tc">
              <div className="tc-top">
                <div className="tc-h">Sistem Activity Log</div>
                <button className="exp-btn" onClick={() => fetchLogs()}>Refresh</button>
              </div>
              <table>
                <thead><tr><th>Waktu</th><th>Sistem/Aktor</th><th>Aksi</th><th>Deskripsi Lengkap</th></tr></thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 500, fontSize: '13px', color: 'var(--t2)', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td>
                        <div className="cn">{log.name || 'System'}</div>
                        <div className="cs">{log.role || '-'}</div>
                      </td>
                      <td><span className="tt" style={{ whiteSpace: 'nowrap' }}>{log.action}</span></td>
                      <td style={{ fontSize: '14px', lineHeight: '1.4', color: 'var(--t2)' }}>{log.description}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--t3)' }}>Belum ada log aktivitas</td></tr>
                  )}
                </tbody>
              </table>
              {renderPagination(currentPage, totalPages, fetchProposals)}
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
                <div className="ii"><div className="ik">ID</div><div className="iv" style={{ fontWeight: 600, color: 'var(--t2)', fontSize: '13.5px' }}>{selectedProposal.kode_tiket}</div></div>
                <div className="ii"><div className="ik">Status</div><div className="iv"><span className={`status ${getStatusClass(selectedProposal.status)}`}>{selectedProposal.status}</span></div></div>
                {selectedProposal.revisi_deadline && (
                  <div className="ii" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span> 
                      <div><strong style={{ fontSize: '13px' }}>Batas Pengerjaan Revisi:</strong> <span style={{ fontSize: '13px', marginLeft: '4px' }}>{new Date(selectedProposal.revisi_deadline).toLocaleString('id-ID')}</span></div>
                    </div>
                  </div>
                )}
                <div className="ii"><div className="ik">Pemohon</div><div className="iv">{selectedProposal.user?.name}</div></div>
                <div className="ii"><div className="ik">Nomor Telepon</div><div className="iv" style={{ fontWeight: 500, color: 'var(--t2)' }}>{selectedProposal.user?.nomor_telepon || '-'}</div></div>
                <div className="ii"><div className="ik">Kegiatan</div><div className="iv">{selectedProposal.kegiatan}</div></div>
                <div className="ii"><div className="ik">Tgl Pelaksanaan</div><div className="iv" style={{ fontWeight: 500, color: 'var(--text)' }}>{selectedProposal.tgl_pelaksanaan}</div></div>
                <div className="ii"><div className="ik">Jenis</div><div className="iv"><span className="tt">{selectedProposal.jenis}</span></div></div>
                <div className="ii"><div className="ik">Dana Diajukan</div><div className="iv" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>Rp {formatRupiah(selectedProposal.dana_diajukan)}</div></div>
                {(selectedProposal.nama_bank || selectedProposal.nomor_rekening) && (
                  <div className="ii" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div className="ik" style={{ marginBottom: '4px' }}>Target Pengiriman Dana (Rekening)</div>
                    <div className="iv" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {selectedProposal.nama_bank || '-'} — {selectedProposal.nomor_rekening || '-'}
                    </div>
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>DOKUMEN TERLAMPIR</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedProposal.file_proposal && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: '8px', padding: '12px 16px', border: '1px solid #d1fae5' }}>
                        <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FILE PROPOSAL</div>
                        <a href={`/storage/${selectedProposal.file_proposal}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                      </div>
                    )}
                    {selectedProposal.evidence_dokumen && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', borderRadius: '8px', padding: '12px 16px', border: '1px solid #fef3c7' }}>
                        <div style={{ fontWeight: 700, color: '#92400e', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FILE LPJ</div>
                        <a href={`/storage/${selectedProposal.evidence_dokumen}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                      </div>
                    )}
                    {selectedProposal.bukti_transfer && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', borderRadius: '8px', padding: '12px 16px', border: '1px solid #e0f2fe' }}>
                        <div style={{ fontWeight: 700, color: '#075985', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUKTI PEMBAYARAN</div>
                        <a href={`/storage/${selectedProposal.bukti_transfer}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                      </div>
                    )}
                  </div>
                </div>

                {selectedProposal.comments && selectedProposal.comments.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '16px', border: '1px solid #fef3c7' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#b45309', letterSpacing: '0.5px', marginBottom: '12px', textTransform: 'uppercase' }}>CATATAN DARI ADMIN</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedProposal.comments.map(c => (
                          <div key={c.id} style={{ fontSize: '13.5px', color: '#92400e', lineHeight: '1.5', whiteSpace: 'pre-wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ fontWeight: 600, fontSize: '12px' }}>{new Date(c.created_at).toLocaleString('id-ID')}</div>
                              {(activeRole === 'master' || activeRole === 'reviewer') && (
                                <button className="btn btn-d btn-sm" style={{ padding: '2px 8px', fontSize: '11px', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} onClick={(e) => { e.stopPropagation(); handleDeleteComment(c.id); }}>Hapus</button>
                              )}
                            </div>
                            {c.komentar}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="mb" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>Ubah Status Proposal</div>
                  <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Pilih status baru yang akan diterapkan pada proposal dengan ID <strong style={{ color: '#0f172a' }}>{selectedProposal.kode_tiket}</strong>.</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="lbl" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>Status Baru</label>
                <div style={{ position: 'relative' }}>
                  <select className="inp" style={{ width: '100%', padding: '12px 16px', fontSize: '15px', color: 'var(--text)', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', appearance: 'none', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} value={decisionStatus} onChange={(e) => setDecisionStatus(e.target.value)}>
                    <option value="Dalam Antrean">Dalam Antrean</option>
                    <option value="Dalam Review">Dalam Review</option>
                    <option value="Revisi Proposal">Revisi Proposal</option>
                    <option value="Menunggu Fisik">Menunggu Fisik</option>
                    <option value="Dana Cair">Dana Cair</option>
                    <option value="Menunggu Evidence">Menunggu Evidence</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Gagal Bayar">Gagal Bayar</option>
                  </select>
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {(decisionStatus === 'Dalam Review' || decisionStatus === 'Revisi Proposal' || decisionStatus === 'Menunggu Evidence') && (
                <div style={{ marginBottom: '24px' }}>
                  <label className="lbl" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>Catatan Revisi / Pesan <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea className="inp" value={catatanRevisi} onChange={e => setCatatanRevisi(e.target.value)} rows="3" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} placeholder="Tuliskan catatan atau instruksi perbaikan..."></textarea>
                </div>
              )}

              {decisionStatus === 'Dana Cair' && (
                <div style={{ marginBottom: '24px', padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                  <label className="lbl" style={{ color: '#0369a1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Upload Bukti Pengiriman Dana (*.PDF, Max 5MB)</label>
                  <input type="file" className="inp" accept="application/pdf" onChange={e => setUploadFile(e.target.files[0])} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px dashed #7dd3fc', borderRadius: '6px' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
                <button className="btn btn-p" style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} disabled={decisionStatus === 'Dana Cair' && !uploadFile && selectedProposal.status !== 'Dana Cair'} onClick={() => {
                  if (decisionStatus === 'Dana Cair' && uploadFile) {
                    const formData = new FormData();
                    formData.append('bukti_transfer', uploadFile);
                    axios.post(`/api/proposals/${selectedProposal.id}/upload-bukti`, formData).then(() => {
                      showToast('Bukti transfer berhasil diupload dan status diperbarui!');
                      fetchProposals();
                      setActiveModal(null);
                    }).catch(e => showToast('Gagal upload bukti transfer (Pastikan format PDF Max 5MB)'));
                  } else {
                    handleUpdateStatus(selectedProposal.id, decisionStatus, catatanRevisi);
                  }
                }}>Simpan Status</button>
              </div>
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
