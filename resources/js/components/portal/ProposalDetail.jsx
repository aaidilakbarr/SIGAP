import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Landmark,
  Loader2,
  MessageSquare,
  Paperclip,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '../shared/SharedComponents';
import { buildBeritaAcaraPreviewUrl, buildFilePreviewUrl } from '../shared/utils';
import { Timeline } from './Timeline';

export const ProposalDetail = ({
  selectedProposal,
  setSelectedProposal,
  setPortalTab,
  selectedUploadFile,
  submitting,
  handleFileChange,
  removeSelectedFile,
  handleUploadProposal,
  handleUploadEvidence,
  formatRupiah,
}) => {
  if (!selectedProposal) return null;
  const p = selectedProposal;
  const ba = p.berita_acara || p.beritaAcara;

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() => {
          setPortalTab('home');
          setSelectedProposal(null);
        }}
      >
        <ArrowLeft className="size-4" />
        Kembali ke Daftar
      </Button>

      <Card className="overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-muted/30 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-primary">{p.kode_tiket}</span>
            <StatusBadge status={p.status} />
          </div>
          <h2 className="mt-2 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            {p.kegiatan}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground sm:gap-3">
            <span className="font-medium text-foreground">{p.user?.name}</span>
            <Badge variant="secondary">{p.jenis}</Badge>
            {p.tgl_pelaksanaan && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                {p.tgl_pelaksanaan}
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Deadline Reminder */}
          {p.revisi_deadline &&
            (p.status === 'Revisi Proposal' || p.status === 'Menunggu Evidence') && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle>Pengingat Tenggat Waktu (Deadline)</AlertTitle>
                  <AlertDescription>
                    Batas akhir penyelesaian:{' '}
                    <strong>
                      {new Date(p.revisi_deadline).toLocaleString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </strong>
                    . Lengkapi dokumen sebelum batas waktu berakhir agar pengajuan tetap diproses.
                  </AlertDescription>
                </div>
              </Alert>
            )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 p-3.5">
              <div className="text-xs font-medium text-muted-foreground">Dana Diajukan</div>
              <div className="mt-1 text-lg font-extrabold text-primary tabular-nums">
                Rp {formatRupiah(p.dana_diajukan)}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3.5">
              <div className="text-xs font-medium text-muted-foreground">Skema Pencairan</div>
              <div className="mt-1 text-sm font-bold text-foreground">{p.jenis}</div>
            </div>
            {p.user?.instansi && (
              <div>
                <div className="text-xs font-medium text-muted-foreground">Instansi</div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">
                  {p.user.instansi}
                </div>
              </div>
            )}
            {p.user?.nomor_telepon && (
              <div>
                <div className="text-xs font-medium text-muted-foreground">No. Telepon</div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">
                  {p.user.nomor_telepon}
                </div>
              </div>
            )}
            {(p.nama_bank || p.nomor_rekening || p.atas_nama) && (
              <div className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3.5">
                <Landmark className="size-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Informasi Rekening
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {p.nama_bank || '-'}, {p.nomor_rekening || '-'}
                    {p.atas_nama ? ` (a.n. ${p.atas_nama})` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Progress Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Progres Tahapan Proposal
            </h3>
            <Timeline currentStatus={p.status} />
          </div>

          {/* Admin Comments */}
          {p.comments && p.comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <MessageSquare className="size-3.5" />
                  Catatan dari Admin
                </h3>
                <div className="space-y-2">
                  {p.comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-sm text-amber-950"
                    >
                      <div className="mb-1 text-xs font-semibold text-amber-800">
                        {new Date(c.created_at).toLocaleString('id-ID')}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{c.komentar}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Attached Documents */}
          {(p.file_proposal || p.evidence_dokumen || p.bukti_transfer) && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dokumen Terlampir
                </h3>
                <div className="grid gap-2.5">
                  {p.file_proposal && (
                    <div className="flex flex-col items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                      <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                        <FileText className="size-4 shrink-0 text-emerald-700" />
                        File Proposal
                      </span>
                      <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                        <a
                          href={buildFilePreviewUrl(p.file_proposal, `Proposal - ${p.kode_tiket}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                  {p.evidence_dokumen && (
                    <div className="flex flex-col items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                      <span className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                        <FileText className="size-4 shrink-0 text-amber-700" />
                        File LPJ / Evidence
                      </span>
                      <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                        <a
                          href={buildFilePreviewUrl(p.evidence_dokumen, `LPJ Evidence - ${p.kode_tiket}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                  {p.bukti_transfer && (
                    <div className="flex flex-col items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                      <span className="flex items-center gap-2 text-sm font-semibold text-sky-950">
                        <FileText className="size-4 shrink-0 text-sky-700" />
                        Bukti Pengiriman Dana
                      </span>
                      <Button variant="outline" size="sm" asChild className="w-full min-h-10 bg-card sm:w-auto sm:min-h-8">
                        <a
                          href={buildFilePreviewUrl(p.bukti_transfer, `Bukti Pengiriman Dana - ${p.kode_tiket}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Section */}
          <div className="space-y-4">
            {p.status === 'Revisi Proposal' && (
              <div className="space-y-4">
                <Alert variant="warning">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle>Revisi Proposal Diperlukan</AlertTitle>
                    <AlertDescription>
                      Silakan unggah berkas proposal terbaru yang sudah diperbaiki sesuai catatan admin.
                    </AlertDescription>
                  </div>
                </Alert>

                {!selectedUploadFile ? (
                  <label
                    htmlFor={`proposal-up-${p.id}`}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input bg-muted/30 px-4 py-7 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Paperclip className="size-6 text-primary" />
                    <div className="text-sm font-semibold text-foreground">
                      Pilih file proposal revisi
                    </div>
                    <div className="text-xs text-muted-foreground">PDF, DOC, DOCX, maks. 10MB</div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {selectedUploadFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={removeSelectedFile}
                      aria-label="Hapus file terpilih"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}

                <input
                  type="file"
                  id={`proposal-up-${p.id}`}
                  className="sr-only up-upload-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />

                <Button
                  className="w-full min-h-11"
                  disabled={!selectedUploadFile || submitting}
                  onClick={() => handleUploadProposal(p.id)}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload Proposal Revisi
                </Button>
              </div>
            )}

            {p.status === 'Menunggu Evidence' && (
              <div className="space-y-4">
                <Alert variant="warning">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle>Unggah Dokumen LPJ / Evidence</AlertTitle>
                    <AlertDescription>
                      Unggah laporan pertanggungjawaban (absen, foto kegiatan, LPJ PDF) sebelum batas waktu berakhir.
                    </AlertDescription>
                  </div>
                </Alert>

                {!selectedUploadFile ? (
                  <label
                    htmlFor={`evidence-up-${p.id}`}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input bg-muted/30 px-4 py-7 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Paperclip className="size-6 text-primary" />
                    <div className="text-sm font-semibold text-foreground">
                      Pilih file LPJ atau Evidence
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PDF, DOC, JPG, PNG, maks. 10MB
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {selectedUploadFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={removeSelectedFile}
                      aria-label="Hapus file terpilih"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}

                <input
                  type="file"
                  id={`evidence-up-${p.id}`}
                  className="sr-only up-upload-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />

                <Button
                  className="w-full min-h-11"
                  disabled={!selectedUploadFile || submitting}
                  onClick={() => handleUploadEvidence(p.id)}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload Dokumen LPJ / Evidence
                </Button>
              </div>
            )}

            {p.status === 'Selesai' && (
              <div className="space-y-4">
                <Alert variant="success">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle>Proses Selesai</AlertTitle>
                    <AlertDescription>
                      Dana telah dicairkan dan seluruh dokumen LPJ telah diverifikasi.
                    </AlertDescription>
                  </div>
                </Alert>

                {ba ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                      <FileText className="size-4 text-emerald-700" />
                      Dokumen Berita Acara Terbit
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      Berita Acara resmi bernomor{' '}
                      <strong className="font-mono text-foreground">{ba.nomor_ba}</strong> telah
                      diterbitkan untuk pengajuan proposal ini.
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button variant="outline" size="sm" asChild className="min-h-10 bg-card">
                        <a
                          href={buildBeritaAcaraPreviewUrl(p.id, ba.nomor_ba)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="size-4" />
                          Preview PDF
                        </a>
                      </Button>
                      <Button size="sm" asChild className="min-h-10">
                        <a href={`/api/proposals/${p.id}/berita-acara/download`}>
                          <Download className="size-4" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3">
                    <Clock className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Berita Acara Sedang Diproses
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        Menunggu dokumen Berita Acara resmi diterbitkan oleh Admin. Periksa kembali halaman ini secara berkala.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {p.status === 'Gagal Bayar' && (
              <Alert variant="destructive">
                <XCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle>Gagal Bayar</AlertTitle>
                  <AlertDescription>
                    Proposal ini mengalami kendala gagal bayar. Hubungi admin melalui tombol WhatsApp CS di bagian atas untuk tindak lanjut.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {!['Menunggu Evidence', 'Revisi Proposal', 'Selesai', 'Gagal Bayar'].includes(
              p.status
            ) && (
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-center">
                <div className="text-sm font-semibold text-foreground">
                  Sedang dalam tahap administrasi internal
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pantau progres pengajuan Anda secara berkala di halaman ini.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
