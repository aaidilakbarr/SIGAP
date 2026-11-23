import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Landmark,
  Loader2,
  Paperclip,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const POPULAR_BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga'];

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

  const isDisabled =
    submitting ||
    !newProposal.kegiatan ||
    !newProposal.tgl_pelaksanaan ||
    !newProposal.dana_diajukan ||
    !newProposal.file;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30 p-4 sm:p-5">
        <CardTitle className="text-base sm:text-lg">Formulir Pengajuan Proposal</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Lengkapi rincian kegiatan, estimasi anggaran, dan berkas proposal Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Nama Kegiatan */}
        <div className="space-y-2">
          <Label htmlFor="kegiatan">
            Nama / Judul Kegiatan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="kegiatan"
            className="h-11 sm:h-9"
            value={newProposal.kegiatan}
            onChange={(e) => setNewProposal({ ...newProposal, kegiatan: e.target.value })}
            placeholder="Contoh: Seminar Nasional Mahasiswa Berprestasi"
          />
        </div>

        {/* Tanggal & Skema */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skema-pencairan">
              Skema Pencairan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={newProposal.jenis}
              onValueChange={(val) => setNewProposal({ ...newProposal, jenis: val })}
            >
              <SelectTrigger id="skema-pencairan" className="h-11 sm:h-9">
                <SelectValue placeholder="Pilih skema pencairan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Advance">Advance Payment (Dana Di Depan)</SelectItem>
                <SelectItem value="Reimburse">Reimbursement (Diganti Kemudian)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dana & File */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dana-diajukan">
              Total Dana Diajukan (Rp) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dana-diajukan"
              type="text"
              inputMode="numeric"
              value={
                newProposal.dana_diajukan
                  ? formatRupiah(newProposal.dana_diajukan.toString().replace(/\./g, ''))
                  : ''
              }
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  dana_diajukan: e.target.value.replace(/[^0-9]/g, ''),
                })
              }
              placeholder="Contoh: 5.000.000"
              className="h-11 sm:h-9 tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-proposal-file">
              File Proposal (PDF, DOC, DOCX) <span className="text-destructive">*</span>
            </Label>

            {!newProposal.file ? (
              <label
                htmlFor="new-proposal-file"
                className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 px-3.5 py-2 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <Paperclip className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">Pilih berkas proposal</div>
                  <div className="text-[11px] text-muted-foreground">PDF, DOC, DOCX, maks. 10MB</div>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-foreground">
                      {newProposal.file.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {(newProposal.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        </div>

        {/* Collapsible Bank Info */}
        <div className="rounded-xl border border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setShowBankInfo(!showBankInfo)}
            aria-expanded={showBankInfo}
            className="flex w-full min-h-12 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              Informasi Rekening Bank (Opsional)
            </span>
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                showBankInfo && 'rotate-180'
              )}
            />
          </button>

          {showBankInfo && (
            <div className="space-y-4 border-t border-border px-4 py-4">
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
                  <SelectTrigger id="nama-bank">
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
                    value={newProposal.nama_bank}
                    onChange={(e) => setNewProposal({ ...newProposal, nama_bank: e.target.value })}
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
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="atas-nama">Atas Nama</Label>
                  <Input
                    id="atas-nama"
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
            placeholder="Tuliskan catatan khusus jika ada keterkaitan dengan pencairan dana..."
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col-reverse gap-2.5 border-t border-border bg-muted/30 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-11 sm:w-auto"
          onClick={() => setPortalTab('home')}
        >
          <ArrowLeft className="size-4" />
          Batal
        </Button>
        <Button
          type="button"
          className="w-full min-h-11 sm:w-auto"
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
      </CardFooter>
    </Card>
  );
};
