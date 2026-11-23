import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Eye, FileSpreadsheet, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState, Pagination, TableSkeleton } from '../shared/SharedComponents';

export function BeritaAcaraListPage() {
  const [beritaAcaras, setBeritaAcaras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchBeritaAcaras = async (page = 1) => {
    try {
      setLoading(true);
      const q = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await axios.get(`/api/berita-acara?page=${page}${q}`);
      if (res.data?.data) {
        setBeritaAcaras(res.data.data.data || []);
        setCurrentPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch (e) {
      console.error('Error fetching berita acara:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBeritaAcaras(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">Daftar Berita Acara</h2>
          <p className="text-xs text-muted-foreground">
            Dokumen PDF Berita Acara resmi yang diterbitkan untuk proposal berstatus selesai.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full min-h-10 sm:w-auto sm:min-h-8"
          onClick={() => fetchBeritaAcaras(currentPage)}
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Memuat...' : 'Refresh'}
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-2.5 border-b border-border bg-muted/30 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5 sm:py-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nomor BA, Tiket, Kegiatan, Pemohon..."
            className="h-11 sm:h-9 pl-9 bg-card"
            aria-label="Cari berita acara"
          />
        </div>
        {searchQuery && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Menampilkan <strong className="text-foreground">{beritaAcaras.length}</strong> dari{' '}
              <strong className="text-foreground">{totalItems}</strong> data
            </span>
            <Button variant="outline" size="sm" className="min-h-9" onClick={() => setSearchQuery('')}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton columns={7} rows={5} />
      ) : beritaAcaras.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Tidak ada data Berita Acara"
          description={
            searchQuery
              ? `Tidak ditemukan dokumen yang cocok dengan "${searchQuery}".`
              : 'Berita Acara akan muncul setelah diterbitkan pada detail proposal yang selesai.'
          }
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y divide-border md:hidden">
            {beritaAcaras.map((ba) => (
              <div key={ba.id} className="p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">{ba.nomor_ba}</span>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {ba.proposal?.kode_tiket || '-'}
                  </span>
                </div>
                <div className="text-sm font-bold text-foreground leading-snug">
                  {ba.proposal?.kegiatan || '-'}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{ba.proposal?.user?.name || '-'}</strong>
                    {ba.proposal?.user?.instansi ? ` · ${ba.proposal.user.instansi}` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(ba.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" asChild className="min-h-10">
                    <a
                      href={`/api/proposals/${ba.proposal_id}/berita-acara/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </a>
                  </Button>
                  <Button size="sm" asChild className="min-h-10">
                    <a href={`/api/proposals/${ba.proposal_id}/berita-acara/download`}>
                      <Download className="size-3.5" />
                      Download
                    </a>
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
                  <TableHead>Nomor Berita Acara</TableHead>
                  <TableHead>Kode Tiket</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Kegiatan</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beritaAcaras.map((ba) => (
                  <TableRow key={ba.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {ba.nomor_ba}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {ba.proposal?.kode_tiket || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {ba.proposal?.user?.name || '-'}
                      </div>
                      {ba.proposal?.user?.instansi && (
                        <div className="text-xs text-muted-foreground">
                          {ba.proposal.user.instansi}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate" title={ba.proposal?.kegiatan}>
                      {ba.proposal?.kegiatan || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {ba.generated_by?.name || ba.generated_by_user?.name || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Admin</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(ba.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/api/proposals/${ba.proposal_id}/berita-acara/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="size-3.5" />
                            Preview
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={`/api/proposals/${ba.proposal_id}/berita-acara/download`}>
                            <Download className="size-3.5" />
                            Download
                          </a>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onFetch={fetchBeritaAcaras}
      />
    </Card>
  );
}
