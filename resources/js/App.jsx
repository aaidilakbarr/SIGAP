import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import webIcon from './assets/icon-web.svg';
import bannerLogo from './assets/banner.svg';

import { TITLES, STATUS_STAGES } from './components/shared/utils';
import { DashboardPage } from './components/pages/DashboardPage';
import { ProposalsPage, VerificationPage, MasterPage, LogsPage } from './components/pages/AdminPages';
import { DetailModal, StatusModal } from './components/modals/Modals';
import UserPortal from './components/UserPortal';

// ─── Axios global config ──────────────────────────────────────────────────────
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
axios.defaults.baseURL = window.APP_URL || '';

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Navigation
  const [activePage, setActivePage] = useState('dashboard');
  const [activeRole, setActiveRole] = useState(null);
  const [portalTab, setPortalTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // UI state
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Auth
  const [user, setUser] = useState(null);

  // Data
  const [proposals, setProposals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  // Search & filter (shared state, used by pages via props)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [chartFilterMonth, setChartFilterMonth] = useState('');

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // ─── Data fetching ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const q = chartFilterMonth ? `?month=${chartFilterMonth}` : '';
      const res = await axios.get(`/api/proposals/stats${q}`);
      setDashboardStats(res.data.data);
    } catch (e) {}
  };

  const fetchProposals = async (page = 1) => {
    try {
      const q       = searchQuery   ? `&search=${encodeURIComponent(searchQuery)}`     : '';
      let s         = filterStatus;
      if (activePage === 'verification') s = 'Menunggu Verif';
      const fStatus = s             ? `&status=${encodeURIComponent(s)}`               : '';
      const fDateF  = filterDateFrom? `&date_from=${encodeURIComponent(filterDateFrom)}`: '';
      const fDateT  = filterDateTo  ? `&date_to=${encodeURIComponent(filterDateTo)}`   : '';
      const res = await axios.get(`/api/proposals?page=${page}${q}${fStatus}${fDateF}${fDateT}`);
      setProposals(res.data.data.data || []);
      setCurrentPage(res.data.data.current_page || 1);
      setTotalPages(res.data.data.last_page || 1);
      setTotalItems(res.data.data.total || 0);
    } catch (e) {}
  };

  const fetchLogs = async (page = 1) => {
    try {
      const res = await axios.get(`/api/logs?page=${page}`);
      setLogs(res.data.data.data || []);
      setLogsCurrentPage(res.data.data.current_page || 1);
      setLogsTotalPages(res.data.data.last_page || 1);
    } catch (e) {}
  };

  // Refetch on filter/page change
  useEffect(() => {
    if (activeRole) fetchProposals(1);
  }, [searchQuery, filterStatus, filterDateFrom, filterDateTo, activePage]);

  useEffect(() => {
    if (!activeRole) return;
    if (activePage === 'logs')      fetchLogs();
    if (activePage === 'dashboard') fetchStats();
  }, [activePage, chartFilterMonth, activeRole]);

  // ─── Action handlers ─────────────────────────────────────────────────────────
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

  const handleUpdateStatus = async (id, status, catatan = '') => {
    try {
      await axios.put(`/api/proposals/${id}/status`, { status, catatan_revisi: catatan });
      showToast(`Status diubah menjadi: ${status}`);
      fetchProposals();
      fetchStats();
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
          comments: selectedProposal.comments.filter(c => c.id !== commentId),
        });
      }
      fetchProposals();
    } catch (e) {
      showToast('Gagal menghapus catatan');
    }
  };

  const handleExportCSV = async (filename) => {
    try {
      const q      = searchQuery   ? `&search=${encodeURIComponent(searchQuery)}`      : '';
      const fStatus= filterStatus  ? `&status=${encodeURIComponent(filterStatus)}`     : '';
      const fDateF = filterDateFrom? `&date_from=${encodeURIComponent(filterDateFrom)}`: '';
      const fDateT = filterDateTo  ? `&date_to=${encodeURIComponent(filterDateTo)}`    : '';
      const res = await axios.get(`/api/proposals?export=1${q}${fStatus}${fDateF}${fDateT}`);
      const data = res.data.data;
      if (!data || data.length === 0) { showToast('Tidak ada data untuk diekspor'); return; }
      const headers = ['Kode Tiket','Pemohon','Instansi','Kegiatan','Jenis','Tanggal Pelaksanaan','Dana Diajukan (Rp)','Status','Nama Bank','Nomor Rekening'];
      const csvContent = [
        headers.join(','),
        ...data.map(p => {
          const row = [p.kode_tiket, p.user?.name||'', p.user?.instansi||'', p.kegiatan, p.jenis, p.tgl_pelaksanaan, p.dana_diajukan, p.status, p.nama_bank||'', p.nomor_rekening||''];
          return row.map(val => `"${String(val).replace(/"/g,'""')}"`).join(',');
        }),
      ].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
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

  // ─── Shared filter props (passed to pages) ───────────────────────────────────
  const filterProps = {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    filterDateFrom, setFilterDateFrom,
    filterDateTo, setFilterDateTo,
    totalItems, proposalsLength: proposals.length,
  };

  // ─── Login screen ────────────────────────────────────────────────────────────
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

  // ─── Role display ────────────────────────────────────────────────────────────
  const getRoleDetails = () => {
    if (activeRole === 'master')   return { dot: 'SA', name: user?.name, role: 'Super Admin' };
    if (activeRole === 'reviewer') return { dot: 'AA', name: user?.name, role: 'Admin Administrator' };
    return { dot: 'U', name: user?.name, role: 'User' };
  };
  const { dot, name, role } = getRoleDetails();

  // ─── Page title / subtitle ───────────────────────────────────────────────────
  const pageTitle = activePage === 'portal' && portalTab === 'new'    ? 'Ajukan Proposal Baru'
                  : activePage === 'portal' && portalTab === 'detail'  ? 'Track Progress'
                  : TITLES[activePage];

  const pageSubtitle = {
    dashboard:    'Ringkasan antrean dan status proposal saat ini.',
    proposals:    'Kelola dan ubah status proposal yang masuk.',
    verification: 'Review dan verifikasi dokumen evidence untuk pencairan dana.',
    master:       'Seluruh rekaman proposal, bukti transfer, dan evidence tersimpan di sini.',
    logs:         'Pantau seluruh aktivitas yang terjadi di dalam sistem.',
  }[activePage] || (
    activePage === 'portal'
      ? portalTab === 'home'   ? `Selamat datang, ${user?.name || 'User'}!`
      : portalTab === 'new'    ? 'Isi formulir dengan lengkap dan benar.'
      : 'Pantau perkembangan proposal Anda.'
      : ''
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Mobile sidebar overlay */}
      {activeRole === 'user' && (
        <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`sidebar ${activeRole === 'user' && sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sb-top" style={{ padding: '8px' }}>
          <img src={bannerLogo} alt="SIGAP" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <nav className="nav">
          <div className="nav-grp">
            <div className="nav-lbl">Menu</div>
            {(activeRole === 'master' || activeRole === 'reviewer') && (
              <>
                <div className={`ni ${activePage === 'dashboard'    ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>Dashboard</div>
                <div className={`ni ${activePage === 'proposals'    ? 'active' : ''}`} onClick={() => setActivePage('proposals')}>Manajemen Proposal <span className="ni-c">{totalItems}</span></div>
                <div className={`ni ${activePage === 'verification' ? 'active' : ''}`} onClick={() => setActivePage('verification')}>Verifikasi Evidence <span className="ni-c">{dashboardStats?.total_verif || 0}</span></div>
              </>
            )}
            {activeRole === 'user' && (
              <div className={`ni ${activePage === 'portal' ? 'active' : ''}`} onClick={() => { setActivePage('portal'); setSidebarOpen(false); }}>Portal Pemohon</div>
            )}
            {activeRole === 'master' && (
              <>
                <div className={`ni ${activePage === 'master' ? 'active' : ''}`} onClick={() => setActivePage('master')}>Master Database</div>
                <div className={`ni ${activePage === 'logs'   ? 'active' : ''}`} onClick={() => setActivePage('logs')}>Activity Log</div>
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

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {activeRole === 'user' && (
              <button id="hamburger-btn" className="hamburger-btn" onClick={() => setSidebarOpen(prev => !prev)} aria-label="Buka menu">☰</button>
            )}
            <div>
              <div className="pg-title" id="pgTitle">{pageTitle}</div>
              <div className="pg-subtitle" style={{ fontSize: '13.5px', color: 'var(--t2)', marginTop: '4px' }}>{pageSubtitle}</div>
            </div>
          </div>
          <div className="topbar-actions">
            {activePage === 'portal' && portalTab === 'home' && (
              <button className="btn btn-p" style={{ whiteSpace: 'nowrap' }} onClick={() => setPortalTab('new')}>+ Ajukan Baru</button>
            )}
          </div>
        </div>

        {/* Pages */}
        {activePage === 'dashboard' && (
          <DashboardPage
            dashboardStats={dashboardStats} proposals={proposals}
            currentPage={currentPage} totalPages={totalPages}
            chartFilterMonth={chartFilterMonth} setChartFilterMonth={setChartFilterMonth}
            setActivePage={setActivePage}
            setSelectedProposal={setSelectedProposal} setActiveModal={setActiveModal}
            fetchProposals={fetchProposals}
          />
        )}

        {activePage === 'proposals' && (
          <ProposalsPage
            proposals={proposals} currentPage={currentPage} totalPages={totalPages}
            {...filterProps}
            fetchProposals={fetchProposals} fetchStats={fetchStats}
            handleExportCSV={handleExportCSV}
            setSelectedProposal={setSelectedProposal} setActiveModal={setActiveModal}
          />
        )}

        {activePage === 'verification' && (
          <VerificationPage
            proposals={proposals} currentPage={currentPage} totalPages={totalPages}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
            totalItems={totalItems}
            fetchProposals={fetchProposals} fetchStats={fetchStats}
            handleUpdateStatus={handleUpdateStatus} showToast={showToast}
            setSelectedProposal={setSelectedProposal} setActiveModal={setActiveModal}
          />
        )}

        {activePage === 'portal' && (
          <UserPortal
            user={user} proposals={proposals} showToast={showToast}
            fetchProposals={fetchProposals} portalTab={portalTab} setPortalTab={setPortalTab}
            totalItems={totalItems} currentPage={currentPage} totalPages={totalPages}
            dashboardStats={dashboardStats} sidebarOpen={sidebarOpen}
          />
        )}

        {activePage === 'master' && (
          <MasterPage
            proposals={proposals} currentPage={currentPage} totalPages={totalPages}
            {...filterProps}
            fetchProposals={fetchProposals} handleExportCSV={handleExportCSV}
            setSelectedProposal={setSelectedProposal} setActiveModal={setActiveModal}
          />
        )}

        {activePage === 'logs' && (
          <LogsPage
            logs={logs} fetchLogs={fetchLogs}
            currentPage={logsCurrentPage} totalPages={logsTotalPages}
            fetchProposals={fetchLogs}
          />
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {activeModal === 'detail' && selectedProposal && (
        <DetailModal
          proposal={selectedProposal} activeRole={activeRole}
          onClose={() => setActiveModal(null)}
          onDeleteComment={handleDeleteComment}
          showToast={showToast}
        />
      )}

      {activeModal === 'decision' && selectedProposal && (
        <StatusModal
          proposal={selectedProposal}
          onClose={() => setActiveModal(null)}
          onUpdateStatus={handleUpdateStatus}
          showToast={showToast}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div id="toast" style={{ display: 'block' }}>
          <div className="ti">{toastMsg}</div>
        </div>
      )}
    </>
  );
}
