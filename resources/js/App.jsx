import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  ChevronLeft,
  Database,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Newspaper,
  PanelLeft,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import webIcon from './assets/icon-web.svg';
import bannerLogo from './assets/banner.svg';

import { TITLES } from './components/shared/utils';
import { DashboardPage } from './components/pages/DashboardPage';
import { ProposalsPage, VerificationPage, MasterPage, LogsPage } from './components/pages/AdminPages';
import { BeritaAcaraListPage } from './components/pages/BeritaAcaraListPage';
import { MonitoringBeritaPage } from './components/pages/MonitoringBeritaPage';
import { DetailModal, StatusModal } from './components/modals/Modals';
import { WhatsAppButton } from './components/shared/WhatsAppButton';
import UserPortal from './components/UserPortal';
import { useAppContext } from './context/AppContext';
import NotificationBell from './components/shared/NotificationBell';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
axios.defaults.baseURL = window.APP_URL || '';

function SidebarNav({
  activeRole,
  activePage,
  setActivePage,
  totalItems,
  dashboardStats,
  dot,
  name,
  role,
  handleLogout,
  onNavigate,
  onCloseMobile,
  collapsed = false,
}) {
  const go = (page) => {
    setActivePage(page);
    if (onNavigate) onNavigate();
  };

  const navItems = [];
  if (activeRole === 'master' || activeRole === 'reviewer') {
    navItems.push(
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'proposals', label: 'Manajemen Proposal', icon: FileText, count: totalItems },
      {
        key: 'verification',
        label: 'Verifikasi Evidence',
        icon: FileCheck2,
        count: dashboardStats?.total_verif || 0,
      },
      { key: 'berita_acara', label: 'Daftar Berita Acara', icon: FileSpreadsheet },
      { key: 'monitoring_berita', label: 'Monitoring Berita', icon: Newspaper }
    );
  }
  if (activeRole === 'user') {
    navItems.push({ key: 'portal', label: 'Portal Pemohon', icon: LayoutDashboard });
  }
  if (activeRole === 'master') {
    navItems.push(
      { key: 'master', label: 'Master Database', icon: Database },
      { key: 'logs', label: 'Activity Log', icon: Activity }
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      {/* Brand header with smooth logo crossfade */}
      <div
        className={cn(
          'relative flex h-16 shrink-0 items-center overflow-hidden border-b border-sidebar-border bg-white px-4',
          onCloseMobile ? 'justify-between gap-2' : 'justify-center'
        )}
      >
        <img
          src={bannerLogo}
          alt="SIGAP"
          className={cn(
            'h-auto w-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            onCloseMobile ? 'max-w-[164px]' : 'max-w-[188px]',
            collapsed ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        {!onCloseMobile && (
          <img
            src={webIcon}
            alt="SIGAP"
            className={cn(
              'absolute h-9 w-9 object-contain transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              collapsed ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'
            )}
          />
        )}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground transition-colors hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="Navigasi utama">
        <div
          className={cn(
            'overflow-hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-white/60 transition-all duration-200 ease-out motion-reduce:transition-none',
            collapsed ? 'mb-0 max-h-0 opacity-0' : 'mb-2 max-h-6 opacity-100'
          )}
        >
          Menu
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            const hasCount = typeof item.count === 'number';
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => go(item.key)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={cn(
                  'group relative flex w-full min-h-11 items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98] motion-reduce:transition-none',
                  collapsed ? 'px-[17px]' : 'px-3 text-left',
                  isActive
                    ? 'bg-white text-[#144518] font-semibold shadow-xs'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap truncate transition-all duration-250 ease-out motion-reduce:transition-none',
                    collapsed
                      ? 'ml-0 max-w-0 -translate-x-1.5 opacity-0'
                      : 'ml-2.5 max-w-[155px] translate-x-0 opacity-100'
                  )}
                >
                  {item.label}
                </span>
                {hasCount && (
                  <span
                    className={cn(
                      'overflow-hidden rounded-md py-0.5 text-xs font-bold tabular-nums transition-all duration-200 ease-out motion-reduce:transition-none',
                      isActive ? 'bg-[#1a5e1f]/12 text-[#1a5e1f]' : 'bg-white/15 text-white',
                      collapsed
                        ? 'ml-0 max-w-0 scale-75 px-0 opacity-0'
                        : 'ml-auto max-w-12 scale-100 px-2 opacity-100'
                    )}
                  >
                    {item.count}
                  </span>
                )}
                {hasCount && item.count > 0 && (
                  <span
                    className={cn(
                      'absolute top-2 right-2 flex size-2 rounded-full bg-amber-300 transition-all duration-200 ease-out motion-reduce:transition-none',
                      collapsed ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3.5 space-y-3">
        <div
          className={cn(
            'flex items-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            collapsed ? 'px-1.5' : 'px-0.5'
          )}
          title={collapsed ? `${name} (${role})` : undefined}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white">
            {dot}
          </div>
          <div
            className={cn(
              'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-250 ease-out motion-reduce:transition-none',
              collapsed
                ? 'ml-0 max-w-0 -translate-x-1.5 opacity-0'
                : 'ml-3 max-w-[160px] translate-x-0 opacity-100'
            )}
          >
            <div className="truncate text-sm font-semibold text-white">{name}</div>
            <div className="truncate text-xs text-white/70">{role}</div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          title="Logout / Ganti Sesi"
          aria-label="Logout"
          className={cn(
            'min-h-10 w-full gap-0 overflow-hidden border-white/25 bg-white/10 text-white transition-all duration-250 hover:bg-red-600 hover:border-red-600 hover:text-white active:scale-[0.98] motion-reduce:transition-none',
            collapsed ? 'px-0 justify-center' : 'px-3 justify-center'
          )}
        >
          <LogOut className="size-4 shrink-0" />
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-all duration-250 ease-out motion-reduce:transition-none',
              collapsed
                ? 'ml-0 max-w-0 -translate-x-1 opacity-0'
                : 'ml-2 max-w-[150px] translate-x-0 opacity-100'
            )}
          >
            Logout / Ganti Sesi
          </span>
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  const {
    user,
    setUser,
    activeRole,
    setActiveRole,
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    showToast,
    loading,
    setLoading,
    handleLogout,
  } = useAppContext();

  const [portalTab, setPortalTab] = useState('home');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sigap_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sigap_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [chartFilterMonth, setChartFilterMonth] = useState('');

  const fetchStats = async () => {
    try {
      const q = chartFilterMonth ? `?month=${chartFilterMonth}` : '';
      const res = await axios.get(`/api/proposals/stats${q}`);
      setDashboardStats(res.data.data);
    } catch (e) {}
  };

  const fetchProposals = async (page = 1) => {
    try {
      setProposalsLoading(true);
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
    } catch (e) {
      showToast('Gagal memuat data proposal.', 'error');
    } finally {
      setProposalsLoading(false);
    }
  };

  const fetchLogs = async (page = 1) => {
    try {
      setLogsLoading(true);
      const res = await axios.get(`/api/logs?page=${page}`);
      setLogs(res.data.data.data || []);
      setLogsCurrentPage(res.data.data.current_page || 1);
      setLogsTotalPages(res.data.data.last_page || 1);
    } catch (e) {
      showToast('Gagal memuat activity log.', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole) fetchProposals(1);
  }, [searchQuery, filterStatus, filterDateFrom, filterDateTo, activePage]);

  useEffect(() => {
    if (!activeRole) return;
    if (activePage === 'logs') fetchLogs();
    if (activePage === 'dashboard' || activePage === 'portal') fetchStats();
  }, [activePage, chartFilterMonth, activeRole]);

  const handleLogin = async (role) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/login', { role });
      const { user: dbUser, token } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(dbUser);
      setActiveRole(role === 'user2' ? 'user' : role);
      setSearchQuery('');
      setFilterStatus('');
      setFilterDateFrom('');
      setFilterDateTo('');
      setChartFilterMonth('');
      setPortalTab('home');
      fetchProposals(1);
      if (role === 'user' || role === 'user2') setActivePage('portal');
      else setActivePage('dashboard');
    } catch (e) {
      showToast('Login gagal. Periksa koneksi backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, catatan = '') => {
    try {
      await axios.put(`/api/proposals/${id}/status`, { status, catatan_revisi: catatan });
      showToast(`Status diubah menjadi: ${status}`, 'success');
      fetchProposals(currentPage);
      fetchStats();
      setActiveModal(null);
    } catch (e) {
      showToast('Gagal memperbarui status.', 'error');
    }
  };

  const confirmDeleteComment = async () => {
    if (!pendingDeleteCommentId) return;
    const commentId = pendingDeleteCommentId;
    setPendingDeleteCommentId(null);
    try {
      await axios.delete(`/api/proposals/comments/${commentId}`);
      showToast('Catatan berhasil dihapus.', 'success');
      if (selectedProposal) {
        setSelectedProposal({
          ...selectedProposal,
          comments: selectedProposal.comments.filter((c) => c.id !== commentId),
        });
      }
      fetchProposals(currentPage);
    } catch (e) {
      showToast('Gagal menghapus catatan.', 'error');
    }
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
        showToast('Tidak ada data untuk diekspor.', 'error');
        return;
      }
      const headers = [
        'Kode Tiket',
        'Pemohon',
        'Instansi',
        'Kegiatan',
        'Jenis',
        'Tanggal Pelaksanaan',
        'Dana Diajukan (Rp)',
        'Status',
        'Nama Bank',
        'Nomor Rekening',
        'Atas Nama',
      ];
      const csvContent = [
        headers.join(','),
        ...data.map((p) => {
          const row = [
            p.kode_tiket,
            p.user?.name || '',
            p.user?.instansi || '',
            p.kegiatan,
            p.jenis,
            p.tgl_pelaksanaan,
            p.dana_diajukan,
            p.status,
            p.nama_bank || '',
            p.nomor_rekening || '',
            p.atas_nama || '',
          ];
          return row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
        }),
      ].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Data berhasil diekspor ke CSV.', 'success');
    } catch (e) {
      showToast('Gagal mengekspor data.', 'error');
    }
  };

  const filterProps = {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    totalItems,
    proposalsLength: proposals.length,
  };

  // Login screen
  if (!activeRole) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-6 sm:p-6">
        <Card className="w-full max-w-md border-border shadow-md">
          <CardContent className="p-6 sm:p-9 text-center">
            <div className="mb-5 flex justify-center sm:mb-7">
              <img src={webIcon} alt="Logo SIGAP" className="h-auto w-32 sm:w-44" />
            </div>

            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              SIGAP Login
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed sm:mt-2 sm:text-sm">
              Pilih peran untuk mensimulasikan sesi dan mengakses dashboard monitoring proposal.
            </p>

            <div className="mt-7 flex flex-col gap-2.5">
              <Button
                size="lg"
                className="h-12 w-full justify-start px-4 text-sm font-semibold"
                disabled={loading}
                onClick={() => handleLogin('master')}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4.5" />}
                <span>Super Admin</span>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-12 w-full justify-start px-4 text-sm font-semibold bg-[#237227] text-white hover:bg-[#1d6020]"
                disabled={loading}
                onClick={() => handleLogin('reviewer')}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4.5" />}
                <span>Admin Administrator</span>
              </Button>

              <div className="my-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>Portal Pemohon</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full justify-start px-4 text-sm font-semibold text-primary border-border hover:bg-primary/5"
                disabled={loading}
                onClick={() => handleLogin('user')}
              >
                <Users className="size-4.5" />
                <span>User 1 / Pemohon (Ahmad)</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full justify-start px-4 text-sm font-semibold text-primary border-border hover:bg-primary/5"
                disabled={loading}
                onClick={() => handleLogin('user2')}
              >
                <Users className="size-4.5" />
                <span>User 2 / Pemohon (Siti)</span>
              </Button>
            </div>

            <div className="mt-7 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Sistem Informasi Gerak Alur Proposal
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleDetails = () => {
    if (activeRole === 'master') return { dot: 'SA', name: user?.name || 'Super Admin', role: 'Super Admin' };
    if (activeRole === 'reviewer') return { dot: 'AA', name: user?.name || 'Admin', role: 'Admin Administrator' };
    return { dot: 'U', name: user?.name || 'Pemohon', role: 'Pemohon' };
  };
  const { dot, name, role } = getRoleDetails();

  const pageTitle =
    activePage === 'portal' && portalTab === 'new'
      ? 'Ajukan Proposal Baru'
      : activePage === 'portal' && portalTab === 'detail'
      ? 'Track Progress'
      : TITLES[activePage];

  const pageSubtitle =
    {
      dashboard: 'Ringkasan antrean dan status proposal saat ini.',
      proposals: 'Kelola dan ubah status proposal yang masuk.',
      verification: 'Review dan verifikasi dokumen evidence untuk pencairan dana.',
      master: 'Seluruh rekaman proposal, bukti transfer, dan evidence tersimpan di sini.',
      logs: 'Pantau seluruh aktivitas yang terjadi di dalam sistem.',
      berita_acara: 'Daftar dokumen Berita Acara resmi yang telah diterbitkan.',
      monitoring_berita: 'Pantau publikasi berita, sentimen media, dan tautan liputan kegiatan.',
    }[activePage] ||
    (activePage === 'portal'
      ? portalTab === 'home'
        ? `Selamat datang, ${user?.name || 'Pemohon'}.`
        : portalTab === 'new'
        ? 'Isi formulir dengan lengkap dan benar.'
        : 'Pantau perkembangan proposal Anda.'
      : '');

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:border-r lg:border-sidebar-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        )}
      >
        <SidebarNav
          activeRole={activeRole}
          activePage={activePage}
          setActivePage={setActivePage}
          totalItems={totalItems}
          dashboardStats={dashboardStats}
          dot={dot}
          name={name}
          role={role}
          handleLogout={handleLogout}
          collapsed={sidebarCollapsed}
        />

        {/* Mid-edge clean collapse toggle handle */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          title={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-label={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!sidebarCollapsed}
          className="absolute top-1/2 -right-3.5 z-40 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all duration-200 ease-out hover:scale-110 hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex cursor-pointer motion-reduce:transition-none"
        >
          <ChevronLeft
            className={cn(
              'size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </button>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          showClose={false}
          className="w-[272px] max-w-[82vw] p-0 border-0 bg-sidebar text-white"
        >
          <SheetTitle>Menu Navigasi SIGAP</SheetTitle>
          <SheetDescription>Pilih halaman yang ingin Anda buka.</SheetDescription>
          <SidebarNav
            activeRole={activeRole}
            activePage={activePage}
            setActivePage={setActivePage}
            totalItems={totalItems}
            dashboardStats={dashboardStats}
            dot={dot}
            name={name}
            role={role}
            handleLogout={handleLogout}
            onNavigate={() => setSidebarOpen(false)}
            onCloseMobile={() => setSidebarOpen(false)}
            collapsed={false}
          />
          {/* Mid-edge collapse handle matching desktop */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Ciutkan sidebar"
            className="absolute top-1/2 -right-4 z-50 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-transform duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        )}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2.5 border-b border-border bg-card/95 px-3.5 py-2.5 backdrop-blur-xs sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Button
              variant="outline"
              className="h-11 shrink-0 gap-1.5 px-3 text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 transition-all lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <PanelLeft className="size-4.5" />
              <span className="text-xs font-semibold">Menu</span>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-foreground sm:text-xl">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block sm:text-sm">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activePage === 'portal' && portalTab === 'home' && (
              <Button
                size="sm"
                className="hidden sm:inline-flex h-10 px-4"
                onClick={() => setPortalTab('new')}
              >
                <Plus className="size-4" />
                Ajukan Baru
              </Button>
            )}
            <WhatsAppButton />
            <NotificationBell />
            <Button
              variant="outline"
              size="icon"
              className="hidden size-10 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:inline-flex"
              onClick={handleLogout}
              title="Logout / Ganti Sesi"
              aria-label="Logout"
            >
              <LogOut className="size-4.5" />
            </Button>
          </div>
        </header>

        <main
          className={cn(
            'flex-1 px-3.5 py-4 sm:p-6 lg:p-8',
            activePage === 'portal'
              ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-8'
              : 'pb-8'
          )}
        >
          {activePage === 'dashboard' && (
            <DashboardPage
              activeRole={activeRole}
              dashboardStats={dashboardStats}
              proposals={proposals}
              loading={proposalsLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              chartFilterMonth={chartFilterMonth}
              setChartFilterMonth={setChartFilterMonth}
              setActivePage={setActivePage}
              setSelectedProposal={setSelectedProposal}
              setActiveModal={setActiveModal}
              fetchProposals={fetchProposals}
            />
          )}

          {activePage === 'proposals' && (
            <ProposalsPage
              proposals={proposals}
              loading={proposalsLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              {...filterProps}
              fetchProposals={fetchProposals}
              fetchStats={fetchStats}
              handleExportCSV={handleExportCSV}
              setSelectedProposal={setSelectedProposal}
              setActiveModal={setActiveModal}
            />
          )}

          {activePage === 'verification' && (
            <VerificationPage
              proposals={proposals}
              loading={proposalsLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterDateTo={filterDateTo}
              setFilterDateTo={setFilterDateTo}
              totalItems={totalItems}
              fetchProposals={fetchProposals}
              fetchStats={fetchStats}
              handleUpdateStatus={handleUpdateStatus}
              showToast={showToast}
              setSelectedProposal={setSelectedProposal}
              setActiveModal={setActiveModal}
            />
          )}

          {activePage === 'portal' && (
            <UserPortal
              user={user}
              proposals={proposals}
              loading={proposalsLoading}
              showToast={showToast}
              fetchProposals={fetchProposals}
              portalTab={portalTab}
              setPortalTab={setPortalTab}
              totalItems={totalItems}
              currentPage={currentPage}
              totalPages={totalPages}
              dashboardStats={dashboardStats}
              sidebarOpen={sidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activePage === 'master' && (
            <MasterPage
              proposals={proposals}
              loading={proposalsLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              {...filterProps}
              fetchProposals={fetchProposals}
              handleExportCSV={handleExportCSV}
              setSelectedProposal={setSelectedProposal}
              setActiveModal={setActiveModal}
            />
          )}

          {activePage === 'logs' && (
            <LogsPage
              logs={logs}
              loading={logsLoading}
              fetchLogs={fetchLogs}
              currentPage={logsCurrentPage}
              totalPages={logsTotalPages}
              fetchProposals={fetchLogs}
            />
          )}

          {activePage === 'berita_acara' && <BeritaAcaraListPage />}

          {activePage === 'monitoring_berita' && (
            <MonitoringBeritaPage showToast={showToast} />
          )}
        </main>
      </div>

      {/* Modals */}
      {activeModal === 'detail' && selectedProposal && (
        <DetailModal
          proposal={selectedProposal}
          activeRole={activeRole}
          onClose={() => setActiveModal(null)}
          onOpenStatusModal={() => setActiveModal('decision')}
          onRequestDeleteComment={(id) => setPendingDeleteCommentId(id)}
          showToast={showToast}
          setSelectedProposal={setSelectedProposal}
          fetchProposals={() => fetchProposals(currentPage)}
        />
      )}

      {activeModal === 'decision' && selectedProposal && (
        <StatusModal
          proposal={selectedProposal}
          onClose={() => setActiveModal(null)}
          onUpdateStatus={handleUpdateStatus}
          showToast={showToast}
          onRefresh={() => {
            fetchProposals(currentPage);
            fetchStats();
          }}
        />
      )}

      {/* Confirm delete comment AlertDialog */}
      <AlertDialog
        open={Boolean(pendingDeleteCommentId)}
        onOpenChange={(open) => !open && setPendingDeleteCommentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catatan Revisi?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan ini akan dihapus secara permanen dari riwayat proposal dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteComment}>
              Hapus Catatan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
