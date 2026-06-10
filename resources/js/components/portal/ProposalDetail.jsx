import React from 'react';

export const ProposalDetail = ({ 
  selectedProposal, setSelectedProposal, 
  setPortalTab, selectedUploadFile, 
  handleFileChange, removeSelectedFile,
  handleUploadProposal, handleUploadEvidence,
  getStatusClass, formatRupiah
}) => {
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
          {(p.nama_bank || p.nomor_rekening || p.atas_nama) && (
            <div className="up-info-item" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div className="up-info-key">Informasi Rekening</div>
              <div className="up-info-val" style={{ fontWeight: 600, color: 'var(--text)' }}>
                {p.nama_bank || '-'} — {p.nomor_rekening || '-'} {p.atas_nama ? `a.n. ${p.atas_nama}` : ''}
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

        {/* Dokumen Terlampir */}
        {(p.file_proposal || p.evidence_dokumen || p.bukti_transfer) && (
          <div className="up-docs-section">
            <div className="up-docs-title">Dokumen Terlampir</div>
            {p.file_proposal && (
              <div className="up-doc-item" style={{ background: '#f0fdf4', borderColor: '#d1fae5' }}>
                <div className="up-doc-item-label" style={{ color: '#065f46' }}>📄 File Proposal</div>
                <a href={`/api/preview-file/${p.file_proposal}`} target="_blank" rel="noopener noreferrer" className="up-doc-item-link">
                  Lihat →
                </a>
              </div>
            )}
            {p.evidence_dokumen && (
              <div className="up-doc-item" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                <div className="up-doc-item-label" style={{ color: '#92400e' }}>📋 File LPJ / Evidence</div>
                <a href={`/api/preview-file/${p.evidence_dokumen}`} target="_blank" rel="noopener noreferrer" className="up-doc-item-link">
                  Lihat →
                </a>
              </div>
            )}
            {p.bukti_transfer && (
              <div className="up-doc-item" style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
                <div className="up-doc-item-label" style={{ color: '#075985' }}>📄 Bukti Pengiriman Dana</div>
                <a href={`/api/preview-file/${p.bukti_transfer}`} target="_blank" rel="noopener noreferrer" className="up-doc-item-link">
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
              
              {!selectedUploadFile ? (
                <>
                  <div className="up-upload-zone" onClick={() => document.getElementById(`proposal-up-${p.id}`)?.click()}>
                    <div className="up-upload-zone-icon">📎</div>
                    <div className="up-upload-zone-text">Ketuk untuk pilih file proposal baru</div>
                    <div className="up-upload-zone-sub">PDF, DOC, DOCX — Maks. 10MB</div>
                  </div>
                  <input
                    type="file"
                    id={`proposal-up-${p.id}`}
                    className="up-upload-input"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </>
              ) : (
                <div className="up-file-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '24px' }}>📄</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{selectedUploadFile.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB • {selectedUploadFile.type.split('/')[1]?.toUpperCase() || 'File'}</div>
                    </div>
                  </div>
                  <button onClick={removeSelectedFile} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>
                    ✕
                  </button>
                </div>
              )}

              <button
                className="up-submit-evidence-btn"
                onClick={() => handleUploadProposal(p.id)}
                disabled={!selectedUploadFile}
                style={{ opacity: !selectedUploadFile ? 0.6 : 1, cursor: !selectedUploadFile ? 'not-allowed' : 'pointer' }}
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

              {!selectedUploadFile ? (
                <>
                  <div className="up-upload-zone" onClick={() => document.getElementById(`evidence-up-${p.id}`)?.click()}>
                    <div className="up-upload-zone-icon">📎</div>
                    <div className="up-upload-zone-text">Ketuk untuk pilih file</div>
                    <div className="up-upload-zone-sub">PDF, DOC, JPG, PNG — Maks. 10MB</div>
                  </div>
                  <input
                    type="file"
                    id={`evidence-up-${p.id}`}
                    className="up-upload-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </>
              ) : (
                <div className="up-file-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '24px' }}>📄</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{selectedUploadFile.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB • {selectedUploadFile.type.split('/')[1]?.toUpperCase() || 'File'}</div>
                    </div>
                  </div>
                  <button onClick={removeSelectedFile} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>
                    ✕
                  </button>
                </div>
              )}

              <button
                className="up-submit-evidence-btn"
                onClick={() => handleUploadEvidence(p.id)}
                disabled={!selectedUploadFile}
                style={{ opacity: !selectedUploadFile ? 0.6 : 1, cursor: !selectedUploadFile ? 'not-allowed' : 'pointer' }}
              >
                📤 Upload Dokumen LPJ / Evidence
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--t3)' }}>
                Laporan Absen • Foto Kegiatan • LPJ PDF
              </div>
            </div>
          )}

          {p.status === 'Selesai' && (
            <div>
              <div className="up-notice success">
                <span className="up-notice-icon">✅</span>
                <span>Proses Selesai! Dana telah sukses dicairkan dan seluruh dokumen LPJ telah diverifikasi.</span>
              </div>
              
              {(() => {
                const ba = p.berita_acara || p.beritaAcara;
                if (ba) {
                  return (
                    <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '14.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.3px' }}>
                        <span>📄</span> DOKUMEN BERITA ACARA TERBIT
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#334155', marginBottom: '16px', lineHeight: '1.5' }}>
                        Berita Acara resmi dengan nomor <strong style={{ color: '#0f172a' }}>{ba.nomor_ba}</strong> telah diterbitkan untuk pengajuan proposal ini. Anda dapat mengunduh berkas PDF resmi di bawah ini.
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a
                          href={`/api/proposals/${p.id}/berita-acara/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-d"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '10px 18px', fontSize: '13.5px', fontWeight: 600, border: '1px solid #cbd5e1' }}
                        >
                          👁 Preview PDF
                        </a>
                        <a
                          href={`/api/proposals/${p.id}/berita-acara/download`}
                          className="btn btn-p"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16a34a', borderColor: '#16a34a', padding: '10px 18px', fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}
                        >
                          📥 Download PDF
                        </a>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#64748b', fontSize: '13.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⏳</span> BERITA ACARA SEDANG DIPROSES
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                        Menunggu dokumen Berita Acara resmi diterbitkan oleh Admin. Silakan periksa kembali halaman ini secara berkala.
                      </div>
                    </div>
                  );
                }
              })()}
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
