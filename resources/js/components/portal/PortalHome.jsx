import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Tag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EmptyState, Pagination, StatusBadge } from '../shared/SharedComponents';

export const PortalHome = ({
  user,
  loading,
  filteredProposals,
  searchQuery,
  setSearchQuery,
  totalCount,
  actionCount,
  doneCount,
  setPortalTab,
  setSelectedProposal,
  currentPage,
  totalPages,
  fetchProposals,
  getCardBorderAccent,
  formatRupiah,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Greeting Banner */}
      <div className="rounded-2xl bg-sidebar px-4 py-5 text-white shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <div className="text-xs font-medium text-white/75">Selamat datang kembali,</div>
            <div className="mt-0.5 text-xl font-extrabold tracking-tight sm:mt-1 sm:text-2xl">
              {user?.name || 'Pemohon'}
            </div>
            <p className="mt-1 text-xs text-white/85 leading-relaxed sm:mt-1.5 sm:text-sm">
              Pantau status pengajuan proposal Anda secara langsung di sini.
              {actionCount > 0 && (
                <strong className="ml-1 font-semibold text-amber-200">
                  Ada {actionCount} proposal yang memerlukan tindakan Anda.
                </strong>
              )}
            </p>
          </div>
          <Button
            onClick={() => setPortalTab('new')}
            className="h-11 w-full shrink-0 bg-white text-[#144518] hover:bg-white/90 font-bold sm:w-auto sm:self-center"
          >
            <Plus className="size-4" />
            Ajukan Proposal
          </Button>
        </div>
      </div>

      {/* Stat Cards: compact 3-col on mobile, spacious on sm+ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card>
          <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="order-2 sm:order-1 min-w-0">
              <div className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                Total
              </div>
              <div className="mt-0.5 text-xl font-extrabold text-foreground tabular-nums sm:mt-1 sm:text-2xl">
                {totalCount}
              </div>
            </div>
            <div className="order-1 sm:order-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 sm:size-10">
              <FileText className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="order-2 sm:order-1 min-w-0">
              <div className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                Tindakan
              </div>
              <div className="mt-0.5 text-xl font-extrabold text-amber-700 tabular-nums sm:mt-1 sm:text-2xl">
                {actionCount}
              </div>
            </div>
            <div className="order-1 sm:order-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 sm:size-10">
              <AlertCircle className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="order-2 sm:order-1 min-w-0">
              <div className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                Selesai
              </div>
              <div className="mt-0.5 text-xl font-extrabold text-primary tabular-nums sm:mt-1 sm:text-2xl">
                {doneCount}
              </div>
            </div>
            <div className="order-1 sm:order-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 sm:size-10">
              <CheckCircle2 className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama kegiatan, kode tiket, atau skema..."
          className="h-11 pl-10 bg-card"
          aria-label="Cari proposal saya"
        />
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Daftar Proposal Saya</h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {searchQuery
            ? `${filteredProposals.length} dari ${totalCount} data`
            : `${totalCount} proposal`}
        </span>
      </div>

      {/* Proposal cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <Card key={idx}>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card>
          <EmptyState
            icon={searchQuery ? Search : FolderOpen}
            title={searchQuery ? 'Proposal tidak ditemukan' : 'Belum ada proposal diajukan'}
            description={
              searchQuery
                ? `Tidak ada proposal yang cocok dengan kata kunci "${searchQuery}".`
                : 'Klik tombol di bawah untuk mulai membuat pengajuan proposal pertama Anda.'
            }
            action={
              !searchQuery && (
                <Button onClick={() => setPortalTab('new')}>
                  <Plus className="size-4" />
                  Ajukan Proposal Baru
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProposals.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedProposal(p);
                setPortalTab('detail');
              }}
              className={cn(
                'w-full text-left rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5',
                getCardBorderAccent(p.status)
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-primary">{p.kode_tiket}</span>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-2 text-base font-bold text-foreground leading-snug">
                {p.kegiatan}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {p.tgl_pelaksanaan || '-'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="size-3.5" />
                  {p.jenis}
                </span>
                {p.revisi_deadline && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 font-semibold text-red-700 border border-red-200">
                    <AlertCircle className="size-3" />
                    Batas: {new Date(p.revisi_deadline).toLocaleDateString('id-ID')}
                  </span>
                )}
                {p.status === 'Menunggu Evidence' && !p.revisi_deadline && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 border border-amber-200">
                    <AlertCircle className="size-3" />
                    Perlu Upload LPJ
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">Dana Diajukan</div>
                  <div className="text-sm font-extrabold text-foreground tabular-nums">
                    Rp {formatRupiah(p.dana_diajukan)}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Lihat Detail
                  <ChevronRight className="size-4" />
                </span>
              </div>
            </button>
          ))}

          {totalPages > 1 && (
            <Card className="overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onFetch={fetchProposals}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
