import React, { useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Banknote,
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
  PackageCheck,
  Search,
  Trash2,
  Upload,
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
import { formatRupiah, STATUS_OPTIONS } from '../shared/utils';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Proposal</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {proposal.kode_tiket}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-4 py-4 space-y-5 sm:px-6 sm:py-5">
          {proposal.revisi_deadline && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <AlertTitle>Batas Pengerjaan Revisi</AlertTitle>
                <AlertDescription>
                  {new Date(proposal.revisi_deadline).toLocaleString('id-ID')}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Core metadata grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Kode Tiket</div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {proposal.kode_tiket}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Status Saat Ini</div>
              <div className="mt-1">
                <StatusBadge status={proposal.status} />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Pemohon</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {proposal.user?.name || '-'}
              </div>
              {proposal.user?.instansi && (
                <div className="text-xs text-muted-foreground">{proposal.user.instansi}</div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Nomor Telepon</div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {proposal.user?.nomor_telepon || '-'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-muted-foreground">Nama Kegiatan</div>
              <div className="mt-1 text-sm font-semibold text-foreground leading-snug">
                {proposal.kegiatan}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Tanggal Pelaksanaan</div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {proposal.tgl_pelaksanaan || '-'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Skema Pencairan</div>
              <div className="mt-1">
                <Badge variant="secondary">{proposal.jenis}</Badge>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/40 p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Dana Diajukan</div>
                <div className="mt-0.5 text-lg font-extrabold text-primary tabular-nums">
                  Rp {formatRupiah(proposal.dana_diajukan)}
                </div>
              </div>
              {(proposal.nama_bank || proposal.nomor_rekening || proposal.atas_nama) && (
                <div className="flex items-start gap-2.5 text-left sm:text-right">
                  <Landmark className="size-4 text-muted-foreground shrink-0 mt-0.5 sm:hidden" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Rekening Tujuan
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {proposal.nama_bank || '-'}, {proposal.nomor_rekening || '-'}
                      {proposal.atas_nama ? ` (a.n. ${proposal.atas_nama})` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Attached Documents */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dokumen Terlampir
            </h4>
            {!proposal.file_proposal && !proposal.evidence_dokumen && !proposal.bukti_transfer ? (
              <p className="text-xs text-muted-foreground italic">Belum ada dokumen terlampir.</p>
            ) : (
              <div className="grid gap-2.5">
                {proposal.file_proposal && (
                  <div className="flex flex-col items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-emerald-900">
                      <FileText className="size-4 shrink-0 text-emerald-700" />
                      File Proposal
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                      <a
                        href={`/api/preview-file/${proposal.file_proposal}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
                {proposal.evidence_dokumen && (
                  <div className="flex flex-col items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-amber-950">
                      <FileText className="size-4 shrink-0 text-amber-700" />
                      File LPJ / Evidence
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                      <a
                        href={`/api/preview-file/${proposal.evidence_dokumen}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
                {proposal.bukti_transfer && (
                  <div className="flex flex-col items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-sky-950">
                      <FileText className="size-4 shrink-0 text-sky-700" />
                      Bukti Pembayaran
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                      <a
                        href={`/api/preview-file/${proposal.bukti_transfer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Berita Acara Section */}
          {proposal.status === 'Selesai' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dokumen Berita Acara
                </h4>

                {ba ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-emerald-900 font-mono">
                          {ba.nomor_ba}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Diterbitkan oleh:{' '}
                          {ba.generated_by?.name ||
                            ba.generated_by_user?.name ||
                            (typeof ba.generated_by === 'object' ? ba.generated_by?.name : 'Admin')}
                        </div>
                      </div>
                      <Badge className="bg-emerald-700 text-white">Terbit</Badge>
                    </div>
                    {ba.catatan_admin && (
                      <div className="rounded-lg border border-emerald-200/80 bg-card px-3 py-2.5 text-xs text-foreground italic">
                        <strong className="not-italic">Catatan:</strong> &quot;{ba.catatan_admin}&quot;
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button variant="outline" size="sm" asChild className="min-h-10 bg-card sm:min-h-8">
                        <a
                          href={`/api/proposals/${proposal.id}/berita-acara/preview`}
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
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dokumen Berita Acara belum dibuat. Anda dapat menerbitkan dokumen resmi secara otomatis untuk proposal ini.
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
                      className="w-full"
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

          {/* Admin Notes */}
          {proposal.comments && proposal.comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Catatan dari Admin
                </h4>
                <div className="space-y-2">
                  {proposal.comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-sm text-amber-950"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-800">
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

        <DialogFooter>
          <Button variant="outline" className="w-full min-h-11 sm:w-auto sm:min-h-9" onClick={onClose}>
            Tutup
          </Button>
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
