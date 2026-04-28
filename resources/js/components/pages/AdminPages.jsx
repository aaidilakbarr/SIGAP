import React from 'react';
import { getStatusClass, formatRupiah } from '../shared/utils';
import { SearchBar, Pagination } from '../shared/SharedComponents';

export function ProposalsPage({
  proposals, currentPage, totalPages, totalItems,
  searchQuery, setSearchQuery,
  filterStatus, setFilterStatus,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  fetchProposals, fetchStats, handleExportCSV,
  setSelectedProposal, setActiveModal,
}) {
  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="tc">
        <div className="tc-top">
          <div className="tc-h">Daftar Proposal</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success btn-sm" onClick={() => handleExportCSV('daftar_proposal')}>
              <span style={{ fontSize: '14px' }}>📊</span> Ekspor CSV
            </button>
            <button className="exp-btn" onClick={() => { fetchProposals(); fetchStats(); }}>Refresh Data</button>
          </div>
        </div>
        <SearchBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
          totalItems={totalItems} proposalsLength={proposals.length}
          showStatus={true} showDate={true}
        />
        <table>
          <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Jenis</th><th>Tgl Pelaksanaan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id} className="hi">
                <td className="cid">{p.kode_tiket}</td>
                <td><div className="cn">{p.user?.name}</div></td>
                <td>{p.kegiatan}</td>
                <td><span className="tt">{p.jenis}</span></td>
                <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: 500 }}>{p.tgl_pelaksanaan}</td>
                <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                <td className="ract">
                  <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('decision'); }}>Ubah Status</button>
                  <button className="btn btn-d btn-sm" onClick={() => { setSelectedProposal(p); setActiveModal('detail'); }}>Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </div>
    </div>
  );
}

export function VerificationPage({
  proposals, currentPage, totalPages, totalItems,
  searchQuery, setSearchQuery,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  fetchProposals, fetchStats, handleUpdateStatus, showToast,
}) {
  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="tc">
        <div className="tc-top">
          <div className="tc-h">Verifikasi Evidence</div>
          <button className="exp-btn" onClick={() => { fetchProposals(); fetchStats(); }}>Refresh Data</button>
        </div>
        <SearchBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterStatus="" setFilterStatus={() => {}}
          filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
          totalItems={totalItems} proposalsLength={proposals.length}
          showStatus={false} showDate={true}
        />
        <table>
          <thead><tr><th>ID</th><th>Pemohon</th><th>Kegiatan</th><th>Dokumen Evidence</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id}>
                <td className="cid">{p.kode_tiket}</td>
                <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{p.user?.name}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.kegiatan}>{p.kegiatan}</td>
                <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.evidence_dokumen}>
                  {p.evidence_dokumen
                    ? <span className="fl" onClick={() => showToast('Lihat ' + p.evidence_dokumen)}>{p.evidence_dokumen}</span>
                    : <span style={{ color: 'var(--t3)', fontStyle: 'italic', fontSize: '13px' }}>Belum upload</span>
                  }
                </td>
                <td><span className={`status ${getStatusClass(p.status)}`}>{p.status}</span></td>
                <td className="ract">
                  <button className="btn btn-p btn-sm" onClick={() => handleUpdateStatus(p.id, 'Selesai')} title="Verifikasi Acc">✔ Acc</button>
                  <button className="btn btn-d btn-sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleUpdateStatus(p.id, 'Menunggu Evidence')} title="Tolak / Revisi">✖ Tolak</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </div>
    </div>
  );
}

export function MasterPage({
  proposals, currentPage, totalPages, totalItems,
  searchQuery, setSearchQuery,
  filterStatus, setFilterStatus,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  fetchProposals, handleExportCSV,
  setSelectedProposal, setActiveModal,
}) {
  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="tc">
        <div className="tc-top">
          <div className="tc-h">Master Database</div>
          <button className="btn btn-success btn-sm" onClick={() => handleExportCSV('master_database')}>
            <span style={{ fontSize: '14px' }}>📊</span> Ekspor CSV
          </button>
        </div>
        <SearchBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
          totalItems={totalItems} proposalsLength={proposals.length}
          showStatus={true} showDate={true}
        />
        <table>
          <thead><tr><th>Kode</th><th>Pemohon</th><th>Kegiatan</th><th>Dana (Rp)</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {proposals.map(p => (
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
        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </div>
    </div>
  );
}

export function LogsPage({ logs, fetchLogs, currentPage, totalPages, fetchProposals }) {
  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="tc">
        <div className="tc-top">
          <div className="tc-h">Sistem Activity Log</div>
          <button className="exp-btn" onClick={fetchLogs}>Refresh</button>
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
        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </div>
    </div>
  );
}
