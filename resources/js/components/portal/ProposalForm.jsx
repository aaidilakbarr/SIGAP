import React, { useState } from 'react';

export const ProposalForm = ({ 
  newProposal, setNewProposal, 
  handleCreateProposal, setPortalTab, 
  formatRupiah 
}) => {
  const [selectedBank, setSelectedBank] = useState(() => {
    const popular = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga'];
    if (!newProposal.nama_bank) return '';
    if (popular.includes(newProposal.nama_bank)) return newProposal.nama_bank;
    return 'Lainnya';
  });
  const [showBankInfo, setShowBankInfo] = useState(() => {
    return !!(newProposal.nama_bank || newProposal.nomor_rekening || newProposal.atas_nama);
  });
  return (
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
              <label className="up-form-label">Upload File Proposal (PDF/DOC/DOCX) <span>*</span></label>
              {!newProposal.file ? (
                <>
                  <div className="up-upload-zone" onClick={() => document.getElementById('new-proposal-file')?.click()} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', minHeight: '44px', marginBottom: '0', borderRadius: '10px' }}>
                    <div className="up-upload-zone-icon" style={{ fontSize: '20px', margin: '0', opacity: 0.7 }}>📎</div>
                    <div style={{ textAlign: 'left' }}>
                      <div className="up-upload-zone-text" style={{ margin: '0', fontSize: '13px', lineHeight: '1.2' }}>Pilih file proposal</div>
                      <div className="up-upload-zone-sub" style={{ margin: '0', fontSize: '10.5px' }}>PDF, DOC, DOCX — Maks. 10MB</div>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="new-proposal-file"
                    className="up-upload-input"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setNewProposal({ ...newProposal, file: e.target.files[0] });
                      }
                    }}
                  />
                </>
              ) : (
                <div className="up-file-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '20px' }}>📄</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{newProposal.file.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{(newProposal.file.size / 1024 / 1024).toFixed(2)} MB • {newProposal.file.type.split('/')[1]?.toUpperCase() || 'File'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setNewProposal({ ...newProposal, file: null });
                      const el = document.getElementById('new-proposal-file');
                      if (el) el.value = '';
                    }} 
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Rekening */}
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: showBankInfo ? '16px' : '0' }}>
            <div 
              style={{ fontSize: '13px', fontWeight: 700, color: '#334155', borderBottom: showBankInfo ? '1px solid #e2e8f0' : 'none', paddingBottom: showBankInfo ? '8px' : '0', marginBottom: '-4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowBankInfo(!showBankInfo)}
            >
              <span>💳 Informasi Rekening Bank (Opsional)</span>
              <span style={{ fontSize: '12px', color: '#64748b', transition: 'transform 0.2s ease', transform: showBankInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>
            {showBankInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div className="up-form-group">
                  <label className="up-form-label">Nama Bank</label>
                  <select
                    className="up-form-input"
                    value={selectedBank}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedBank(val);
                      if (val !== 'Lainnya') {
                        setNewProposal({ ...newProposal, nama_bank: val });
                      } else {
                        setNewProposal({ ...newProposal, nama_bank: '' });
                      }
                    }}
                    style={{ background: '#fff', cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Lainnya">Lainnya (Tulis Manual)</option>
                  </select>
                </div>

                {selectedBank === 'Lainnya' && (
                  <div className="up-form-group" style={{ marginTop: '-8px' }}>
                    <label className="up-form-label" style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Masukkan Nama Bank Lainnya</label>
                    <input
                      className="up-form-input"
                      value={newProposal.nama_bank}
                      onChange={e => setNewProposal({ ...newProposal, nama_bank: e.target.value })}
                      placeholder="Masukkan nama bank Anda..."
                      style={{ background: '#fff' }}
                    />
                  </div>
                )}
                <div className="up-form-group">
                  <label className="up-form-label">Nomor Rekening</label>
                  <input
                    className="up-form-input"
                    value={newProposal.nomor_rekening}
                    onChange={e => setNewProposal({ ...newProposal, nomor_rekening: e.target.value })}
                    placeholder="Contoh: 123456789"
                    style={{ background: '#fff' }}
                  />
                </div>
                <div className="up-form-group">
                  <label className="up-form-label">Atas Nama</label>
                  <input
                    className="up-form-input"
                    value={newProposal.atas_nama || ''}
                    onChange={e => setNewProposal({ ...newProposal, atas_nama: e.target.value })}
                    placeholder="Contoh: John Doe"
                    style={{ background: '#fff' }}
                  />
                </div>
              </div>
            )}
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
            disabled={!newProposal.kegiatan || !newProposal.tgl_pelaksanaan || !newProposal.dana_diajukan || !newProposal.file}
            onClick={handleCreateProposal}
          >
            Kirim Pengajuan ✓
          </button>
        </div>
      </div>
    </div>
  );
};
