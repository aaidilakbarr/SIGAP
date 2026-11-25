import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EmptyState, Pagination, StatusBadge } from '../shared/SharedComponents';

const NEEDS_ACTION_STATUSES = ['Revisi Proposal', 'Menunggu Evidence'];

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
  formatRupiah,
}) => {
  const [quickFilter, setQuickFilter] = useState('all');

  const inProgressCount = Math.max(0, totalCount - doneCount - actionCount);
  const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const visibleProposals = useMemo(() => {
    if (quickFilter === 'action') {
      return filteredProposals.filter((p) => NEEDS_ACTION_STATUSES.includes(p.status));
    }
    if (quickFilter === 'done') {
      return filteredProposals.filter((p) => p.status === 'Selesai');
    }
    if (quickFilter === 'process') {
      return filteredProposals.filter(
        (p) => !NEEDS_ACTION_STATUSES.includes(p.status) && p.status !== 'Selesai'
      );
    }
    return filteredProposals;
  }, [filteredProposals, quickFilter]);

  const filterTabs = [
    { key: 'all', label: 'Semua', count: filteredProposals.length },
    {
      key: 'action',
      label: 'Perlu Tindakan',
      count: filteredProposals.filter((p) => NEEDS_ACTION_STATUSES.includes(p.status)).length,
    },
    {
      key: 'process',
      label: 'Diproses',
      count: filteredProposals.filter(
        (p) => !NEEDS_ACTION_STATUSES.includes(p.status) && p.status !== 'Selesai'
      ).length,
    },
    {
      key: 'done',
      label: 'Selesai',
      count: filteredProposals.filter((p) => p.status === 'Selesai').length,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting Banner */}
      <div className="rounded-2xl bg-sidebar px-4 py-5 text-white shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium text-white/75">Selamat datang kembali,</div>
            <div className="mt-0.5 text-xl font-extrabold tracking-tight sm:mt-1 sm:text-2xl">
              {user?.name || 'Pemohon'}
            </div>
            <p className="mt-1.5 text-xs text-white/85 leading-relaxed sm:text-sm">
              Pantau progres pengajuan proposal Anda secara langsung di sini.
              {actionCount > 0 && (
                <strong className="ml-1 font-semibold text-amber-200">
                  Ada {actionCount} proposal yang memerlukan tindakan Anda.
                </strong>
              )}
            </p>
          </div>
          <Button
            onClick={() => setPortalTab('new')}
            className="h-11 w-full shrink-0 bg-white text-[#144518] hover:bg-white/90 font-bold sm:w-auto sm:px-5"
          >
            <Plus className="size-4" />
            Ajukan Proposal
          </Button>
        </div>
      </div>

      {/* 3 Varied KPI Summary Cards (1+2 on mobile, 5+4+3 asymmetric on desktop) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
        {/* Card 1: Primary Overview + Real Completion Bar */}
        <Card className="col-span-2 sm:col-span-5 overflow-hidden border-border">
          <CardContent className="flex h-full flex-col justify-between p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <FileText className="size-3.5 text-primary" />
                  Total Pengajuan
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {totalCount}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">proposal</span>
                </div>
              </div>
              <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground tabular-nums">
                {inProgressCount} berjalan
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Progres penyelesaian</span>
                <span className="font-bold text-primary tabular-nums">{donePercent}% tuntas</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={donePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Persentase proposal selesai"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${donePercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Action Spotlight (Interactive filter trigger) */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'action' ? 'all' : 'action')}
          className={cn(
            'col-span-1 sm:col-span-4 text-left rounded-xl border p-4 sm:p-5 shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col justify-between',
            actionCount > 0
              ? 'border-amber-200 bg-amber-50/75 hover:border-amber-300 hover:bg-amber-50'
              : 'border-border bg-card hover:border-primary/30',
            quickFilter === 'action' && 'ring-2 ring-amber-500/40'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-amber-900/90">Perlu Tindakan</span>
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                actionCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'
              )}
            >
              <AlertCircle className="size-4" />
            </div>
          </div>

          <div className="mt-2">
            <div
              className={cn(
                'text-2xl font-extrabold tabular-nums sm:text-3xl',
                actionCount > 0 ? 'text-amber-800' : 'text-foreground'
              )}
            >
              {actionCount}
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] leading-snug">
              <span className={actionCount > 0 ? 'font-medium text-amber-900/80' : 'text-muted-foreground'}>
                {actionCount > 0 ? 'Revisi atau unggah LPJ' : 'Tidak ada tugas mendesak'}
              </span>
              {actionCount > 0 && (
                <ArrowUpRight className="size-3.5 shrink-0 text-amber-800" />
              )}
            </div>
          </div>
        </button>

        {/* Card 3: Completed Milestone (Interactive filter trigger) */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'done' ? 'all' : 'done')}
          className={cn(
            'col-span-1 sm:col-span-3 text-left rounded-xl border border-emerald-200/85 bg-emerald-50/55 p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50/90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col justify-between',
            quickFilter === 'done' && 'ring-2 ring-primary/35'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-900">Selesai</span>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-primary">
              <CheckCircle2 className="size-4" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-extrabold text-primary tabular-nums sm:text-3xl">
              {doneCount}
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-emerald-900/80 leading-snug">
              {doneCount > 0 ? 'Terverifikasi & tuntas' : 'Belum ada yang selesai'}
            </div>
          </div>
        </button>
      </div>

      {/* Proposal List Header + Search + Quick Filter Pills */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">Daftar Proposal Saya</h2>
            <p className="text-xs text-muted-foreground">
              Pilih kartu proposal untuk melihat linimasa proses dan dokumen terkait.
            </p>
          </div>
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground tabular-nums">
            {visibleProposals.length} dari {totalCount} proposal
          </span>
        </div>

        {/* Search + Filter Chips Toolbar */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kegiatan, kode tiket, atau skema..."
              className="h-11 sm:h-10 pl-10 pr-9 bg-card"
              aria-label="Cari proposal saya"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {filterTabs.map((tab) => {
              const active = quickFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setQuickFilter(tab.key)}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                      active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Proposal List Cards (Enhanced Readability) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <Card key={idx}>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visibleProposals.length === 0 ? (
        <Card>
          <EmptyState
            icon={searchQuery || quickFilter !== 'all' ? Search : FolderOpen}
            title={
              searchQuery || quickFilter !== 'all'
                ? 'Tidak ada proposal pada filter ini'
                : 'Belum ada proposal diajukan'
            }
            description={
              searchQuery
                ? `Tidak ada proposal yang cocok dengan kata kunci "${searchQuery}".`
                : quickFilter !== 'all'
                ? 'Pilih tab "Semua" untuk melihat seluruh pengajuan proposal Anda.'
                : 'Klik tombol di bawah untuk mulai membuat pengajuan proposal pertama Anda.'
            }
            action={
              quickFilter !== 'all' || searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuickFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Tampilkan Semua Proposal
                </Button>
              ) : (
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
          {visibleProposals.map((p) => {
            const needsAction = NEEDS_ACTION_STATUSES.includes(p.status);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProposal(p);
                  setPortalTab('detail');
                }}
                className={cn(
                  'group w-full text-left rounded-xl border bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/45 hover:shadow-sm active:scale-[0.995] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5',
                  needsAction ? 'border-amber-300/90 bg-amber-50/20' : 'border-border'
                )}
              >
                <div className="flex flex-col gap-3.5 md:grid md:grid-cols-12 md:items-center md:gap-5">
                  {/* Left primary content zone */}
                  <div className="min-w-0 space-y-2.5 md:col-span-8">
                    {/* Eyebrow row: ticket + status (mobile) / ticket + meta (desktop) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 md:justify-start">
                      <span className="inline-flex items-center rounded-md bg-primary/8 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        {p.kode_tiket}
                      </span>
                      <div className="md:hidden">
                        <StatusBadge status={p.status} />
                      </div>
                      <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
                        <Tag className="size-3.5" />
                        {p.jenis}
                      </span>
                      <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
                        <Calendar className="size-3.5" />
                        {p.tgl_pelaksanaan || '-'}
                      </span>
                    </div>

                    {/* Clear readable title */}
                    <h3 className="text-[15px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors sm:text-base">
                      {p.kegiatan}
                    </h3>

                    {/* Mobile structured 2-column metadata box */}
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/45 px-3 py-2 text-xs md:hidden">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Tanggal
                        </div>
                        <div className="mt-0.5 truncate font-semibold text-foreground">
                          {p.tgl_pelaksanaan || '-'}
                        </div>
                      </div>
                      <div className="min-w-0 border-l border-border pl-2.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Skema
                        </div>
                        <div className="mt-0.5 truncate font-semibold text-foreground">
                          {p.jenis}
                        </div>
                      </div>
                    </div>

                    {/* Dedicated inline callout strip ONLY when user action is needed */}
                    {p.revisi_deadline && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
                        <Clock className="size-3.5 shrink-0 text-red-600" />
                        <span>
                          Tenggat revisi:{' '}
                          {new Date(p.revisi_deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    {p.status === 'Menunggu Evidence' && !p.revisi_deadline && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                        <AlertCircle className="size-3.5 shrink-0 text-amber-700" />
                        <span>Segera unggah dokumen LPJ / evidence kegiatan.</span>
                      </div>
                    )}
                  </div>

                  {/* Right financial figure & action zone */}
                  <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 md:col-span-4 md:flex-col md:items-end md:justify-between md:border-t-0 md:border-l md:border-border/70 md:pt-0 md:pl-5">
                    <div className="hidden md:block">
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="md:text-right">
                      <div className="text-[11px] font-medium text-muted-foreground">
                        Dana Diajukan
                      </div>
                      <div className="mt-0.5 text-base font-extrabold text-foreground tabular-nums">
                        Rp {formatRupiah(p.dana_diajukan)}
                      </div>
                    </div>

                    <span className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground md:min-h-8 md:mt-1">
                      <span>Lihat Progres</span>
                      <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

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
