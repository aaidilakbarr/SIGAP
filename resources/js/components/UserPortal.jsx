import React, { useState } from 'react';
import axios from 'axios';
import './UserPortal.css';

const STATUS_STAGES = [
  { key: 'Dalam Antrean', label: 'Input', desc: 'Proposal disubmit dan masuk antrean sistem.' },
  { key: 'Dalam Review', label: 'Review', desc: 'Proposal sedang direview oleh pimpinan.' },
  { key: 'Menunggu Fisik', label: 'Fisik', desc: 'Menunggu penyerahan berkas fisik proposal.' },
  { key: 'Dana Cair', label: 'Dana Cair', desc: 'Dana telah berhasil dicairkan kepada pemohon.' },
  { key: 'Menunggu Evidence', label: 'Upload LPJ', desc: 'Pemohon harus mengunggah bukti/evidence.' },
  { key: 'Selesai', label: 'Selesai', desc: 'Seluruh proses telah selesai dan laporan diterima.' },
];

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(angka);
};

const getStatusClass = (status) => {
  if (status === 'Menunggu Evidence' || status === 'Menunggu Verif') return 'sw';
  if (status === 'Selesai') return 'sd';
  if (status === 'Gagal Bayar') return 'sf';
  if (status === 'Dalam Review' || status === 'Revisi Proposal') return 'sr';
  if (status === 'Menunggu Fisik') return 'sn';
  return 'sq';
};

const getCardStatusClass = (status) => {
  if (status === 'Selesai') return 'status-done';
  if (status === 'Menunggu Evidence' || status === 'Menunggu Verif' || status === 'Revisi Proposal') return 'status-wait';
  if (status === 'Gagal Bayar') return 'status-fail';
  return 'status-active';
};

// Vertical timeline khusus mobile
const VerticalTimeline = ({ currentStatus }) => {
  let currentIndex = STATUS_STAGES.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === 'Gagal Bayar';
  if (isFailed) currentIndex = 3;
  if (currentIndex === -1 && !isFailed) currentIndex = 0;

  return (
    <div className="up-timeline-vertical">
      {STATUS_STAGES.map((stage, idx) => {
        const isDone = idx < currentIndex || currentStatus === 'Selesai';
        const isNow = idx === currentIndex && !isFailed;
        const isFailStep = isFailed && idx === 3;

        return (
          <div key={stage.key}
            className={`up-tlv-item ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${isFailStep ? 'fail-step' : ''}`}
          >
            <div className="up-tlv-left">
              <div className={`up-tlv-dot ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${isFailStep ? 'fail' : ''}`}>
                {isDone ? '✓' : isFailStep ? '✕' : (idx + 1)}
              </div>
              <div className={`up-tlv-line ${isDone ? 'done' : ''}`} />
            </div>
            <div className="up-tlv-content">
              <div className="up-tlv-label">{stage.label}</div>
              <div className="up-tlv-desc">{stage.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function UserPortal({ user, proposals, showToast, fetchProposals, portalTab, setPortalTab }) {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProposal, setNewProposal] = useState({
    kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null, nama_bank: '', nomor_rekening: ''
  });

  // Filtered proposals
  const filteredProposals = proposals.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || (
      (p.kode_tiket || '').toLowerCase().includes(q) ||
      (p.kegiatan || '').toLowerCase().includes(q) ||
      (p.jenis || '').toLowerCase().includes(q)
    );
  });

  // Stats counts
  const totalCount = proposals.length;
  const actionCount = proposals.filter(p => p.status === 'Menunggu Evidence' || p.status === 'Revisi Proposal').length;
  const doneCount = proposals.filter(p => p.status === 'Selesai').length;

  const handleCreateProposal = async () => {
    try {
      const formData = new FormData();
      formData.append('kegiatan', newProposal.kegiatan);
      formData.append('jenis', newProposal.jenis);
      formData.append('tgl_pelaksanaan', newProposal.tgl_pelaksanaan);
      formData.append('dana_diajukan', newProposal.dana_diajukan.toString().replace(/\./g, ''));
      formData.append('catatan', newProposal.catatan);
      formData.append('nama_bank', newProposal.nama_bank);
      formData.append('nomor_rekening', newProposal.nomor_rekening);
      if (newProposal.file) formData.append('file_proposal', newProposal.file);

      await axios.post('/api/proposals', formData);
      showToast('Proposal berhasil diajukan!');
      setNewProposal({ kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null, nama_bank: '', nomor_rekening: '' });
      fetchProposals();
      setPortalTab('home');
    } catch (e) {
      let msg = 'Gagal mengajukan proposal.';
      if (e.response?.data?.errors) msg = Object.values(e.response.data.errors)[0][0];
      else if (e.response?.data?.message) msg = e.response.data.message;
      showToast(msg);
    }
  };

  const handleUploadEvidence = async (proposalId) => {
    const fileInput = document.getElementById(`evidence-up-${proposalId}`);
    if (!fileInput || fileInput.files.length === 0) {
      showToast('Pilih file terlebih dahulu!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('evidence_dokumen', fileInput.files[0]);
      await axios.post(`/api/proposals/${proposalId}/upload-evidence`, formData);
      showToast('Evidence berhasil dikirim!');
      fetchProposals();
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengupload evidence.');
    }
  };

  const handleUploadProposal = async (proposalId) => {
    const fileInput = document.getElementById(`proposal-up-${proposalId}`);
    if (!fileInput || fileInput.files.length === 0) {
      showToast('Pilih file proposal revisi terlebih dahulu!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file_proposal', fileInput.files[0]);
      await axios.post(`/api/proposals/${proposalId}/upload-proposal`, formData);
      showToast('Proposal revisi berhasil diunggah!');
      fetchProposals();
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengupload proposal revisi.');
    }
  };

  // ===== HOME TAB =====
  const renderHome = () => (
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
        </div>
      )}
    </div>
  );

  // ===== NEW PROPOSAL TAB =====
  const renderNewForm = () => (
    <div className="up-form-wrapper">
      <div className="up-form-card">
        <div className="up-form-header">
          <div className="up-form-header-title">📝 Ajukan Proposal Baru</div>
          <div className="up-form-header-sub">Isi formulir dengan lengkap dan benar.</div>
        </div>

        <div className="up-form-body">
          {/* Nama Kegiatan */}
          <div className="up-form-group">
            <label className="up-form-label">Nama / Judul Kegiatan <span>*</span></label>
            <input
              className="up-form-input"
              value={newProposal.kegiatan}
              onChange={e => setNewProposal({ ...newProposal, kegiatan: e.target.value })}
              placeholder="Contoh: Seminar Nasional Mahasiswa Berprestasi..."
            />
          </div>

          {/* Tanggal & Skema */}
          <div className="up-form-row">
            <div className="up-form-group">
              <label className="up-form-label">Tanggal Rencana Pelaksanaan <span>*</span></label>
              <input
                className="up-form-input"
                type="date"
                value={newProposal.tgl_pelaksanaan}
                onChange={e => setNewProposal({ ...newProposal, tgl_pelaksanaan: e.target.value })}
              />
            </div>
            <div className="up-form-group">
              <label className="up-form-label">Skema Pencairan <span>*</span></label>
              <select
                className="up-form-input"
                value={newProposal.jenis}
                onChange={e => setNewProposal({ ...newProposal, jenis: e.target.value })}
                style={{ cursor: 'pointer', appearance: 'auto' }}
              >
                <option value="Advance">Advance Payment (Dana Di Depan)</option>
                <option value="Reimburse">Reimbursement (Diganti Kemudian)</option>
              </select>
            </div>
          </div>

          {/* Dana & File */}
          <div className="up-form-row">
            <div className="up-form-group">
              <label className="up-form-label">Total Dana Diajukan (Rp) <span>*</span></label>
              <input
                className="up-form-input"
                type="text"
                value={newProposal.dana_diajukan ? formatRupiah(newProposal.dana_diajukan.toString().replace(/\./g, '')) : ''}
                onChange={e => setNewProposal({ ...newProposal, dana_diajukan: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="Contoh: 5.000.000"
              />
            </div>
            <div className="up-form-group">
              <label className="up-form-label">Upload File Proposal (PDF)</label>
              <input
                className="up-form-input"
                type="file"
                accept="application/pdf"
                onChange={e => setNewProposal({ ...newProposal, file: e.target.files[0] })}
                style={{ padding: '7px 12px' }}
              />
            </div>
          </div>

          {/* Info Rekening */}
          <div className="up-form-row">
            <div className="up-form-group">
              <label className="up-form-label">Nama Bank</label>
              <input
                className="up-form-input"
                value={newProposal.nama_bank}
                onChange={e => setNewProposal({ ...newProposal, nama_bank: e.target.value })}
                placeholder="Contoh: BCA / Mandiri / BNI"
              />
            </div>
            <div className="up-form-group">
              <label className="up-form-label">Nomor Rekening (dan Atas Nama)</label>
              <input
                className="up-form-input"
                value={newProposal.nomor_rekening}
                onChange={e => setNewProposal({ ...newProposal, nomor_rekening: e.target.value })}
                placeholder="Contoh: 1234567890 a.n. John Doe"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="up-form-group">
            <label className="up-form-label">Catatan / Rincian Tambahan</label>
            <textarea
              className="up-form-input"
              rows="3"
              value={newProposal.catatan}
              onChange={e => setNewProposal({ ...newProposal, catatan: e.target.value })}
              placeholder="Tuliskan catatan khusus jika ada keterkaitan dengan dana..."
              style={{ resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>
        </div>

        <div className="up-form-footer">
          <button className="up-btn-back" onClick={() => setPortalTab('home')}>
            ← Batal
          </button>
          <button
            className="up-btn-submit"
            disabled={!newProposal.kegiatan || !newProposal.tgl_pelaksanaan || !newProposal.dana_diajukan}
            onClick={handleCreateProposal}
          >
            Kirim Pengajuan ✓
          </button>
        </div>
      </div>
    </div>
  );

  // ===== DETAIL / TRACK PROGRESS TAB =====
  const renderDetail = () => {
    if (!selectedProposal) return null;
    const p = selectedProposal;

    return (
      <div className="up-detail-wrapper">
        <button
          className="up-btn-back"
          style={{ marginBottom: '16px' }}
          onClick={() => { setPortalTab('home'); setSelectedProposal(null); }}
        >
          ← Kembali
        </button>

        <div className="up-detail-card">
          {/* Header */}
          <div className="up-detail-header">
            <div className="up-detail-id">{p.kode_tiket}</div>
            <div className="up-detail-title">{p.kegiatan}</div>
            <div className="up-detail-sub">{p.user?.name} — {p.jenis}</div>
            <div className="up-detail-status-row">
              <span className={`status ${getStatusClass(p.status)}`}>{p.status}</span>
              {p.tgl_pelaksanaan && (
                <span className="up-detail-date">📅 {p.tgl_pelaksanaan}</span>
              )}
            </div>
          </div>

          {/* Reminder / Deadline Notice */}
          {p.revisi_deadline && (p.status === 'Revisi Proposal' || p.status === 'Menunggu Evidence') && (
            <div style={{ margin: '20px 20px 20px 20px', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#b91c1c' }}>
              <span style={{ fontSize: '20px', lineHeight: '1' }}>⚠️</span>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '2px' }}>Pengingat Tenggat Waktu (Deadline)</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>Batas akhir penyelesaian: <strong>{new Date(p.revisi_deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</strong></div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>Pastikan untuk melengkapi dokumen sebelum waktu habis atau proposal dapat dibatalkan otomatis.</div>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="up-info-grid">
            <div className="up-info-item">
              <div className="up-info-key">Dana Diajukan</div>
              <div className="up-info-val" style={{ color: 'var(--up-green)', fontWeight: 800 }}>
                Rp {formatRupiah(p.dana_diajukan)}
              </div>
            </div>
            <div className="up-info-item">
              <div className="up-info-key">Jenis</div>
              <div className="up-info-val">{p.jenis}</div>
            </div>
            {p.user?.instansi && (
              <div className="up-info-item">
                <div className="up-info-key">Instansi</div>
                <div className="up-info-val">{p.user.instansi}</div>
              </div>
            )}
            {p.user?.nomor_telepon && (
              <div className="up-info-item">
                <div className="up-info-key">No. Telepon</div>
                <div className="up-info-val">{p.user.nomor_telepon}</div>
              </div>
            )}
            {(p.nama_bank || p.nomor_rekening) && (
              <div className="up-info-item" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div className="up-info-key">Informasi Rekening</div>
                <div className="up-info-val" style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {p.nama_bank || '-'} — {p.nomor_rekening || '-'}
                </div>
              </div>
            )}
          </div>

          {/* Catatan Admin */}
          {p.comments && p.comments.length > 0 && (
            <div className="up-admin-notes">
              <div className="up-admin-notes-title">📋 Catatan dari Admin</div>
              {p.comments.map(c => (
                <div key={c.id} className="up-note-item">
                  <div className="up-note-date">
                    {new Date(c.created_at).toLocaleString('id-ID')}
                  </div>
                  {c.komentar}
                </div>
              ))}
            </div>
          )}

          {/* Timeline Progress */}
          <div className="up-timeline-section">
            <div className="up-timeline-title">Progres Pengajuan</div>
            <VerticalTimeline currentStatus={p.status} />

            {/* Bukti transfer */}
            {p.bukti_transfer && (
              <div className="up-transfer-card">
                <div className="up-transfer-card-left">
                  <div className="up-transfer-title">📄 Bukti Pengiriman Dana</div>
                  <div className="up-transfer-sub">Admin telah melampirkan slip pencairan dana.</div>
                </div>
                <a
                  href={`/storage/${p.bukti_transfer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="up-transfer-link"
                >
                  Lihat →
                </a>
              </div>
            )}
          </div>

          {/* Dokumen Terlampir */}
          {(p.file_proposal || p.evidence_dokumen || p.bukti_transfer) && (
            <div className="up-docs-section">
              <div className="up-docs-title">Dokumen Terlampir</div>
              {p.file_proposal && (
                <div className="up-doc-item" style={{ background: '#f0fdf4', borderColor: '#d1fae5' }}>
                  <div className="up-doc-item-label" style={{ color: '#065f46' }}>📄 File Proposal</div>
                  <a href={`/storage/${p.file_proposal}`} target="_blank" rel="noopener noreferrer" className="up-doc-item-link">
                    Lihat →
                  </a>
                </div>
              )}
              {p.evidence_dokumen && (
                <div className="up-doc-item" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                  <div className="up-doc-item-label" style={{ color: '#92400e' }}>📋 File LPJ / Evidence</div>
                  <a href={`/storage/${p.evidence_dokumen}`} target="_blank" rel="noopener noreferrer" className="up-doc-item-link">
                    Lihat →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action Section */}
          <div className="up-action-section">
            {p.status === 'Revisi Proposal' && (
              <div style={{ marginBottom: '20px' }}>
                <div className="up-notice warn">
                  <span className="up-notice-icon">⚠️</span>
                  <span>Proposal Anda memerlukan revisi. Silakan unggah proposal baru yang sudah diperbaiki.</span>
                </div>
                <div className="up-upload-zone" onClick={() => document.getElementById(`proposal-up-${p.id}`)?.click()}>
                  <div className="up-upload-zone-icon">📎</div>
                  <div className="up-upload-zone-text">Ketuk untuk pilih file proposal baru</div>
                  <div className="up-upload-zone-sub">PDF — Maks. 10MB</div>
                </div>
                <input
                  type="file"
                  id={`proposal-up-${p.id}`}
                  className="up-upload-input"
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                <button
                  className="up-submit-evidence-btn"
                  onClick={() => handleUploadProposal(p.id)}
                >
                  📤 Upload Proposal Revisi
                </button>
              </div>
            )}

            {p.status === 'Menunggu Evidence' && (
              <div>
                <div className="up-notice warn">
                  <span className="up-notice-icon">⚠️</span>
                  <span>Status Anda memerlukan tindakan. Unggah dokumen LPJ sebelum batas waktu yang tertera.</span>
                </div>
                <div className="up-upload-zone" onClick={() => document.getElementById(`evidence-up-${p.id}`)?.click()}>
                  <div className="up-upload-zone-icon">📎</div>
                  <div className="up-upload-zone-text">Ketuk untuk pilih file</div>
                  <div className="up-upload-zone-sub">PDF, JPG, PNG — Maks. 10MB</div>
                </div>
                <input
                  type="file"
                  id={`evidence-up-${p.id}`}
                  className="up-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <button
                  className="up-submit-evidence-btn"
                  onClick={() => handleUploadEvidence(p.id)}
                >
                  📤 Upload Dokumen LPJ / Evidence
                </button>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--t3)' }}>
                  Laporan Absen • Foto Kegiatan • LPJ PDF
                </div>
              </div>
            )}

            {p.status === 'Selesai' && (
              <div className="up-notice success">
                <span className="up-notice-icon">✅</span>
                <span>Proses Selesai! Dana telah sukses dicairkan dan seluruh dokumen LPJ telah diverifikasi.</span>
              </div>
            )}

            {p.status === 'Gagal Bayar' && (
              <div className="up-notice error">
                <span className="up-notice-icon">❌</span>
                <span>Mohon maaf, proposal ini mengalami Gagal Bayar. Silakan hubungi admin untuk informasi lebih lanjut.</span>
              </div>
            )}

            {p.status !== 'Menunggu Evidence' && p.status !== 'Revisi Proposal' && p.status !== 'Selesai' && p.status !== 'Gagal Bayar' && (
              <div style={{ textAlign: 'center', color: 'var(--t2)', fontSize: '13.5px', padding: '8px 0', lineHeight: '1.6' }}>
                🔄 Sedang dalam tahap administrasi internal.<br />
                <span style={{ color: 'var(--t3)', fontSize: '12px' }}>Pantau progres Anda secara berkala di halaman ini.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Tab Content */}
      <div className="page-view active content">
        {portalTab === 'home' && renderHome()}
        {portalTab === 'new' && renderNewForm()}
        {portalTab === 'detail' && renderDetail()}
      </div>

      {/* Bottom Navigation Bar (mobile) */}
      <nav className="user-bottom-nav" role="navigation" aria-label="User navigation">
        <div
          className={`ubn-item ${portalTab === 'home' ? 'active' : ''}`}
          onClick={() => { setPortalTab('home'); setSelectedProposal(null); }}
          id="ubn-home"
        >
          <span className="ubn-icon">🏠</span>
          <span className="ubn-label">Beranda</span>
        </div>

        <div
          className={`ubn-item ${portalTab === 'new' ? 'active' : ''}`}
          onClick={() => setPortalTab('new')}
          id="ubn-new"
        >
          <div className="ubn-icon" style={{ fontSize: '22px', lineHeight: 1 }}>＋</div>
          <span className="ubn-label">Ajukan</span>
        </div>

        <div
          className={`ubn-item ${portalTab === 'detail' ? 'active' : ''}`}
          onClick={() => {
            if (selectedProposal) setPortalTab('detail');
            else if (proposals.length > 0) {
              setSelectedProposal(proposals[0]);
              setPortalTab('detail');
            }
          }}
          id="ubn-track"
        >
          <span className="ubn-icon">📍</span>
          <span className="ubn-label">Track</span>
          {actionCount > 0 && <span className="ubn-badge">{actionCount}</span>}
        </div>
      </nav>
    </>
  );
}
