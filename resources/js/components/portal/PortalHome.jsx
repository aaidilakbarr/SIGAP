import React from 'react';

export const PortalHome = ({ 
  user, proposals, filteredProposals, 
  searchQuery, setSearchQuery, 
  totalCount, actionCount, doneCount,
  setPortalTab, setSelectedProposal,
  currentPage, totalPages, fetchProposals,
  getCardStatusClass, getStatusClass, formatRupiah
}) => {
  return (
    <div className="user-portal-content">
      {/* Greeting Banner */}
      <div className="up-greeting">
        <div className="up-greeting-hi">Selamat datang,</div>
        <div className="up-greeting-name">{user?.name || 'Pemohon'} 👋</div>
        <div className="up-greeting-sub">
          Pantau status pengajuan Anda secara real-time di sini.
          {actionCount > 0 && ` Ada ${actionCount} proposal yang butuh tindakan!`}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="up-stats">
        <div className="up-stat-card blue">
          <div className="up-sc-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="up-stat-label">Total Diajukan</div>
          <div className="up-stat-val">{totalCount}</div>
        </div>
        <div className="up-stat-card amber">
          <div className="up-sc-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="up-stat-label">Perlu Tindakan</div>
          <div className="up-stat-val">{actionCount}</div>
        </div>
        <div className="up-stat-card green">
          <div className="up-sc-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="up-stat-label">Selesai</div>
          <div className="up-stat-val">{doneCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="up-search-wrap">
        <span className="up-search-icon">🔍</span>
        <input
          className="up-search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari kegiatan, ID, atau jenis..."
        />
      </div>

      {/* Proposal List */}
      <div className="up-section-header">
        <div className="up-section-title">Daftar Proposal Saya</div>
        <div className="up-section-count">
          {searchQuery ? `${filteredProposals.length} dari ${totalCount}` : `${totalCount} proposal`}
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="up-empty">
          <div className="up-empty-icon">{searchQuery ? '🔍' : '📋'}</div>
          <div className="up-empty-title">
            {searchQuery ? 'Tidak ditemukan' : 'Belum ada proposal'}
          </div>
          <div className="up-empty-desc">
            {searchQuery
              ? `Tidak ada proposal yang cocok dengan "${searchQuery}"`
              : 'Klik tombol + di bawah untuk mengajukan proposal pertama Anda.'}
          </div>
          {!searchQuery && (
            <button
              className="up-btn-submit"
              style={{ margin: '0 auto' }}
              onClick={() => setPortalTab('new')}
            >
              + Ajukan Proposal Baru
            </button>
          )}
        </div>
      ) : (
        <div className="up-card-list">
          {filteredProposals.map(p => (
            <div
              key={p.id}
              className={`up-proposal-card ${getCardStatusClass(p.status)}`}
              onClick={() => { setSelectedProposal(p); setPortalTab('detail'); }}
            >
              <div className="up-card-top">
                <span className="up-card-id">{p.kode_tiket}</span>
                <span className={`status ${getStatusClass(p.status)}`}>{p.status}</span>
              </div>
              <div className="up-card-kegiatan">{p.kegiatan}</div>
              <div className="up-card-meta">
                <div className="up-card-meta-item">
                  <span className="up-card-meta-icon">📅</span>
                  {p.tgl_pelaksanaan || '-'}
                </div>
                <div className="up-card-meta-item">
                  <span className="up-card-meta-icon">📂</span>
                  {p.jenis}
                </div>
                {p.revisi_deadline && (
                  <span className="up-action-needed" style={{ color: '#b91c1c', background: '#fee2e2' }}>⚠ Batas: {new Date(p.revisi_deadline).toLocaleDateString('id-ID')}</span>
                )}
                {p.status === 'Menunggu Evidence' && !p.revisi_deadline && (
                  <span className="up-action-needed">⚠ Upload LPJ</span>
                )}
              </div>
              <div className="up-card-dana">
                <div>
                  <div className="up-card-dana-label">Dana Diajukan</div>
                  <div>Rp {formatRupiah(p.dana_diajukan)}</div>
                </div>
                <span className="up-card-arrow">›</span>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <button className="btn btn-d btn-sm" disabled={currentPage === 1} onClick={() => fetchProposals(currentPage - 1)}>← Sebelumnya</button>
              <span style={{ fontSize: '13px', color: 'var(--t2)', fontWeight: 500 }}>Hal {currentPage} dari {totalPages}</span>
              <button className="btn btn-d btn-sm" disabled={currentPage === totalPages} onClick={() => fetchProposals(currentPage + 1)}>Selanjutnya →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
