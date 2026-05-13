import React, { useState } from 'react';
import axios from 'axios';
import './UserPortal.css';

import { PortalHome } from './portal/PortalHome';
import { ProposalForm } from './portal/ProposalForm';
import { ProposalDetail } from './portal/ProposalDetail';

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

export default function UserPortal({ user, proposals, showToast, fetchProposals, portalTab, setPortalTab, totalItems, currentPage, totalPages, dashboardStats, sidebarOpen, searchQuery, setSearchQuery }) {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [newProposal, setNewProposal] = useState({
    kegiatan: '', jenis: 'Advance', tgl_pelaksanaan: '', dana_diajukan: '', catatan: '', file: null, nama_bank: '', nomor_rekening: ''
  });

  // Use the proposals from props directly (backend already filtered them)
  const filteredProposals = proposals;

  // Stats counts
  const totalCount = totalItems || 0;
  const actionCount = dashboardStats ? ((dashboardStats.total_evidence || 0) + (dashboardStats.status_counts?.['Revisi Proposal'] || 0)) : proposals.filter(p => p.status === 'Menunggu Evidence' || p.status === 'Revisi Proposal').length;
  const doneCount = dashboardStats ? (dashboardStats.total_selesai || 0) : proposals.filter(p => p.status === 'Selesai').length;

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedUploadFile(e.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedUploadFile(null);
    const fileInputs = document.querySelectorAll('.up-upload-input');
    fileInputs.forEach(input => input.value = '');
  };

  const handleUploadEvidence = async (proposalId) => {
    if (!selectedUploadFile) {
      showToast('Pilih file terlebih dahulu!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('evidence_dokumen', selectedUploadFile);
      await axios.post(`/api/proposals/${proposalId}/upload-evidence`, formData);
      showToast('Evidence berhasil dikirim!');
      setSelectedUploadFile(null);
      fetchProposals();
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengupload evidence.');
    }
  };

  const handleUploadProposal = async (proposalId) => {
    if (!selectedUploadFile) {
      showToast('Pilih file proposal revisi terlebih dahulu!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file_proposal', selectedUploadFile);
      await axios.post(`/api/proposals/${proposalId}/upload-proposal`, formData);
      showToast('Proposal revisi berhasil diunggah!');
      setSelectedUploadFile(null);
      fetchProposals();
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengupload proposal revisi.');
    }
  };

  return (
    <>
      {/* Tab Content */}
      <div className="page-view active content">
        {portalTab === 'home' && (
          <PortalHome 
            user={user} proposals={proposals} filteredProposals={filteredProposals}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            totalCount={totalCount} actionCount={actionCount} doneCount={doneCount}
            setPortalTab={setPortalTab} setSelectedProposal={setSelectedProposal}
            currentPage={currentPage} totalPages={totalPages} fetchProposals={fetchProposals}
            getCardStatusClass={getCardStatusClass} getStatusClass={getStatusClass} formatRupiah={formatRupiah}
          />
        )}
        {portalTab === 'new' && (
          <ProposalForm 
            newProposal={newProposal} setNewProposal={setNewProposal}
            handleCreateProposal={handleCreateProposal} setPortalTab={setPortalTab}
            formatRupiah={formatRupiah}
          />
        )}
        {portalTab === 'detail' && (
          <ProposalDetail 
            selectedProposal={selectedProposal} setSelectedProposal={setSelectedProposal}
            setPortalTab={setPortalTab} selectedUploadFile={selectedUploadFile}
            handleFileChange={handleFileChange} removeSelectedFile={removeSelectedFile}
            handleUploadProposal={handleUploadProposal} handleUploadEvidence={handleUploadEvidence}
            getStatusClass={getStatusClass} formatRupiah={formatRupiah}
          />
        )}
      </div>

      {/* Bottom Navigation Bar (mobile) */}
      <nav className="user-bottom-nav" role="navigation" aria-label="User navigation" style={{ display: sidebarOpen ? 'none' : '' }}>
        <div
          className={`ubn-item ${portalTab === 'home' ? 'active' : ''}`}
          onClick={() => { setPortalTab('home'); setSelectedProposal(null); setSelectedUploadFile(null); }}
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
              setSelectedUploadFile(null);
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
