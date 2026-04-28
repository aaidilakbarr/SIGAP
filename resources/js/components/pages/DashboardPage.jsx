import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatusClass, formatRupiah } from '../shared/utils';
import { Pagination } from '../shared/SharedComponents';

const CHART_COLORS = {
  'Dalam Antrean':    'url(#grad-antrean)',
  'Dalam Review':     'url(#grad-review)',
  'Revisi Proposal':  'url(#grad-revisi)',
  'Menunggu Fisik':   'url(#grad-fisik)',
  'Dana Cair':        'url(#grad-cair)',
  'Menunggu Evidence':'url(#grad-evidence)',
  'Menunggu Verif':   'url(#grad-verif)',
  'Selesai':          'url(#grad-selesai)',
  'Gagal Bayar':      'url(#grad-gagal)',
};

export function DashboardPage({
  dashboardStats, proposals, currentPage, totalPages,
  chartFilterMonth, setChartFilterMonth,
  setActivePage, setSelectedProposal, setActiveModal, fetchProposals,
}) {
  const chartDataStatus = useMemo(() => {
    if (!dashboardStats) return [];
    return Object.keys(dashboardStats.status_counts).map(key => ({ name: key, value: dashboardStats.status_counts[key] }));
  }, [dashboardStats]);

  const chartDataMonthly = useMemo(() => {
    if (!dashboardStats) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((m, idx) => ({ name: m, total: dashboardStats.monthly_counts[idx + 1] || 0 }));
  }, [dashboardStats]);

  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      {/* Stat Cards */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="sc">
          <div className="sc-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          <div className="sc-l">Total Antrean</div>
          <div className="sc-v">{dashboardStats?.total_queue || 0}</div>
          <button className="sc-btn" onClick={() => setActivePage('proposals')}>View Details</button>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
          <div className="sc-l">Menunggu Review</div>
          <div className="sc-v">{dashboardStats?.total_review || 0}</div>
          <button className="sc-btn" onClick={() => setActivePage('proposals')}>View Details</button>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
          <div className="sc-l">Menunggu Verifikasi</div>
          <div className="sc-v">{dashboardStats?.total_verif || 0}</div>
          <button className="sc-btn" onClick={() => setActivePage('verification')}>View Details</button>
        </div>
        <div className="sc">
          <div className="sc-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <div className="sc-l">Selesai</div>
          <div className="sc-v">{dashboardStats?.total_selesai || 0}</div>
          <button className="sc-btn" onClick={() => setActivePage('master')}>View Details</button>
        </div>
      </div>

      {/* Chart filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>Analitik Berdasarkan Waktu</div>
        <select className="inp" value={chartFilterMonth} onChange={e => setChartFilterMonth(e.target.value)} style={{ padding: '8px 14px', width: '220px', fontSize: '13px' }}>
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
            <option key={i} value={String(i)}>{m}</option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="tc" style={{ height: '440px', display: 'flex', flexDirection: 'column' }}>
          <div className="tc-top"><div className="tc-h">Proporsi Status Proposal</div></div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="grad-antrean" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient>
                  <linearGradient id="grad-review"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#93c5fd" /></linearGradient>
                  <linearGradient id="grad-revisi"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#fdba74" /></linearGradient>
                  <linearGradient id="grad-fisik"   x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fcd34d" /></linearGradient>
                  <linearGradient id="grad-cair"    x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#6ee7b7" /></linearGradient>
                  <linearGradient id="grad-evidence"x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#c4b5fd" /></linearGradient>
                  <linearGradient id="grad-verif"   x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#f9a8d4" /></linearGradient>
                  <linearGradient id="grad-selesai" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#86efac" /></linearGradient>
                  <linearGradient id="grad-gagal"   x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#fca5a5" /></linearGradient>
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

      {/* Priority queue table */}
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
                <td><button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Lihat Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </div>
    </div>
  );
}
