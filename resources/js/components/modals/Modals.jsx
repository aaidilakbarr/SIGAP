import React, { useState } from 'react';
import axios from 'axios';
import { getStatusClass, formatRupiah, STATUS_OPTIONS } from '../shared/utils';

// ─── Detail Modal ─────────────────────────────────────────────────────────────
export function DetailModal({ proposal, activeRole, onClose, onDeleteComment, showToast }) {
  if (!proposal) return null;
  return (
    <div className="overlay open" onClick={(e) => { if (e.target.className.includes('overlay')) onClose(); }}>
      <div className="modal">
        <div className="mh"><div className="mt">Detail Proposal</div><button className="cx" onClick={onClose}>&#x2715;</button></div>
        <div className="mb">
          <div className="ig">
            <div className="ii"><div className="ik">ID</div><div className="iv" style={{ fontWeight: 600, color: 'var(--t2)', fontSize: '13.5px' }}>{proposal.kode_tiket}</div></div>
            <div className="ii"><div className="ik">Status</div><div className="iv"><span className={`status ${getStatusClass(proposal.status)}`}>{proposal.status}</span></div></div>
            {proposal.revisi_deadline && (
              <div className="ii" style={{ gridColumn: '1 / -1' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <div><strong style={{ fontSize: '13px' }}>Batas Pengerjaan Revisi:</strong> <span style={{ fontSize: '13px', marginLeft: '4px' }}>{new Date(proposal.revisi_deadline).toLocaleString('id-ID')}</span></div>
                </div>
              </div>
            )}
            <div className="ii"><div className="ik">Pemohon</div><div className="iv">{proposal.user?.name}</div></div>
            <div className="ii"><div className="ik">Nomor Telepon</div><div className="iv" style={{ fontWeight: 500, color: 'var(--t2)' }}>{proposal.user?.nomor_telepon || '-'}</div></div>
            <div className="ii"><div className="ik">Kegiatan</div><div className="iv">{proposal.kegiatan}</div></div>
            <div className="ii"><div className="ik">Tgl Pelaksanaan</div><div className="iv" style={{ fontWeight: 500, color: 'var(--text)' }}>{proposal.tgl_pelaksanaan}</div></div>
            <div className="ii"><div className="ik">Jenis</div><div className="iv"><span className="tt">{proposal.jenis}</span></div></div>
            <div className="ii"><div className="ik">Dana Diajukan</div><div className="iv" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>Rp {formatRupiah(proposal.dana_diajukan)}</div></div>
            {(proposal.nama_bank || proposal.nomor_rekening) && (
              <div className="ii" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="ik" style={{ marginBottom: '4px' }}>Target Pengiriman Dana (Rekening)</div>
                <div className="iv" style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {proposal.nama_bank || '-'} — {proposal.nomor_rekening || '-'}
                </div>
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>DOKUMEN TERLAMPIR</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {proposal.file_proposal && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: '8px', padding: '12px 16px', border: '1px solid #d1fae5' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FILE PROPOSAL</div>
                    <a href={`/api/preview-file/${proposal.file_proposal}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                  </div>
                )}
                {proposal.evidence_dokumen && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', borderRadius: '8px', padding: '12px 16px', border: '1px solid #fef3c7' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FILE LPJ</div>
                    <a href={`/api/preview-file/${proposal.evidence_dokumen}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                  </div>
                )}
                {proposal.bukti_transfer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', borderRadius: '8px', padding: '12px 16px', border: '1px solid #e0f2fe' }}>
                    <div style={{ fontWeight: 700, color: '#075985', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUKTI PEMBAYARAN</div>
                    <a href={`/api/preview-file/${proposal.bukti_transfer}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}>Lihat File &rarr;</a>
                  </div>
                )}
              </div>
            </div>

            {proposal.comments && proposal.comments.length > 0 && (
              <div style={{ gridColumn: '1 / -1', width: '100%', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '16px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#b45309', letterSpacing: '0.5px', marginBottom: '12px', textTransform: 'uppercase' }}>CATATAN DARI ADMIN</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {proposal.comments.map(c => (
                      <div key={c.id} style={{ fontSize: '13.5px', color: '#92400e', lineHeight: '1.5', whiteSpace: 'pre-wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>{new Date(c.created_at).toLocaleString('id-ID')}</div>
                          {(activeRole === 'master' || activeRole === 'reviewer') && (
                            <button className="btn btn-d btn-sm" style={{ padding: '2px 8px', fontSize: '11px', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} onClick={(e) => { e.stopPropagation(); onDeleteComment(c.id); }}>Hapus</button>
                          )}
                        </div>
                        {c.komentar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mf"><button className="btn btn-d" onClick={onClose}>Tutup</button></div>
      </div>
    </div>
  );
}

// ─── Status Modal ─────────────────────────────────────────────────────────────
export function StatusModal({ proposal, onClose, onUpdateStatus, showToast }) {
  const [decisionStatus, setDecisionStatus] = useState(proposal?.status || '');
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  if (!proposal) return null;

  const handleSave = () => {
    if (decisionStatus === 'Dana Cair' && uploadFile) {
      const formData = new FormData();
      formData.append('bukti_transfer', uploadFile);
      axios.post(`/api/proposals/${proposal.id}/upload-bukti`, formData)
        .then(() => { showToast('Bukti transfer berhasil diupload dan status diperbarui!'); onClose(); })
        .catch(() => showToast('Gagal upload bukti transfer (Pastikan format PDF Max 5MB)'));
    } else {
      onUpdateStatus(proposal.id, decisionStatus, catatanRevisi);
    }
  };

  const needsNote = ['Dalam Review', 'Revisi Proposal', 'Menunggu Evidence'].includes(decisionStatus);
  const isSaveDisabled = decisionStatus === 'Dana Cair' && !uploadFile && proposal.status !== 'Dana Cair';

  return (
    <div className="overlay open" onClick={(e) => { if (e.target.className.includes('overlay')) onClose(); }}>
      <div className="modal">
        <div className="mh"><div className="mt">Ubah Status Proposal</div><button className="cx" onClick={onClose}>&#x2715;</button></div>
        <div className="mb" style={{ padding: '24px' }}>
          {/* Proposal info strip */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>{proposal.kode_tiket}</div>
              <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '1px' }}>{proposal.kegiatan}</div>
            </div>
            <span className={`status ${getStatusClass(proposal.status)}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{proposal.status}</span>
          </div>

          {/* Status grid picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Pilih Status Baru</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {STATUS_OPTIONS.map(opt => {
                const isSelected = decisionStatus === opt.value;
                const isCurrent = proposal.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDecisionStatus(opt.value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: '5px', padding: '11px 12px', borderRadius: '10px', cursor: 'pointer',
                      border: isSelected ? `2px solid ${opt.color}` : `1.5px solid ${isCurrent ? opt.border : '#e9eef5'}`,
                      background: isSelected ? opt.bg : (isCurrent ? `${opt.bg}99` : '#fafafa'),
                      boxShadow: isSelected ? `0 0 0 3px ${opt.color}1a, 0 2px 8px ${opt.color}18` : 'none',
                      transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)', textAlign: 'left',
                      position: 'relative', width: '100%',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = opt.border; e.currentTarget.style.background = opt.bg; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = isCurrent ? opt.border : '#e9eef5'; e.currentTarget.style.background = isCurrent ? `${opt.bg}99` : '#fafafa'; e.currentTarget.style.transform = 'none'; } }}
                  >
                    {isCurrent && !isSelected && (
                      <span style={{ position: 'absolute', top: '6px', right: '7px', fontSize: '9px', fontWeight: 700, color: opt.color, background: opt.bg, border: `1px solid ${opt.border}`, borderRadius: '4px', padding: '1px 5px', letterSpacing: '0.2px' }}>Saat ini</span>
                    )}
                    {isSelected && (
                      <span style={{ position: 'absolute', top: '7px', right: '8px', color: opt.color }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{opt.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: isSelected ? opt.color : '#1e293b', lineHeight: 1.3 }}>{opt.value}</span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 400 }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional note field */}
          {needsNote && (
            <div style={{ marginBottom: '20px' }}>
              <label className="lbl" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text)' }}>Catatan Revisi / Pesan <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea className="inp" value={catatanRevisi} onChange={e => setCatatanRevisi(e.target.value)} rows="3" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} placeholder="Tuliskan catatan atau instruksi perbaikan..."></textarea>
            </div>
          )}

          {/* Dana Cair upload */}
          {decisionStatus === 'Dana Cair' && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
              <label className="lbl" style={{ color: '#0369a1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Upload Bukti Pengiriman Dana (*.PDF, Max 5MB)</label>
              <input type="file" className="inp" accept="application/pdf" onChange={e => setUploadFile(e.target.files[0])} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px dashed #7dd3fc', borderRadius: '6px' }} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <button className="btn btn-d" style={{ padding: '10px 22px', fontSize: '14px' }} onClick={onClose}>Batal</button>
            <button className="btn btn-p" style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }} disabled={isSaveDisabled} onClick={handleSave}>Simpan Status</button>
          </div>
        </div>
      </div>
    </div>
  );
}
