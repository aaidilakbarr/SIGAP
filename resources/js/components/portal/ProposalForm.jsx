import React, { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  Landmark,
  Loader2,
  Paperclip,
  Receipt,
  Upload,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const POPULAR_BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga'];

const SCHEME_OPTIONS = [
  {
    value: 'Advance',
    title: 'Advance Payment',
    desc: 'Dana dicairkan di awal sebelum kegiatan dilaksanakan.',
    icon: Banknote,
  },
  {
    value: 'Reimburse',
    title: 'Reimbursement',
    desc: 'Dana diganti setelah kegiatan selesai disertai bukti.',
    icon: Receipt,
  },
];

export const ProposalForm = ({
  newProposal,
  setNewProposal,
  handleCreateProposal,
  submitting,
  setPortalTab,
  formatRupiah,
}) => {
  const [selectedBank, setSelectedBank] = useState(() => {
    if (!newProposal.nama_bank) return '';
    if (POPULAR_BANKS.includes(newProposal.nama_bank)) return newProposal.nama_bank;
    return 'Lainnya';
  });

  const [showBankInfo, setShowBankInfo] = useState(() =>
    Boolean(newProposal.nama_bank || newProposal.nomor_rekening || newProposal.atas_nama)
  );

  const checklist = [
    { label: 'Judul kegiatan', done: Boolean(newProposal.kegiatan?.trim()) },
    { label: 'Tanggal pelaksanaan', done: Boolean(newProposal.tgl_pelaksanaan) },
    { label: 'Nominal dana diajukan', done: Boolean(newProposal.dana_diajukan) },
    { label: 'Berkas proposal terlampir', done: Boolean(newProposal.file) },
  ];
  const completedCount = checklist.filter((c) => c.done).length;
  const isDisabled = submitting || completedCount < checklist.length;

  const formattedNominal = newProposal.dana_diajukan
    ? formatRupiah(newProposal.dana_diajukan.toString().replace(/\./g, ''))
    : '';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          onClick={() => setPortalTab('home')}
        >
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </Button>

        {/* Compact mobile completeness indicator */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums lg:hidden',
            completedCount === checklist.length
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          <CheckCircle2 className="size-3.5 text-primary" />
          {completedCount} / {checklist.length} data wajib terisi
        </span>
      </div>

      {/* Main Responsive Layout: 8 + 4 columns on desktop, clean single stack on mobile */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6 items-start">
        {/* Left Main Form Sections */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-8">
          {/* Section 01: Informasi Kegiatan */}
          <Card className="overflow-hidden">
            <div className="flex items-start gap-3 border-b border-border bg-muted/25 px-4 py-3.5 sm:px-6 sm:py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground font-mono">
                01
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Informasi Kegiatan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tentukan judul kegiatan, jadwal pelaksanaan, dan skema pencairan dana.
                </p>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Nama Kegiatan */}
              <div className="space-y-2">
                <Label htmlFor="kegiatan">
                  Nama / Judul Kegiatan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kegiatan"
                  className="h-11 sm:h-10"
                  value={newProposal.kegiatan}
                  onChange={(e) => setNewProposal({ ...newProposal, kegiatan: e.target.value })}
                  placeholder="Contoh: Seminar Nasional Pengembangan SDM 2026"
                />
              </div>

              {/* Tanggal Pelaksanaan */}
              <div className="space-y-2 sm:max-w-xs">
                <Label htmlFor="tgl-pelaksanaan">
                  Tanggal Rencana Pelaksanaan <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  id="tgl-pelaksanaan"
                  value={newProposal.tgl_pelaksanaan}
                  onChange={(val) => setNewProposal({ ...newProposal, tgl_pelaksanaan: val })}
                  placeholder="Pilih tanggal pelaksanaan"
                  displayFormat="d MMMM yyyy"
                  clearable={false}
                  className="h-11 sm:h-10"
                />
              </div>

              {/* Skema Pencairan Cards */}
              <div className="space-y-2">
                <Label>
                  Skema Pencairan <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {SCHEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = newProposal.jenis === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewProposal({ ...newProposal, jenis: opt.value })}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'border-primary bg-primary/[0.05] ring-2 ring-primary/15'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-foreground">{opt.title}</span>
                            {active && <Check className="size-4 shrink-0 text-primary" />}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 02: Anggaran & Berkas Proposal */}
          <Card className="overflow-hidden">
            <div className="flex items-start gap-3 border-b border-border bg-muted/25 px-4 py-3.5 sm:px-6 sm:py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground font-mono">
                02
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Anggaran & Berkas Proposal
                </h2>
                <p className="text-xs text-muted-foreground">
                  Masukkan total kebutuhan dana dan unggah dokumen proposal resmi.
                </p>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Total Dana dengan Prefix Rp */}
              <div className="space-y-2 sm:max-w-sm">
                <Label htmlFor="dana-diajukan">
                  Total Dana Diajukan <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-stretch rounded-md border border-input bg-card shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30 transition-[color,box-shadow]">
                  <span className="flex items-center border-r border-input bg-muted/60 px-3.5 font-mono text-sm font-bold text-muted-foreground select-none rounded-l-md">
                    Rp
                  </span>
                  <input
                    id="dana-diajukan"
                    type="text"
                    inputMode="numeric"
                    value={formattedNominal}
                    onChange={(e) =>
                      setNewProposal({
                        ...newProposal,
                        dana_diajukan: e.target.value.replace(/[^0-9]/g, ''),
                      })
                    }
                    placeholder="5.000.000"
                    className="h-11 sm:h-10 w-full min-w-0 bg-transparent px-3.5 text-base font-bold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70 tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ketik angka saja, pemisah ribuan akan diformat otomatis.
                </p>
              </div>

              {/* Dedicated Full-Width File Dropzone */}
              <div className="space-y-2">
                <Label htmlFor="new-proposal-file">
                  Berkas Proposal <span className="text-destructive">*</span>
                </Label>

                {!newProposal.file ? (
                  <label
                    htmlFor="new-proposal-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/25 px-4 py-7 text-center transition-colors hover:border-primary/55 hover:bg-primary/[0.04]"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Klik untuk memilih berkas proposal
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Mendukung format PDF, DOC, atau DOCX dengan ukuran maksimal 10MB
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-foreground">
                          {newProposal.file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(newProposal.file.size / 1024 / 1024).toFixed(2)} MB · Siap diunggah
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 flex-1 bg-card sm:flex-none"
                        onClick={() => document.getElementById('new-proposal-file')?.click()}
                      >
                        <Paperclip className="size-3.5" />
                        Ganti
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          setNewProposal({ ...newProposal, file: null });
                          const el = document.getElementById('new-proposal-file');
                          if (el) el.value = '';
                        }}
                        aria-label="Hapus file terpilih"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  id="new-proposal-file"
                  className="sr-only up-upload-input"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewProposal({ ...newProposal, file: e.target.files[0] });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 03: Rekening & Catatan Tambahan */}
          <Card className="overflow-hidden">
            <div className="flex items-start gap-3 border-b border-border bg-muted/25 px-4 py-3.5 sm:px-6 sm:py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground font-mono">
                03
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground sm:text-base">
                  Rekening Pencairan & Catatan (Opsional)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lengkapi tujuan transfer dana dan catatan tambahan untuk tim verifikator.
                </p>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Collapsible Bank Info */}
              <div className="rounded-xl border border-border bg-muted/25 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBankInfo(!showBankInfo)}
                  aria-expanded={showBankInfo}
                  className="flex w-full min-h-12 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Landmark className="size-4 text-primary" />
                    <span>Informasi Rekening Bank Tujuan</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform duration-200',
                      showBankInfo && 'rotate-180'
                    )}
                  />
                </button>

                {showBankInfo && (
                  <div className="space-y-4 border-t border-border bg-card px-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama-bank">Nama Bank</Label>
                      <Select
                        value={selectedBank || 'NONE'}
                        onValueChange={(val) => {
                          if (val === 'NONE') {
                            setSelectedBank('');
                            setNewProposal({ ...newProposal, nama_bank: '' });
                            return;
                          }
                          setSelectedBank(val);
                          setNewProposal({
                            ...newProposal,
                            nama_bank: val === 'Lainnya' ? '' : val,
                          });
                        }}
                      >
                        <SelectTrigger id="nama-bank" className="h-11 sm:h-10">
                          <SelectValue placeholder="Pilih Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Pilih Bank</SelectItem>
                          <SelectItem value="BCA">BCA (Bank Central Asia)</SelectItem>
                          <SelectItem value="Mandiri">Mandiri</SelectItem>
                          <SelectItem value="BNI">BNI (Bank Negara Indonesia)</SelectItem>
                          <SelectItem value="BRI">BRI (Bank Rakyat Indonesia)</SelectItem>
                          <SelectItem value="BSI">BSI (Bank Syariah Indonesia)</SelectItem>
                          <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                          <SelectItem value="Lainnya">Lainnya (Tulis Manual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBank === 'Lainnya' && (
                      <div className="space-y-2">
                        <Label htmlFor="bank-lainnya" className="text-xs text-muted-foreground">
                          Masukkan Nama Bank Lainnya
                        </Label>
                        <Input
                          id="bank-lainnya"
                          className="h-11 sm:h-10"
                          value={newProposal.nama_bank}
                          onChange={(e) =>
                            setNewProposal({ ...newProposal, nama_bank: e.target.value })
                          }
                          placeholder="Masukkan nama bank Anda"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nomor-rekening">Nomor Rekening</Label>
                        <Input
                          id="nomor-rekening"
                          value={newProposal.nomor_rekening}
                          onChange={(e) =>
                            setNewProposal({ ...newProposal, nomor_rekening: e.target.value })
                          }
                          placeholder="Nomor rekening tujuan"
                          className="h-11 sm:h-10 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="atas-nama">Atas Nama</Label>
                        <Input
                          id="atas-nama"
                          className="h-11 sm:h-10"
                          value={newProposal.atas_nama || ''}
                          onChange={(e) =>
                            setNewProposal({ ...newProposal, atas_nama: e.target.value })
                          }
                          placeholder="Nama pemilik rekening"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="catatan-proposal">Catatan / Rincian Tambahan</Label>
                <Textarea
                  id="catatan-proposal"
                  rows={3}
                  value={newProposal.catatan}
                  onChange={(e) => setNewProposal({ ...newProposal, catatan: e.target.value })}
                  placeholder="Tuliskan catatan khusus jika ada informasi tambahan terkait pengajuan dana..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Mobile Action Bar (shown only below lg) */}
          <Card className="lg:hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Estimasi Dana</span>
                <span className="text-base font-extrabold text-primary tabular-nums">
                  {formattedNominal ? `Rp ${formattedNominal}` : 'Belum diisi'}
                </span>
              </div>
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-11 sm:flex-1"
                  onClick={() => setPortalTab('home')}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  className="w-full min-h-11 sm:flex-[2]"
                  disabled={isDisabled}
                  onClick={handleCreateProposal}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Kirim Pengajuan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Summary Rail (Desktop lg+) */}
        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
          <Card className="overflow-hidden border-border shadow-xs">
            <div className="border-b border-border bg-muted/30 px-5 py-4">
              <h3 className="text-sm font-bold text-foreground">Ringkasan Pengajuan</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Periksa kembali kelengkapan data sebelum mengirim proposal.
              </p>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Live preview fields */}
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Kegiatan
                  </div>
                  <div className="mt-0.5 font-semibold text-foreground leading-snug">
                    {newProposal.kegiatan?.trim() || (
                      <span className="font-normal italic text-muted-foreground">Belum diisi</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Tanggal
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {newProposal.tgl_pelaksanaan || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Skema
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-foreground">
                      {newProposal.jenis}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/[0.04] px-3.5 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Total Dana Diajukan
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold text-primary tabular-nums">
                    {formattedNominal ? `Rp ${formattedNominal}` : 'Rp 0'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Required Completeness Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">Kelengkapan Wajib</span>
                  <span className="text-primary tabular-nums">
                    {completedCount}/{checklist.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                      {item.done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground/45" />
                      )}
                      <span
                        className={cn(
                          item.done ? 'font-medium text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Desktop Submit Actions */}
              <div className="space-y-2">
                <Button
                  type="button"
                  className="h-11 w-full font-semibold"
                  disabled={isDisabled}
                  onClick={handleCreateProposal}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim Pengajuan...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Kirim Pengajuan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full"
                  onClick={() => setPortalTab('home')}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};
