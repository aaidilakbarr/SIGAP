import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from '../shared/SharedComponents';

export function BeritaAcaraListPage() {
  const [beritaAcaras, setBeritaAcaras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBeritaAcaras = async (page = 1) => {
    try {
      setLoading(true);
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await axios.get(`/api/berita-acara?page=${page}${q}`);
      if (res.data && res.data.data) {
        setBeritaAcaras(res.data.data.data || []);
        setCurrentPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch (e) {
      console.error('Error fetching berita acara:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search or just fetch on search query changes
    const timer = setTimeout(() => {
      fetchBeritaAcaras(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchBeritaAcaras(currentPage);
  };

  return (
    <div className="page-view active content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="tc">
        <div className="tc-top">
          <div className="tc-h">Daftar Berita Acara</div>
          <button className="exp-btn" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh Data'}
          </button>
        </div>

        {/* Custom Premium Search Input */}
        <div className="search-filter-bar">
          <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
            <span className="search-icon">&#x1F50D;</span>
            <input
              className="inp"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Nomor BA, Tiket, Kegiatan, Pemohon..."
            />
          </div>
          {searchQuery && (
            <>
              <span className="filter-count">Menampilkan {beritaAcaras.length} dari total {totalItems} data</span>
              <button className="btn btn-d btn-sm filter-reset" onClick={() => setSearchQuery('')}>✕ Reset</button>
            </>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Nomor Berita Acara</th>
              <th>Kode Tiket</th>
              <th>Pemohon</th>
              <th>Kegiatan</th>
              <th>Dibuat Oleh</th>
              <th>Tanggal Terbit</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {beritaAcaras.map(ba => (
              <tr key={ba.id} className="hi">
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{ba.nomor_ba}</td>
                <td className="cid">{ba.proposal?.kode_tiket || '-'}</td>
                <td>
                  <div className="cn">{ba.proposal?.user?.name || '-'}</div>
                  <div className="cs" style={{ fontSize: '11px', color: 'var(--t3)' }}>
                    {ba.proposal?.user?.instansi || ''}
                  </div>
                </td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ba.proposal?.kegiatan}>
                  {ba.proposal?.kegiatan || '-'}
                </td>
                <td>
                  <div className="cn">{ba.generated_by?.name || ba.generated_by_user?.name || ba.generated_by?.name || (ba.generated_by ? ba.generated_by.name : '-') || (ba.generated_by_user ? ba.generated_by_user.name : '-')}</div>
                  <div className="cs" style={{ fontSize: '11px', color: 'var(--t3)' }}>Admin</div>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--t3)', fontWeight: 500 }}>
                  {new Date(ba.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="ract">
                  <a
                    href={`/api/proposals/${ba.proposal_id}/berita-acara/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-d btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    👁 Preview
                  </a>
                  <a
                    href={`/api/proposals/${ba.proposal_id}/berita-acara/download`}
                    className="btn btn-p btn-sm"
                    style={{ textDecoration: 'none', background: '#1a5e1f', borderColor: '#1a5e1f' }}
                  >
                    📥 Download
                  </a>
                </td>
              </tr>
            ))}
            {beritaAcaras.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--t3)' }}>
                  Tidak ada data Berita Acara ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onFetch={fetchBeritaAcaras}
        />
      </div>
    </div>
  );
}
