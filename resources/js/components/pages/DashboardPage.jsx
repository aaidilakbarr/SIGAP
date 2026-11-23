import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  CheckCircle2,
  Eye,
  FileClock,
  FileUp,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { formatRupiah } from '../shared/utils';
import { EmptyState, Pagination, StatusBadge, TableSkeleton } from '../shared/SharedComponents';

const CHART_COLORS = {
  'Dalam Antrean': 'url(#grad-antrean)',
  'Dalam Review': 'url(#grad-review)',
  'Revisi Proposal': 'url(#grad-revisi)',
  'Menunggu Fisik': 'url(#grad-fisik)',
  'Dana Cair': 'url(#grad-cair)',
  'Menunggu Evidence': 'url(#grad-evidence)',
  'Menunggu Verif': 'url(#grad-verif)',
  'Selesai': 'url(#grad-selesai)',
  'Gagal Bayar': 'url(#grad-gagal)',
};

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function DashboardPage({
  dashboardStats,
  proposals,
  loading,
  currentPage,
  totalPages,
  chartFilterMonth,
  setChartFilterMonth,
  setActivePage,
  setSelectedProposal,
  setActiveModal,
  fetchProposals,
}) {
  const chartDataStatus = useMemo(() => {
    if (!dashboardStats?.status_counts) return [];
    return Object.keys(dashboardStats.status_counts).map((key) => ({
      name: key,
      value: dashboardStats.status_counts[key],
    }));
  }, [dashboardStats]);

  const chartDataMonthly = useMemo(() => {
    if (!dashboardStats?.monthly_counts) return [];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return shortMonths.map((m, idx) => ({
      name: m,
      total: dashboardStats.monthly_counts[idx + 1] || 0,
    }));
  }, [dashboardStats]);

  const totalProposalsInChart = chartDataStatus.reduce((sum, item) => sum + item.value, 0);

  const statItems = [
    {
      label: 'Total Antrean',
      value: dashboardStats?.total_queue || 0,
      icon: FileClock,
      iconClass: 'bg-slate-100 text-slate-700',
      actionLabel: 'Lihat proposal',
      targetPage: 'proposals',
    },
    {
      label: 'Menunggu Review',
      value: dashboardStats?.total_review || 0,
      icon: Eye,
      iconClass: 'bg-blue-50 text-blue-700',
      actionLabel: 'Buka antrean',
      targetPage: 'proposals',
    },
    {
      label: 'Menunggu Verif',
      value: dashboardStats?.total_verif || 0,
      icon: FileUp,
      iconClass: 'bg-amber-50 text-amber-700',
      actionLabel: 'Verifikasi',
      targetPage: 'verification',
    },
    {
      label: 'Selesai',
      value: dashboardStats?.total_selesai || 0,
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700',
      actionLabel: 'Lihat arsip',
      targetPage: 'master',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Stat Cards: 2x2 on mobile, 4-col on xl */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="transition-colors hover:border-primary/35">
              <CardContent className="p-3.5 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {item.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:mt-2 sm:text-3xl">
                      {item.value}
                    </div>
                  </div>
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 ${item.iconClass}`}
                  >
                    <Icon className="size-4 sm:size-5" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/70 sm:mt-4 sm:pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2 text-xs font-semibold text-primary hover:text-primary"
                    onClick={() => setActivePage(item.targetPage)}
                  >
                    {item.actionLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Header + Filter */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground sm:text-base">
            Analitik Pengajuan Proposal
          </h2>
          <p className="text-xs text-muted-foreground">
            Distribusi status aktif dan tren volume pengajuan sepanjang tahun.
          </p>
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={chartFilterMonth === '' ? 'ALL' : chartFilterMonth}
            onValueChange={(val) => setChartFilterMonth(val === 'ALL' ? '' : val)}
          >
            <SelectTrigger className="h-11 sm:h-9" aria-label="Filter bulan analitik">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Bulan</SelectItem>
              {MONTHS.map((m, idx) => (
                <SelectItem key={m} value={String(idx)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
        <Card className="flex h-[350px] flex-col sm:h-[420px]">
          <CardHeader className="border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Proporsi Status Proposal</CardTitle>
          </CardHeader>
          <CardContent className="relative flex-1 min-h-0 px-2 pt-3 pb-3 sm:px-5 sm:pt-4">
            {chartDataStatus.length === 0 ? (
              <EmptyState
                title="Belum ada data status"
                description="Statistik proporsi status akan tampil setelah terdapat proposal masuk."
              />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="grad-antrean" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                      <linearGradient id="grad-review" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                      <linearGradient id="grad-revisi" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ea580c" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                      <linearGradient id="grad-fisik" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <linearGradient id="grad-cair" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                      <linearGradient id="grad-evidence" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                      <linearGradient id="grad-verif" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#e11d48" />
                        <stop offset="100%" stopColor="#fb7185" />
                      </linearGradient>
                      <linearGradient id="grad-selesai" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1a5e1f" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient id="grad-gagal" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#f87171" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={chartDataStatus}
                      cx="50%"
                      cy="42%"
                      innerRadius="50%"
                      outerRadius="72%"
                      paddingAngle={2}
                      cornerRadius={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartDataStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #dde5df',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', lineHeight: '1.5', paddingTop: '4px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-extrabold leading-none text-foreground tabular-nums sm:text-3xl">
                    {totalProposalsInChart}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                    Proposal
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-[320px] flex-col sm:h-[420px]">
          <CardHeader className="border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="size-4 text-primary sm:size-4.5" />
              Tren Pengajuan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-2 pt-4 pb-2 sm:px-5 sm:pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataMonthly} margin={{ top: 6, right: 6, left: -24, bottom: 4 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a5e1f" stopOpacity={1} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fill: '#4c5d52', fontSize: 10, fontWeight: 500 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(26, 94, 31, 0.05)' }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #dde5df',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Total Proposal"
                  fill="url(#barGradient)"
                  background={{ fill: '#eef2ef', radius: 8 }}
                  radius={[8, 8, 8, 8]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Priority Queue */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground sm:text-base">Antrean Prioritas</h3>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Lima pengajuan terbaru yang memerlukan pemantauan atau tindak lanjut.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="min-h-9 shrink-0"
            onClick={() => setActivePage('proposals')}
          >
            Lihat semua
          </Button>
        </div>

        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : proposals.length === 0 ? (
          <EmptyState
            title="Belum ada antrean proposal"
            description="Pengajuan proposal yang masuk dari pemohon akan tampil di daftar ini."
          />
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="divide-y divide-border md:hidden">
              {proposals.slice(0, 5).map((p) => (
                <div key={p.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{p.kode_tiket}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-sm font-bold text-foreground leading-snug">{p.kegiatan}</div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      <strong className="font-semibold text-foreground">
                        {p.user?.name || 'N/A'}
                      </strong>
                      {p.user?.instansi ? ` · ${p.user.instansi}` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {p.tgl_pelaksanaan}
                    </span>
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
                    <TableHead>Tgl Rencana</TableHead>
                    <TableHead>Dana (Rp)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.slice(0, 5).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {p.kode_tiket}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{p.user?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.user?.instansi || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium" title={p.kegiatan}>
                        {p.kegiatan}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {p.tgl_pelaksanaan}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground whitespace-nowrap tabular-nums">
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
