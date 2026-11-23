import React, { useState } from 'react';
import axios from 'axios';
import { Home, MapPin, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRupiah } from './shared/utils';

import { PortalHome } from './portal/PortalHome';
import { ProposalForm } from './portal/ProposalForm';
import { ProposalDetail } from './portal/ProposalDetail';

const getCardBorderAccent = (status) => {
  if (status === 'Selesai') return 'border-l-4 border-l-emerald-600';
  if (status === 'Menunggu Evidence' || status === 'Menunggu Verif' || status === 'Revisi Proposal') {
    return 'border-l-4 border-l-amber-500';
  }
  if (status === 'Gagal Bayar') return 'border-l-4 border-l-red-600';
  return 'border-l-4 border-l-primary';
};

export default function UserPortal({
  user,
  proposals,
  loading,
  showToast,
  fetchProposals,
  portalTab,
  setPortalTab,
  totalItems,
  currentPage,
  totalPages,
  dashboardStats,
  sidebarOpen,
  searchQuery,
  setSearchQuery,
}) {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newProposal, setNewProposal] = useState({
    kegiatan: '',
    jenis: 'Advance',
    tgl_pelaksanaan: '',
    dana_diajukan: '',
    catatan: '',
    file: null,
    nama_bank: '',
    nomor_rekening: '',
    atas_nama: '',
  });

  const filteredProposals = proposals;

  const totalCount = totalItems || 0;
  const actionCount = dashboardStats
    ? (dashboardStats.total_evidence || 0) + (dashboardStats.status_counts?.['Revisi Proposal'] || 0)
    : proposals.filter((p) => p.status === 'Menunggu Evidence' || p.status === 'Revisi Proposal').length;
  const doneCount = dashboardStats
    ? dashboardStats.total_selesai || 0
    : proposals.filter((p) => p.status === 'Selesai').length;

  const handleCreateProposal = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('kegiatan', newProposal.kegiatan);
      formData.append('jenis', newProposal.jenis);
      formData.append('tgl_pelaksanaan', newProposal.tgl_pelaksanaan);
      formData.append('dana_diajukan', newProposal.dana_diajukan.toString().replace(/\./g, ''));
      formData.append('catatan', newProposal.catatan);
      formData.append('nama_bank', newProposal.nama_bank);
      formData.append('nomor_rekening', newProposal.nomor_rekening);
      formData.append('atas_nama', newProposal.atas_nama);
      if (newProposal.file) formData.append('file_proposal', newProposal.file);

      await axios.post('/api/proposals', formData);
      showToast('Proposal berhasil diajukan.', 'success');
      setNewProposal({
        kegiatan: '',
        jenis: 'Advance',
        tgl_pelaksanaan: '',
        dana_diajukan: '',
        catatan: '',
        file: null,
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',
      });
      fetchProposals(1);
      setPortalTab('home');
    } catch (e) {
      let msg = 'Gagal mengajukan proposal.';
      if (e.response?.data?.errors) msg = Object.values(e.response.data.errors)[0][0];
      else if (e.response?.data?.message) msg = e.response.data.message;
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
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
    fileInputs.forEach((input) => {
      input.value = '';
    });
  };

  const handleUploadEvidence = async (proposalId) => {
    if (!selectedUploadFile) {
      showToast('Pilih file terlebih dahulu.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('evidence_dokumen', selectedUploadFile);
      await axios.post(`/api/proposals/${proposalId}/upload-evidence`, formData);
      showToast('Evidence berhasil dikirim.', 'success');
      setSelectedUploadFile(null);
      fetchProposals(currentPage);
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengunggah evidence.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadProposal = async (proposalId) => {
    if (!selectedUploadFile) {
      showToast('Pilih file proposal revisi terlebih dahulu.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file_proposal', selectedUploadFile);
      await axios.post(`/api/proposals/${proposalId}/upload-proposal`, formData);
      showToast('Proposal revisi berhasil diunggah.', 'success');
      setSelectedUploadFile(null);
      fetchProposals(currentPage);
      setPortalTab('home');
    } catch (e) {
      showToast('Gagal mengunggah proposal revisi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {portalTab === 'home' && (
        <PortalHome
          user={user}
          loading={loading}
          filteredProposals={filteredProposals}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={totalCount}
          actionCount={actionCount}
          doneCount={doneCount}
          setPortalTab={setPortalTab}
          setSelectedProposal={setSelectedProposal}
          currentPage={currentPage}
          totalPages={totalPages}
          fetchProposals={fetchProposals}
          getCardBorderAccent={getCardBorderAccent}
          formatRupiah={formatRupiah}
        />
      )}

      {portalTab === 'new' && (
        <ProposalForm
          newProposal={newProposal}
          setNewProposal={setNewProposal}
          handleCreateProposal={handleCreateProposal}
          submitting={submitting}
          setPortalTab={setPortalTab}
          formatRupiah={formatRupiah}
        />
      )}

      {portalTab === 'detail' && (
        <ProposalDetail
          selectedProposal={selectedProposal}
          setSelectedProposal={setSelectedProposal}
          setPortalTab={setPortalTab}
          selectedUploadFile={selectedUploadFile}
          submitting={submitting}
          handleFileChange={handleFileChange}
          removeSelectedFile={removeSelectedFile}
          handleUploadProposal={handleUploadProposal}
          handleUploadEvidence={handleUploadEvidence}
          formatRupiah={formatRupiah}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      {!sidebarOpen && (
        <nav
          role="navigation"
          aria-label="Navigasi Portal Pemohon"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] backdrop-blur-xs lg:hidden"
        >
          <button
            type="button"
            id="ubn-home"
            onClick={() => {
              setPortalTab('home');
              setSelectedProposal(null);
              setSelectedUploadFile(null);
            }}
            className={cn(
              'relative flex min-h-15 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors active:bg-muted/60 cursor-pointer',
              portalTab === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {portalTab === 'home' && (
              <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-primary" />
            )}
            <Home className="size-5" />
            <span>Beranda</span>
          </button>

          <button
            type="button"
            id="ubn-new"
            onClick={() => setPortalTab('new')}
            className={cn(
              'relative flex min-h-15 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors active:bg-muted/60 cursor-pointer',
              portalTab === 'new' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {portalTab === 'new' && (
              <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-primary" />
            )}
            <PlusCircle className="size-5" />
            <span>Ajukan</span>
          </button>

          <button
            type="button"
            id="ubn-track"
            onClick={() => {
              if (selectedProposal) {
                setPortalTab('detail');
              } else if (proposals.length > 0) {
                setSelectedProposal(proposals[0]);
                setSelectedUploadFile(null);
                setPortalTab('detail');
              }
            }}
            className={cn(
              'relative flex min-h-15 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors active:bg-muted/60 cursor-pointer',
              portalTab === 'detail' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {portalTab === 'detail' && (
              <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-primary" />
            )}
            <span className="relative">
              <MapPin className="size-5" />
              {actionCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {actionCount}
                </span>
              )}
            </span>
            <span>Track</span>
          </button>
        </nav>
      )}
    </div>
  );
}
