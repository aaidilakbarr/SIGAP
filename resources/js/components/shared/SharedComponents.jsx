import React from 'react';

export function Pagination({ currentPage, totalPages, onFetch }) {
  if (totalPages <= 1) return null;
  return (
    <div className="tc-pagination">
      <span className="tc-pag-info">Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong></span>
      <div className="tc-pag-actions">
        <button className="tc-pag-btn" disabled={currentPage === 1} onClick={() => onFetch(currentPage - 1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span style={{ marginLeft: '4px' }}>Sebelumnya</span>
        </button>
        <button className="tc-pag-btn" disabled={currentPage === totalPages} onClick={() => onFetch(currentPage + 1)}>
          <span style={{ marginRight: '4px' }}>Selanjutnya</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}

export function SearchBar({
  searchQuery, setSearchQuery,
  filterStatus, setFilterStatus,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  totalItems, proposalsLength,
  showStatus = true, showDate = true,
}) {
  return (
    <div className="search-filter-bar">
      <div className="search-box">
        <span className="search-icon">&#x1F50D;</span>
        <input
          className="inp"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={showStatus ? 'Cari ID, Nama, atau Kegiatan...' : 'Cari ID, Nama Pemohon, Kegiatan... '}
        />
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
          <span className="filter-count">Menampilkan {proposalsLength} dari total {totalItems} data</span>
          <button className="btn btn-d btn-sm filter-reset" onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }}>✕ Reset</button>
        </>
      )}
    </div>
  );
}

export function Timeline({ currentStatus, STATUS_STAGES }) {
  let currentIndex = STATUS_STAGES.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === 'Gagal Bayar';
  if (isFailed) currentIndex = 3;
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
}
