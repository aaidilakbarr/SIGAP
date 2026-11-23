import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  ExternalLink,
  Info,
  Newspaper,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ThumbsUp,
  Trash2,
  MinusCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { EmptyState } from '../shared/SharedComponents';

const STORAGE_KEY = 'sigap_monitoring_berita_items';

const SENTIMENT_STYLES = {
  Positif: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Netral: 'bg-slate-100 text-slate-700 border-slate-200',
  'Perlu Perhatian': 'bg-amber-50 text-amber-800 border-amber-200',
};

const EMPTY_FORM = {
  judul: '',
  media: '',
  url: '',
  tanggal: '',
  sentimen: 'Positif',
  ringkasan: '',
};

function loadSavedItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function MonitoringBeritaPage({ showToast }) {
  const [items, setItems] = useState(loadSavedItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const persist = (next) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (q) {
        const matchText = `${item.judul} ${item.media} ${item.ringkasan || ''}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }
      if (sentimentFilter && item.sentimen !== sentimentFilter) return false;
      if (dateFrom && item.tanggal && item.tanggal < dateFrom) return false;
      if (dateTo && item.tanggal && item.tanggal > dateTo) return false;
      return true;
    });
  }, [items, searchQuery, sentimentFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      positif: items.filter((i) => i.sentimen === 'Positif').length,
      netral: items.filter((i) => i.sentimen === 'Netral').length,
      perhatian: items.filter((i) => i.sentimen === 'Perlu Perhatian').length,
    };
  }, [items]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul || '',
      media: item.media || '',
      url: item.url || '',
      tanggal: item.tanggal || '',
      sentimen: item.sentimen || 'Positif',
      ringkasan: item.ringkasan || '',
    });
    setDialogOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.media.trim() || !form.tanggal) {
      showToast('Lengkapi judul, sumber media, dan tanggal terbit.', 'error');
      return;
    }

    const cleanedUrl = form.url.trim();
    const normalizedUrl =
      cleanedUrl && !/^https?:\/\//i.test(cleanedUrl) ? `https://${cleanedUrl}` : cleanedUrl;

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...form,
              judul: form.judul.trim(),
              media: form.media.trim(),
              url: normalizedUrl,
              ringkasan: form.ringkasan.trim(),
            }
          : item
      );
      persist(updated);
      showToast('Catatan berita berhasil diperbarui.', 'success');
    } else {
      const created = {
        id: Date.now().toString(),
        ...form,
        judul: form.judul.trim(),
        media: form.media.trim(),
        url: normalizedUrl,
        ringkasan: form.ringkasan.trim(),
        created_at: new Date().toISOString(),
      };
      persist([created, ...items]);
      showToast('Berita baru berhasil ditambahkan.', 'success');
    }

    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    persist(items.filter((item) => item.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast('Data berita berhasil dihapus.', 'success');
  };

  const hasFilter = Boolean(searchQuery || sentimentFilter || dateFrom || dateTo);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Info notice */}
      <Alert variant="info">
        <Info className="size-4 shrink-0 mt-0.5" />
        <AlertDescription className="text-xs sm:text-sm">
          Data monitoring berita sementara tersimpan di browser lokal hingga endpoint API backend tersedia.
        </AlertDescription>
      </Alert>

      {/* Summary Cards: 2x2 on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3.5 sm:p-4">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Total Berita
              </div>
              <div className="mt-1 text-2xl font-extrabold text-foreground tabular-nums">
                {stats.total}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
              <Newspaper className="size-4.5 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3.5 sm:p-4">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Positif
              </div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700 tabular-nums">
                {stats.positif}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 sm:size-10">
              <ThumbsUp className="size-4.5 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3.5 sm:p-4">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Netral
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-700 tabular-nums">
                {stats.netral}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 sm:size-10">
              <MinusCircle className="size-4.5 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-2 p-3.5 sm:p-4">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                Perhatian
              </div>
              <div className="mt-1 text-2xl font-extrabold text-amber-700 tabular-nums">
                {stats.perhatian}
              </div>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 sm:size-10">
              <AlertTriangle className="size-4.5 sm:size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground sm:text-base">
              Daftar Publikasi Berita
            </h2>
            <p className="text-xs text-muted-foreground">
              Catat tautan liputan media, tanggal tayang, dan klasifikasi sentimen.
            </p>
          </div>
          <Button size="sm" className="w-full min-h-10 sm:w-auto sm:min-h-8" onClick={openCreateModal}>
            <Plus className="size-4" />
            Tambah Berita
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="grid grid-cols-1 gap-2.5 lg:flex lg:flex-wrap lg:items-end lg:gap-3">
            <div className="relative min-w-0 lg:flex-1 lg:min-w-[220px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul berita, media, atau ringkasan..."
                className="h-11 sm:h-9 pl-9 bg-card"
                aria-label="Cari berita"
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={sentimentFilter || 'ALL'}
                onValueChange={(val) => setSentimentFilter(val === 'ALL' ? '' : val)}
              >
                <SelectTrigger className="h-11 sm:h-9" aria-label="Filter sentimen">
                  <SelectValue placeholder="Semua Sentimen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Sentimen</SelectItem>
                  <SelectItem value="Positif">Positif</SelectItem>
                  <SelectItem value="Netral">Netral</SelectItem>
                  <SelectItem value="Perlu Perhatian">Perlu Perhatian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-end">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Dari Tanggal
                </span>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="Tgl mulai"
                  className="w-full sm:w-44"
                  aria-label="Filter berita dari tanggal"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Sampai Tanggal
                </span>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="Tgl akhir"
                  className="w-full sm:w-44"
                  align="end"
                  aria-label="Filter berita sampai tanggal"
                />
              </div>
            </div>
          </div>

          {hasFilter && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs font-medium text-muted-foreground">
                Menampilkan <strong className="text-foreground">{filteredItems.length}</strong> dari{' '}
                <strong className="text-foreground">{items.length}</strong> berita
              </span>
              <Button
                variant="outline"
                size="sm"
                className="min-h-9"
                onClick={() => {
                  setSearchQuery('');
                  setSentimentFilter('');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                <RotateCcw className="size-3.5" />
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={hasFilter ? 'Tidak ada berita yang cocok' : 'Belum ada data monitoring berita'}
            description={
              hasFilter
                ? 'Ubah kata kunci atau rentang tanggal filter untuk melihat data lainnya.'
                : 'Mulai catat publikasi berita media terkait kegiatan agar mudah dipantau tim.'
            }
            action={
              !hasFilter && (
                <Button size="sm" className="min-h-10" onClick={openCreateModal}>
                  <Plus className="size-4" />
                  Tambah Berita Pertama
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="divide-y divide-border md:hidden">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground tabular-nums">
                      <Calendar className="size-3.5" />
                      {item.tanggal}
                    </span>
                    <Badge
                      variant="outline"
                      className={SENTIMENT_STYLES[item.sentimen] || SENTIMENT_STYLES.Netral}
                    >
                      {item.sentimen}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold text-foreground leading-snug">{item.judul}</div>
                  <div className="text-xs font-semibold text-primary">{item.media}</div>
                  {item.ringkasan && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.ringkasan}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {item.url && (
                      <Button variant="outline" size="sm" asChild className="flex-1 min-h-10">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          Buka Berita
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="min-h-10 px-3"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10 border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => setDeleteTargetId(item.id)}
                      aria-label={`Hapus ${item.judul}`}
                    >
                      <Trash2 className="size-4" />
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Judul Berita</TableHead>
                    <TableHead>Sumber Media</TableHead>
                    <TableHead>Sentimen</TableHead>
                    <TableHead>Tautan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap tabular-nums">
                        {item.tanggal}
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="font-semibold text-foreground leading-snug">{item.judul}</div>
                        {item.ringkasan && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {item.ringkasan}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground whitespace-nowrap">
                        {item.media}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={SENTIMENT_STYLES[item.sentimen] || SENTIMENT_STYLES.Netral}
                        >
                          {item.sentimen}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.url ? (
                          <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              Buka Berita
                              <ExternalLink className="size-3.5" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Tanpa tautan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            aria-label={`Edit ${item.judul}`}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTargetId(item.id)}
                            aria-label={`Hapus ${item.judul}`}
                          >
                            <Trash2 className="size-3.5" />
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
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Catatan Berita' : 'Tambah Monitoring Berita'}</DialogTitle>
            <DialogDescription>
              Masukkan informasi publikasi berita untuk dicatat dalam daftar pemantauan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
            <div className="overflow-y-auto space-y-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-2">
                <Label htmlFor="berita-judul">
                  Judul Berita <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="berita-judul"
                  className="h-11 sm:h-9"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Masukkan judul liputan berita"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="berita-media">
                    Sumber / Media <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="berita-media"
                    className="h-11 sm:h-9"
                    value={form.media}
                    onChange={(e) => setForm({ ...form, media: e.target.value })}
                    placeholder="Contoh: Kompas, Antara, Detik"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="berita-tanggal">
                    Tanggal Terbit <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    id="berita-tanggal"
                    value={form.tanggal}
                    onChange={(val) => setForm({ ...form, tanggal: val })}
                    placeholder="Pilih tanggal terbit"
                    clearable={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="berita-sentimen">Sentimen</Label>
                  <Select
                    value={form.sentimen}
                    onValueChange={(val) => setForm({ ...form, sentimen: val })}
                  >
                    <SelectTrigger id="berita-sentimen" className="h-11 sm:h-9">
                      <SelectValue placeholder="Pilih sentimen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positif">Positif</SelectItem>
                      <SelectItem value="Netral">Netral</SelectItem>
                      <SelectItem value="Perlu Perhatian">Perlu Perhatian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="berita-url">Tautan Berita (URL)</Label>
                  <Input
                    id="berita-url"
                    className="h-11 sm:h-9"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://media.example.com/berita"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="berita-ringkasan">Ringkasan / Catatan</Label>
                <Textarea
                  id="berita-ringkasan"
                  rows={3}
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  placeholder="Ringkasan singkat isi berita atau tindak lanjut yang diperlukan..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-11 sm:w-auto sm:min-h-9"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="w-full min-h-11 sm:w-auto sm:min-h-9">
                {editingId ? 'Simpan Perubahan' : 'Simpan Berita'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catatan Berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan berita yang dihapus tidak dapat dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
