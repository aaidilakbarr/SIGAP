import React from 'react';
import { ChevronLeft, ChevronRight, Search, RotateCcw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from './utils';

export function StatusBadge({ status, className }) {
  return (
    <Badge
      className={cn('font-bold px-2.5 py-0.5 text-xs', getStatusBadgeClass(status), className)}
    >
      {status}
    </Badge>
  );
}

export function Pagination({ currentPage, totalPages, onFetch }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span className="text-center text-xs font-medium text-muted-foreground sm:text-left">
        Halaman <strong className="text-foreground">{currentPage}</strong> dari{' '}
        <strong className="text-foreground">{totalPages}</strong>
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onFetch(currentPage - 1)}
          className="min-h-11 sm:min-h-9"
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onFetch(currentPage + 1)}
          className="min-h-11 sm:min-h-9"
        >
          Selanjutnya
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  totalItems,
  proposalsLength,
  showStatus = true,
  showDate = true,
}) {
  const hasFilter = Boolean(searchQuery || filterStatus || filterDateFrom || filterDateTo);

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="grid grid-cols-1 gap-2.5 lg:flex lg:flex-wrap lg:items-end lg:gap-3">
        <div className="relative min-w-0 lg:flex-1 lg:min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode tiket, pemohon, atau kegiatan..."
            className="h-11 sm:h-9 pl-9 bg-card"
            aria-label="Cari proposal"
          />
        </div>

        {showStatus && (
          <div className="w-full lg:w-48">
            <Select
              value={filterStatus || 'ALL'}
              onValueChange={(val) => setFilterStatus(val === 'ALL' ? '' : val)}
            >
              <SelectTrigger className="h-11 sm:h-9" aria-label="Filter status">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="Dalam Antrean">Dalam Antrean</SelectItem>
                <SelectItem value="Dalam Review">Dalam Review</SelectItem>
                <SelectItem value="Revisi Proposal">Revisi Proposal</SelectItem>
                <SelectItem value="Menunggu Fisik">Menunggu Fisik</SelectItem>
                <SelectItem value="Dana Cair">Dana Cair</SelectItem>
                <SelectItem value="Menunggu Evidence">Menunggu Evidence</SelectItem>
                <SelectItem value="Menunggu Verif">Menunggu Verif</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Gagal Bayar">Gagal Bayar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showDate && (
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-end">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Dari Tanggal
              </span>
              <DatePicker
                value={filterDateFrom}
                onChange={setFilterDateFrom}
                placeholder="Tgl mulai"
                className="w-full sm:w-44"
                aria-label="Dari tanggal"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sampai Tanggal
              </span>
              <DatePicker
                value={filterDateTo}
                onChange={setFilterDateTo}
                placeholder="Tgl akhir"
                className="w-full sm:w-44"
                align="end"
                aria-label="Sampai tanggal"
              />
            </div>
          </div>
        )}
      </div>

      {hasFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs font-medium text-muted-foreground">
            Menampilkan <strong className="text-foreground">{proposalsLength}</strong> dari total{' '}
            <strong className="text-foreground">{totalItems}</strong> data
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-12">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-12">
        <Icon className="size-5 sm:size-6" />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ columns = 6, rows = 4 }) {
  return (
    <div className="divide-y divide-border p-4">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-3 py-3 sm:gap-4">
          {Array.from({ length: Math.min(columns, 4) }).map((__, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
