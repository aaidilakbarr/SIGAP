import React from 'react';
import {
  Calendar,
  Check,
  Download,
  Eye,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '../shared/utils';
import {
  EmptyState,
  Pagination,
  SearchBar,
  StatusBadge,
  TableSkeleton,
} from '../shared/SharedComponents';

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
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">Daftar Proposal</h2>
          <p className="text-xs text-muted-foreground">
            Kelola status review, revisi, dan pencairan seluruh proposal masuk.
          </p>
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
          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {proposals.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{p.kode_tiket}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm font-bold text-foreground leading-snug">{p.kegiatan}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{p.user?.name || '-'}</span>
                  <Badge variant="secondary" className="text-[11px]">
                    {p.jenis}
                  </Badge>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {p.tgl_pelaksanaan}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
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
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tgl Pelaksanaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {p.kode_tiket}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground whitespace-nowrap">
                      {p.user?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={p.kegiatan}>
                      {p.kegiatan}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.jenis}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {p.tgl_pelaksanaan}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
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
  const onViewDetail = (p) => {
    setSelectedProposal(p);
    setActiveModal('detail');
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">Verifikasi Evidence</h2>
          <p className="text-xs text-muted-foreground">
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
          title="Tidak ada dokumen menunggu verifikasi"
          description="Semua evidence LPJ yang masuk telah selesai diverifikasi."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {proposals.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewDetail(p)}
                    className="font-mono text-xs font-bold text-primary underline-offset-4 hover:underline cursor-pointer"
                  >
                    {p.kode_tiket}
                  </button>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm font-bold text-foreground leading-snug">{p.kegiatan}</div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground">{p.user?.name || '-'}</span>
                  <span className="font-extrabold text-primary tabular-nums">
                    Rp {formatRupiah(p.dana_diajukan)}
                  </span>
                </div>
                <div>
                  {p.evidence_dokumen ? (
                    <Button variant="outline" size="sm" asChild className="w-full min-h-10 justify-center">
                      <a
                        href={`/api/preview-file/${p.evidence_dokumen}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="size-3.5" />
                        Lihat Dokumen Evidence
                      </a>
                    </Button>
                  ) : (
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-center text-xs italic text-muted-foreground">
                      Belum upload dokumen evidence
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    size="sm"
                    className="min-h-10"
                    onClick={() => handleUpdateStatus(p.id, 'Selesai')}
                  >
                    <Check className="size-3.5" />
                    Acc
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-10 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleUpdateStatus(p.id, 'Menunggu Evidence')}
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
                        className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline cursor-pointer"
                        title="Klik untuk lihat detail proposal"
                      >
                        {p.kode_tiket}
                      </button>
                    </TableCell>
                    <TableCell className="font-semibold whitespace-nowrap">
                      {p.user?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={p.kegiatan}>
                      {p.kegiatan}
                    </TableCell>
                    <TableCell className="font-semibold whitespace-nowrap tabular-nums">
                      Rp {formatRupiah(p.dana_diajukan)}
                    </TableCell>
                    <TableCell>
                      {p.evidence_dokumen ? (
                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                          <a
                            href={`/api/preview-file/${p.evidence_dokumen}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="size-3.5" />
                            Lihat Dokumen
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
                          onClick={() => handleUpdateStatus(p.id, 'Selesai')}
                          title="Verifikasi dan setujui"
                        >
                          <Check className="size-3.5" />
                          Acc
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleUpdateStatus(p.id, 'Menunggu Evidence')}
                          title="Tolak atau minta revisi evidence"
                        >
                          <X className="size-3.5" />
                          Tolak
                        </Button>
                        <Button
                          variant="outline"
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
  return (
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
          title="Data arsip tidak ditemukan"
          description="Belum ada rekaman yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {proposals.map((p) => (
              <div key={p.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{p.kode_tiket}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm font-bold text-foreground leading-snug">{p.kegiatan}</div>
                <div className="text-xs font-medium text-muted-foreground">
                  Pemohon: <strong className="text-foreground">{p.user?.name || '-'}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-sm font-extrabold text-foreground tabular-nums">
                    Rp {formatRupiah(p.dana_diajukan)}
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
                  <TableHead>Dana (Rp)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {p.kode_tiket}
                    </TableCell>
                    <TableCell className="font-semibold whitespace-nowrap">
                      {p.user?.name || '-'}
                    </TableCell>
                    <TableCell className="max-w-sm truncate" title={p.kegiatan}>
                      {p.kegiatan}
                    </TableCell>
                    <TableCell className="font-semibold whitespace-nowrap tabular-nums">
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
  );
}

export function LogsPage({ logs, loading, fetchLogs, currentPage, totalPages, fetchProposals }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">Sistem Activity Log</h2>
          <p className="text-xs text-muted-foreground">
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

      {loading ? (
        <TableSkeleton columns={4} rows={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="Belum ada log aktivitas"
          description="Setiap aktivitas pengguna dan admin akan tercatat otomatis di sini."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {logs.map((log) => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">
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
                <p className="text-xs text-muted-foreground leading-relaxed">{log.description}</p>
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
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap tabular-nums">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{log.name || 'System'}</div>
                      <div className="text-xs text-muted-foreground">{log.role || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground leading-relaxed">
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
