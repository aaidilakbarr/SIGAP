import React, { useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FilePenLine,
  FileText,
  FileUp,
  Landmark,
  Loader2,
  MessageSquare,
  PackageCheck,
  Phone,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  User,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  buildBeritaAcaraPreviewUrl,
  buildFilePreviewUrl,
  formatRupiah,
  STATUS_OPTIONS,
} from '../shared/utils';
import { StatusBadge } from '../shared/SharedComponents';

const STATUS_ICON_MAP = {
  Clock,
  Search,
  FilePenLine,
  PackageCheck,
  Banknote,
  FileUp,
  CheckCircle2,
  XCircle,
};

export function DetailModal({
  proposal,
  activeRole,
  onClose,
  onOpenStatusModal,
  onRequestDeleteComment,
  showToast,
  setSelectedProposal,
  fetchProposals,
}) {
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!proposal) return null;

  const ba = proposal.berita_acara || proposal.beritaAcara;
  const isAdmin = ['master', 'reviewer', 'admin', 'superadmin'].includes(activeRole);
  const hasBankInfo = Boolean(
    proposal.nama_bank || proposal.nomor_rekening || proposal.atas_nama
  );

  const attachedDocs = [
    proposal.file_proposal && {
      key: 'proposal',
      label: 'File Proposal',
      sub: 'Dokumen pengajuan utama',
      href: buildFilePreviewUrl(proposal.file_proposal, `Proposal - ${proposal.kode_tiket}`),
      iconBox: 'bg-emerald-100 text-emerald-800',
      borderHover: 'hover:border-emerald-300',
    },
    proposal.evidence_dokumen && {
      key: 'evidence',
      label: 'File LPJ / Evidence',
      sub: 'Laporan pertanggungjawaban',
      href: buildFilePreviewUrl(proposal.evidence_dokumen, `LPJ Evidence - ${proposal.kode_tiket}`),
      iconBox: 'bg-amber-100 text-amber-800',
      borderHover: 'hover:border-amber-300',
    },
    proposal.bukti_transfer && {
      key: 'transfer',
      label: 'Bukti Pembayaran',
      sub: 'Bukti pencairan dana',
      href: buildFilePreviewUrl(proposal.bukti_transfer, `Bukti Pembayaran - ${proposal.kode_tiket}`),
      iconBox: 'bg-sky-100 text-sky-800',
      borderHover: 'hover:border-sky-300',
    },
  ].filter(Boolean);

  const handleGenerateBA = async () => {
    try {
      setGenerating(true);
      const res = await axios.post(`/api/proposals/${proposal.id}/berita-acara/generate`, {
        catatan_admin: catatanAdmin,
      });
      showToast('Berita Acara berhasil dibuat.', 'success');

      if (setSelectedProposal) {
        setSelectedProposal({
          ...proposal,
          berita_acara: res.data.data,
        });
      }
      if (fetchProposals) {
        fetchProposals();
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Gagal membuat Berita Acara.';
      showToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={Boolean(proposal)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        {/* Executive Document Header */}
        <DialogHeader className="bg-muted/25 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
              {proposal.kode_tiket}
            </span>
            <StatusBadge status={proposal.status} />
            <Badge variant="secondary">{proposal.jenis}</Badge>
          </div>
          <DialogTitle className="text-base sm:text-lg font-extrabold leading-snug text-foreground">
            {proposal.kegiatan}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ringkasan informasi pemohon, nominal anggaran, lampiran dokumen, dan riwayat catatan.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-4 space-y-5 sm:px-6 sm:py-5">
          {/* Deadline Warning (only when active) */}
          {proposal.revisi_deadline && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <AlertTitle>Batas Pengerjaan Revisi</AlertTitle>
                <AlertDescription>
                  Tenggat penyelesaian:{' '}
                  <strong>{new Date(proposal.revisi_deadline).toLocaleString('id-ID')}</strong>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Zone 1: Financial & Transfer Hero Strip */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 sm:grid-cols-12 sm:items-center">
            <div className="sm:col-span-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Banknote className="size-3.5 text-primary" />
                Dana Diajukan
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-primary tabular-nums">
                Rp {formatRupiah(proposal.dana_diajukan)}
              </div>
            </div>

            <div className="border-t border-primary/15 pt-3 sm:col-span-7 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Landmark className="size-3.5 text-primary" />
                Rekening Tujuan Pencairan
              </div>
              {hasBankInfo ? (
                <div className="mt-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm font-bold text-foreground">
                    <span>{proposal.nama_bank || '-'}</span>
                    <span className="font-mono text-primary">
                      {proposal.nomor_rekening || '-'}
                    </span>
                  </div>
                  {proposal.atas_nama && (
                    <div className="text-xs text-muted-foreground">
                      a.n. <strong className="font-semibold text-foreground">{proposal.atas_nama}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  Pemohon belum mencantumkan informasi rekening.
                </p>
              )}
            </div>
          </div>

          {/* Zone 2: Structured Applicant & Schedule Info Card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <User className="size-3.5" />
                  Pemohon
                </div>
                <div className="mt-1.5 text-sm font-bold text-foreground">
                  {proposal.user?.name || '-'}
                </div>
                {proposal.user?.instansi && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="size-3 shrink-0" />
                    <span className="truncate">{proposal.user.instansi}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Phone className="size-3.5" />
                  Nomor Telepon
                </div>
                <div className="mt-1.5 font-mono text-sm font-semibold text-foreground">
                  {proposal.user?.nomor_telepon || '-'}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">Kontak aktif pemohon</div>
              </div>

              <div className="p-3.5 sm:p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Rencana Pelaksanaan
                </div>
                <div className="mt-1.5 text-sm font-bold text-foreground">
                  {proposal.tgl_pelaksanaan || '-'}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">Skema {proposal.jenis}</div>
              </div>
            </div>

            {proposal.catatan && (
              <div className="border-t border-border bg-muted/30 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Catatan Pemohon
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed">
                  {proposal.catatan}
                </p>
              </div>
            )}
          </div>

          {/* Zone 3: Attached Documents Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Dokumen Terlampir
              </h4>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
                {attachedDocs.length} berkas
              </span>
            </div>

            {attachedDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-xs text-muted-foreground">
                Belum ada dokumen yang diunggah pada proposal ini.
              </div>
            ) : (
              <div
                className={cn(
                  'grid grid-cols-1 gap-2.5',
                  attachedDocs.length === 2 && 'sm:grid-cols-2',
                  attachedDocs.length >= 3 && 'sm:grid-cols-3'
                )}
              >
                {attachedDocs.map((doc) => (
                  <div
                    key={doc.key}
                    className={cn(
                      'flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors',
                      doc.borderHover
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          doc.iconBox
                        )}
                      >
                        <FileText className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground leading-snug">
                          {doc.label}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{doc.sub}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full min-h-10 sm:min-h-8"
                    >
                      <a href={doc.href} target="_blank" rel="noopener noreferrer">
                        Buka Preview
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zone 4: Berita Acara Section (when Selesai) */}
          {proposal.status === 'Selesai' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dokumen Berita Acara
                </h4>

                {ba ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/55 p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center rounded-md bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-900 border border-emerald-200">
                          {ba.nomor_ba}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1.5">
                          Diterbitkan oleh:{' '}
                          <strong className="font-semibold text-foreground">
                            {ba.generated_by?.name ||
                              ba.generated_by_user?.name ||
                              (typeof ba.generated_by === 'object' ? ba.generated_by?.name : 'Admin')}
                          </strong>
                        </div>
                      </div>
                      <Badge className="bg-[#1a5e1f] text-white">Terbit</Badge>
                    </div>
                    {ba.catatan_admin && (
                      <div className="rounded-lg border border-emerald-200/80 bg-card px-3 py-2.5 text-xs text-foreground italic">
                        <strong className="not-italic">Catatan:</strong> &quot;{ba.catatan_admin}&quot;
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button variant="outline" size="sm" asChild className="min-h-10 bg-card sm:min-h-8">
                        <a
                          href={buildBeritaAcaraPreviewUrl(proposal.id, ba.nomor_ba)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="size-3.5" />
                          Preview PDF
                        </a>
                      </Button>
                      <Button size="sm" asChild className="min-h-10 sm:min-h-8">
                        <a href={`/api/proposals/${proposal.id}/berita-acara/download`}>
                          <Download className="size-3.5" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : isAdmin ? (
                  <div className="rounded-xl border border-border bg-muted/35 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dokumen Berita Acara belum diterbitkan. Anda dapat membuat berkas PDF resmi untuk proposal ini sekarang.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="catatan-ba" className="text-xs">
                        Catatan Admin (Opsional)
                      </Label>
                      <Textarea
                        id="catatan-ba"
                        value={catatanAdmin}
                        onChange={(e) => setCatatanAdmin(e.target.value)}
                        placeholder="Tambahkan catatan khusus untuk dicantumkan pada dokumen Berita Acara..."
                        rows={2}
                      />
                    </div>
                    <Button
                      className="w-full min-h-10"
                      disabled={generating}
                      onClick={handleGenerateBA}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sedang Membuat Berita Acara...
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="size-4" />
                          Generate Berita Acara
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Berita Acara resmi sedang diproses oleh Administrator.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Zone 5: Admin Comments History */}
          {proposal.comments && proposal.comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <MessageSquare className="size-3.5" />
                    Riwayat Catatan Admin
                  </h4>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 tabular-nums">
                    {proposal.comments.length} catatan
                  </span>
                </div>
                <div className="space-y-2">
                  {proposal.comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-sm text-amber-950"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-800 tabular-nums">
                          {new Date(c.created_at).toLocaleString('id-ID')}
                        </span>
                        {(activeRole === 'master' || activeRole === 'reviewer') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onRequestDeleteComment(c.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Hapus
                          </Button>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.komentar}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:items-center sm:justify-between">
          <div className="hidden text-xs text-muted-foreground sm:block">
            Kode Tiket: <span className="font-mono font-semibold text-foreground">{proposal.kode_tiket}</span>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="w-full min-h-11 sm:w-auto sm:min-h-9"
              onClick={onClose}
            >
              Tutup
            </Button>
            {isAdmin && onOpenStatusModal && (
              <Button
                className="w-full min-h-11 sm:w-auto sm:min-h-9"
                onClick={onOpenStatusModal}
              >
                <SlidersHorizontal className="size-4" />
                Ubah Status
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StatusModal({ proposal, onClose, onUpdateStatus, showToast, onRefresh }) {
  const [decisionStatus, setDecisionStatus] = useState(proposal?.status || '');
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!proposal) return null;

  const needsNote = ['Dalam Review', 'Revisi Proposal', 'Menunggu Evidence'].includes(decisionStatus);
  const isSaveDisabled =
    submitting || (decisionStatus === 'Dana Cair' && !uploadFile && proposal.status !== 'Dana Cair');

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (decisionStatus === 'Dana Cair' && uploadFile) {
        const formData = new FormData();
        formData.append('bukti_transfer', uploadFile);
        await axios.post(`/api/proposals/${proposal.id}/upload-bukti`, formData);
        showToast('Bukti transfer berhasil diunggah dan status diperbarui.', 'success');
        if (onRefresh) onRefresh();
        onClose();
      } else {
        await onUpdateStatus(proposal.id, decisionStatus, catatanRevisi);
      }
    } catch (e) {
      showToast('Gagal mengunggah bukti transfer. Pastikan format PDF maks. 5MB.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(proposal)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah Status Proposal</DialogTitle>
          <DialogDescription>
            Pilih tahap pemrosesan terbaru untuk pengajuan ini.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-4 space-y-5 sm:px-6 sm:py-5">
          {/* Proposal summary */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-bold text-foreground">
                {proposal.kode_tiket}
              </div>
              <div className="truncate text-sm font-medium text-muted-foreground">
                {proposal.kegiatan}
              </div>
            </div>
            <StatusBadge status={proposal.status} />
          </div>

          {/* Status picker */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pilih Status Baru
            </Label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = STATUS_ICON_MAP[opt.iconName] || Clock;
                const isSelected = decisionStatus === opt.value;
                const isCurrent = proposal.status === opt.value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecisionStatus(opt.value)}
                    className={cn(
                      'relative flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? opt.activeClass
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className="size-4 shrink-0" />
                      {isSelected ? (
                        <Check className="size-4 shrink-0" />
                      ) : isCurrent ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Saat ini
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs font-bold leading-snug">{opt.value}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revision note */}
          {needsNote && (
            <div className="space-y-2">
              <Label htmlFor="status-note">
                Catatan Revisi / Pesan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="status-note"
                value={catatanRevisi}
                onChange={(e) => setCatatanRevisi(e.target.value)}
                rows={3}
                placeholder="Tuliskan catatan atau instruksi perbaikan untuk pemohon..."
              />
            </div>
          )}

          {/* Proof of transfer upload */}
          {decisionStatus === 'Dana Cair' && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-2.5">
              <Label htmlFor="bukti-transfer-file" className="text-sky-900">
                Upload Bukti Pengiriman Dana (PDF, Maks. 5MB)
              </Label>
              <label
                htmlFor="bukti-transfer-file"
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-sky-300 bg-card px-4 py-3 text-sm transition-colors hover:bg-sky-50/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Upload className="size-4 shrink-0 text-sky-700" />
                  <span className="truncate font-medium text-foreground">
                    {uploadFile ? uploadFile.name : 'Pilih berkas bukti transfer (.pdf)'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-sky-700 shrink-0">Browse</span>
              </label>
              <input
                id="bukti-transfer-file"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full min-h-11 sm:w-auto sm:min-h-9" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button className="w-full min-h-11 sm:w-auto sm:min-h-9" disabled={isSaveDisabled} onClick={handleSave}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Simpan Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
