import React, { useMemo, useState } from 'react';
import {
  Activity,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buildFilePreviewUrl, formatRupiah } from '../shared/utils';
import {
  EmptyState,
  Pagination,
  SearchBar,
  StatusBadge,
  TableSkeleton,
} from '../shared/SharedComponents';

const QUICK_STATUS_PILLS = [
  { value: '', label: 'Semua' },
  { value: 'Dalam Antrean', label: 'Antrean' },
  { value: 'Dalam Review', label: 'Review' },
  { value: 'Revisi Proposal', label: 'Revisi' },
  { value: 'Dana Cair', label: 'Dana Cair' },
  { value: 'Menunggu Verif', label: 'Verif LPJ' },
  { value: 'Selesai', label: 'Selesai' },
];

function QuickStatusBar({ filterStatus, setFilterStatus }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-card px-4 py-2.5 sm:px-5">
      {QUICK_STATUS_PILLS.map((pill) => {
        const active = filterStatus === pill.value;
        return (
          <button
            key={pill.label}
            type="button"
            onClick={() => setFilterStatus(pill.value)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/35 hover:text-foreground'
            )}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

function getLogActionStyle(action = '') {
  const lower = String(action).toLowerCase();
  if (lower.includes('hapus') || lower.includes('delete') || lower.includes('gagal')) {
    return 'bg-red-50 text-red-800 border-red-200';
  }
  if (lower.includes('berita') || lower.includes('selesai') || lower.includes('verif')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  if (lower.includes('status') || lower.includes('update') || lower.includes('revisi')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (lower.includes('upload') || lower.includes('buat') || lower.includes('ajukan') || lower.includes('create')) {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function ProposalsPage({
  proposals,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  fetchProposals,
  fetchStats,
  handleExportCSV,
  setSelectedProposal,
  setActiveModal,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-2 sm:block">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground sm:text-base">Daftar Proposal</h2>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground tabular-nums">
                {totalItems}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Kelola status review, revisi, dan pencairan seluruh proposal masuk.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            size="sm"
            className="min-h-10 sm:min-h-8"
            onClick={() => handleExportCSV('daftar_proposal')}
          >
            <Download className="size-3.5" />
            Ekspor CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 sm:min-h-8"
            onClick={() => {
              fetchProposals(currentPage);
              fetchStats();
            }}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <QuickStatusBar filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDateFrom={filterDateFrom}
        setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo}
        setFilterDateTo={setFilterDateTo}
        totalItems={totalItems}
        proposalsLength={proposals.length}
        showStatus={true}
        showDate={true}
      />

      {loading ? (
        <TableSkeleton columns={7} rows={6} />
      ) : proposals.length === 0 ? (
        <EmptyState
          title="Tidak ada proposal ditemukan"
          description="Coba ubah kata kunci pencarian atau reset filter untuk melihat seluruh data."
        />
      ) : (
        <>
          {/* Mobile Structured Cards */}
          <div className="divide-y divide-border md:hidden">
            {proposals.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    {p.kode_tiket}
                  </span>
                  <StatusBadge status={p.status} />
                </div>

                <div className="text-[15px] font-bold text-foreground leading-snug">
                  {p.kegiatan}
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/45 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Pemohon
                    </div>
                    <div className="mt-0.5 truncate font-semibold text-foreground">
                      {p.user?.name || '-'}
                    </div>
                  </div>
                  <div className="min-w-0 border-l border-border pl-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Tanggal & Skema
                    </div>
                    <div className="mt-0.5 truncate font-semibold text-foreground">
                      {p.tgl_pelaksanaan} · {p.jenis}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-muted-foreground">Dana Diajukan</span>
                  <span className="text-sm font-extrabold text-foreground tabular-nums">
                    Rp {formatRupiah(p.dana_diajukan)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-10"
                    onClick={() => {
                      setSelectedProposal(p);
                      setActiveModal('decision');
                    }}
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Ubah Status
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-h-10"
                    onClick={() => {
                      setSelectedProposal(p);
                      setActiveModal('detail');
                    }}
                  >
                    <Eye className="size-3.5" />
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Kegiatan</TableHead>
                  <TableHead>Dana (Rp)</TableHead>
                  <TableHead>Tgl Pelaksanaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        {p.kode_tiket}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground whitespace-nowrap">
                        {p.user?.name || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.user?.instansi || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate font-medium text-foreground" title={p.kegiatan}>
                        {p.kegiatan}
                      </div>
                      <div className="mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {p.jenis}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground whitespace-nowrap tabular-nums">
                      Rp {formatRupiah(p.dana_diajukan)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {p.tgl_pelaksanaan}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(p);
                            setActiveModal('decision');
                          }}
                        >
                          <SlidersHorizontal className="size-3.5" />
                          Ubah Status
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(p);
                            setActiveModal('detail');
                          }}
                        >
                          <Eye className="size-3.5" />
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
    </Card>
  );
}

export function VerificationPage({
  proposals,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  setSearchQuery,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  fetchProposals,
  fetchStats,
  handleUpdateStatus,
  setSelectedProposal,
  setActiveModal,
}) {
  const [confirmAction, setConfirmAction] = useState(null);

  const onViewDetail = (p) => {
    setSelectedProposal(p);
    setActiveModal('detail');
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    handleUpdateStatus(confirmAction.proposal.id, confirmAction.nextStatus);
    setConfirmAction(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                Verifikasi Evidence
              </h2>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-bold tabular-nums',
                  totalItems > 0
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {totalItems} antrean
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Periksa kelengkapan dokumen LPJ sebelum menyetujui penyelesaian proposal.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full min-h-10 sm:w-auto sm:min-h-8"
            onClick={() => {
              fetchProposals(currentPage);
              fetchStats();
            }}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus=""
          setFilterStatus={() => {}}
          filterDateFrom={filterDateFrom}
          setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo}
          setFilterDateTo={setFilterDateTo}
          totalItems={totalItems}
          proposalsLength={proposals.length}
          showStatus={false}
          showDate={true}
        />

        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="Tidak ada dokumen menunggu verifikasi"
            description="Semua evidence LPJ yang masuk telah selesai diverifikasi."
          />
        ) : (
          <>
            {/* Mobile Structured Cards */}
            <div className="divide-y divide-border md:hidden">
              {proposals.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetail(p)}
                      className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary cursor-pointer"
                    >
                      {p.kode_tiket}
                    </button>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="text-[15px] font-bold text-foreground leading-snug">
                    {p.kegiatan}
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/45 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Pemohon
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-foreground">
                        {p.user?.name || '-'}
                      </div>
                    </div>
                    <div className="min-w-0 border-l border-border pl-2.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Dana
                      </div>
                      <div className="mt-0.5 truncate font-bold text-primary tabular-nums">
                        Rp {formatRupiah(p.dana_diajukan)}
                      </div>
                    </div>
                  </div>

                  <div>
                    {p.evidence_dokumen ? (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full min-h-10 justify-center border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100"
                      >
                        <a
                          href={buildFilePreviewUrl(p.evidence_dokumen, `LPJ Evidence - ${p.kode_tiket}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="size-3.5" />
                          Buka Dokumen LPJ / Evidence
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs italic text-muted-foreground">
                        Belum upload dokumen evidence
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    <Button
                      size="sm"
                      className="min-h-10"
                      onClick={() =>
                        setConfirmAction({
                          proposal: p,
                          nextStatus: 'Selesai',
                          type: 'approve',
                        })
                      }
                    >
                      <Check className="size-3.5" />
                      Acc
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                      onClick={() =>
                        setConfirmAction({
                          proposal: p,
                          nextStatus: 'Menunggu Evidence',
                          type: 'reject',
                        })
                      }
                    >
                      <X className="size-3.5" />
                      Tolak
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="min-h-10"
                      onClick={() => onViewDetail(p)}
                    >
                      <Eye className="size-3.5" />
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Kegiatan</TableHead>
                    <TableHead>Dana (Rp)</TableHead>
                    <TableHead>Dokumen Evidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onViewDetail(p)}
                          className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary hover:bg-primary/15 cursor-pointer"
                          title="Klik untuk lihat detail proposal"
                        >
                          {p.kode_tiket}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground whitespace-nowrap">
                          {p.user?.name || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.user?.instansi || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium" title={p.kegiatan}>
                        {p.kegiatan}
                      </TableCell>
                      <TableCell className="font-bold whitespace-nowrap tabular-nums">
                        Rp {formatRupiah(p.dana_diajukan)}
                      </TableCell>
                      <TableCell>
                        {p.evidence_dokumen ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100"
                          >
                            <a
                              href={buildFilePreviewUrl(p.evidence_dokumen, `LPJ Evidence - ${p.kode_tiket}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="size-3.5" />
                              Buka LPJ
                              <ExternalLink className="size-3" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Belum upload</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() =>
                              setConfirmAction({
                                proposal: p,
                                nextStatus: 'Selesai',
                                type: 'approve',
                              })
                            }
                            title="Verifikasi dan setujui"
                          >
                            <Check className="size-3.5" />
                            Acc
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                            onClick={() =>
                              setConfirmAction({
                                proposal: p,
                                nextStatus: 'Menunggu Evidence',
                                type: 'reject',
                              })
                            }
                            title="Tolak atau minta revisi evidence"
                          >
                            <X className="size-3.5" />
                            Tolak
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetail(p)}
                            title="Lihat detail proposal"
                          >
                            <Eye className="size-3.5" />
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </Card>

      {/* Confirmation Dialog before Acc / Tolak */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'approve'
                ? 'Setujui Verifikasi Evidence?'
                : 'Tolak Dokumen Evidence?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'approve'
                ? `Proposal ${confirmAction?.proposal?.kode_tiket} (${confirmAction?.proposal?.kegiatan}) akan diubah statusnya menjadi Selesai dan siap diterbitkan Berita Acara.`
                : `Proposal ${confirmAction?.proposal?.kode_tiket} akan dikembalikan ke status Menunggu Evidence agar pemohon mengunggah ulang dokumen LPJ.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction?.type === 'approve' ? 'default' : 'destructive'}
              onClick={executeConfirm}
            >
              {confirmAction?.type === 'approve' ? 'Ya, Setujui (Selesai)' : 'Ya, Kembalikan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MasterPage({
  proposals,
  loading,
  currentPage,
  totalPages,
  totalItems,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  fetchProposals,
  handleExportCSV,
  setSelectedProposal,
  setActiveModal,
}) {
  const pageDanaTotal = useMemo(
    () => proposals.reduce((sum, p) => sum + (Number(p.dana_diajukan) || 0), 0),
    [proposals]
  );
  const pageDoneCount = useMemo(
    () => proposals.filter((p) => p.status === 'Selesai').length,
    [proposals]
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* SuperAdmin Archive Summary Strip (varied 5 + 4 + 3) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
        <Card className="col-span-2 sm:col-span-5">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-muted-foreground">
                Akumulasi Dana (Halaman Ini)
              </div>
              <div className="mt-1 truncate text-xl font-extrabold text-primary tabular-nums sm:text-2xl">
                Rp {formatRupiah(pageDanaTotal)}
              </div>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Banknote className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-4">
          <CardContent className="flex items-center justify-between gap-2 p-4">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-muted-foreground">
                Total Arsip
              </div>
              <div className="mt-1 text-xl font-extrabold text-foreground tabular-nums sm:text-2xl">
                {totalItems}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Database className="size-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-3 border-emerald-200/80 bg-emerald-50/50">
          <CardContent className="flex items-center justify-between gap-2 p-4">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-emerald-950">Selesai</div>
              <div className="mt-1 text-xl font-extrabold text-primary tabular-nums sm:text-2xl">
                {pageDoneCount}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-primary">
              <CheckCircle2 className="size-4.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground sm:text-base">Master Database</h2>
            <p className="text-xs text-muted-foreground">
              Arsip menyeluruh proposal, bukti pencairan, dan dokumen pertanggungjawaban.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full min-h-10 sm:w-auto sm:min-h-8"
            onClick={() => handleExportCSV('master_database')}
          >
            <Download className="size-3.5" />
            Ekspor CSV
          </Button>
        </div>

        <QuickStatusBar filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDateFrom={filterDateFrom}
          setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo}
          setFilterDateTo={setFilterDateTo}
          totalItems={totalItems}
          proposalsLength={proposals.length}
          showStatus={true}
          showDate={true}
        />

        {loading ? (
          <TableSkeleton columns={6} rows={6} />
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={Database}
            title="Data arsip tidak ditemukan"
            description="Belum ada rekaman yang sesuai dengan filter pencarian Anda."
          />
        ) : (
          <>
            {/* Mobile Structured Cards */}
            <div className="divide-y divide-border md:hidden">
              {proposals.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {p.kode_tiket}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-[15px] font-bold text-foreground leading-snug">
                    {p.kegiatan}
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/45 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Pemohon
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-foreground">
                        {p.user?.name || '-'}
                      </div>
                    </div>
                    <div className="min-w-0 border-l border-border pl-2.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Tgl Pelaksanaan
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-foreground">
                        {p.tgl_pelaksanaan || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <div>
                      <div className="text-[10px] font-medium text-muted-foreground">Dana</div>
                      <div className="text-sm font-extrabold text-foreground tabular-nums">
                        Rp {formatRupiah(p.dana_diajukan)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-10"
                      onClick={() => {
                        setSelectedProposal(p);
                        setActiveModal('detail');
                      }}
                    >
                      <Eye className="size-3.5" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Kegiatan</TableHead>
                    <TableHead>Tgl Pelaksanaan</TableHead>
                    <TableHead>Dana (Rp)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                          {p.kode_tiket}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground whitespace-nowrap">
                          {p.user?.name || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.user?.instansi || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm truncate font-medium" title={p.kegiatan}>
                        {p.kegiatan}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {p.tgl_pelaksanaan || '-'}
                      </TableCell>
                      <TableCell className="font-bold whitespace-nowrap tabular-nums">
                        Rp {formatRupiah(p.dana_diajukan)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(p);
                            setActiveModal('detail');
                          }}
                        >
                          <Eye className="size-3.5" />
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
      </Card>
    </div>
  );
}

export function LogsPage({ logs, loading, fetchLogs, currentPage, totalPages, fetchProposals }) {
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      `${log.name || ''} ${log.role || ''} ${log.action || ''} ${log.description || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [logs, logSearch]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground sm:text-base">Sistem Activity Log</h2>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground tabular-nums">
              {filteredLogs.length} entri
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Riwayat perubahan status, unggahan dokumen, dan penerbitan berita acara.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full min-h-10 sm:w-auto sm:min-h-8"
          onClick={() => fetchLogs(currentPage)}
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Quick search over current page logs */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Filter aktor, jenis aksi, atau deskripsi..."
            className="h-11 sm:h-9 pl-9 pr-9 bg-card"
            aria-label="Filter activity log"
          />
          {logSearch && (
            <button
              type="button"
              onClick={() => setLogSearch('')}
              aria-label="Hapus filter log"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={4} rows={6} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={logSearch ? 'Log tidak ditemukan' : 'Belum ada log aktivitas'}
          description={
            logSearch
              ? `Tidak ada aktivitas pada halaman ini yang cocok dengan "${logSearch}".`
              : 'Setiap aktivitas pengguna dan admin akan tercatat otomatis di sini.'
          }
        />
      ) : (
        <>
          {/* Mobile Timeline Cards */}
          <div className="divide-y divide-border md:hidden">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={cn('font-mono text-[11px]', getLogActionStyle(log.action))}
                  >
                    {log.action}
                  </Badge>
                  <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {log.name || 'System'}{' '}
                  <span className="font-normal text-muted-foreground">({log.role || '-'})</span>
                </div>
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-foreground/85 leading-relaxed">
                  {log.description}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Sistem / Aktor</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Deskripsi Lengkap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap tabular-nums">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{log.name || 'System'}</div>
                      <div className="text-xs text-muted-foreground">{log.role || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('font-mono text-[11px]', getLogActionStyle(log.action))}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/85 leading-relaxed">
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
    </Card>
  );
}
