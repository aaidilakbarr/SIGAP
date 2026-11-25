export const TITLES = {
  dashboard: 'Dashboard',
  proposals: 'Manajemen Proposal',
  verification: 'Verifikasi Evidence',
  portal: 'Portal Pemohon',
  master: 'Master Database',
  logs: 'Activity Log',
  berita_acara: 'Daftar Berita Acara',
  monitoring_berita: 'Monitoring Berita',
};

export const STATUS_STAGES = [
  { key: 'Dalam Antrean', label: 'Input', desc: 'Proposal disubmit dan masuk antrean sistem.' },
  { key: 'Dalam Review', label: 'Review', desc: 'Proposal sedang direview oleh pimpinan.' },
  { key: 'Menunggu Fisik', label: 'Fisik', desc: 'Menunggu penyerahan berkas fisik proposal.' },
  { key: 'Dana Cair', label: 'Dana Cair', desc: 'Dana telah berhasil dicairkan kepada pemohon.' },
  { key: 'Menunggu Evidence', label: 'Upload LPJ', desc: 'Pemohon harus mengunggah bukti atau evidence.' },
  { key: 'Selesai', label: 'Selesai', desc: 'Seluruh proses telah selesai dan laporan diterima.' },
];

export const STATUS_OPTIONS = [
  {
    value: 'Dalam Antrean',
    iconName: 'Clock',
    desc: 'Antrean sistem',
    activeClass: 'border-slate-600 bg-slate-50 text-slate-900 ring-2 ring-slate-600/20',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    value: 'Dalam Review',
    iconName: 'Search',
    desc: 'Sedang direview',
    activeClass: 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'Revisi Proposal',
    iconName: 'FilePenLine',
    desc: 'Perlu perbaikan',
    activeClass: 'border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-600/20',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    value: 'Menunggu Fisik',
    iconName: 'PackageCheck',
    desc: 'Berkas fisik',
    activeClass: 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600/20',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    value: 'Dana Cair',
    iconName: 'Banknote',
    desc: 'Dana dicairkan',
    activeClass: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    value: 'Menunggu Evidence',
    iconName: 'FileUp',
    desc: 'Upload LPJ',
    activeClass: 'border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-600/20',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  {
    value: 'Selesai',
    iconName: 'CheckCircle2',
    desc: 'Proses selesai',
    activeClass: 'border-green-700 bg-green-50 text-green-900 ring-2 ring-green-700/20',
    badgeClass: 'bg-green-50 text-green-800 border-green-200',
  },
  {
    value: 'Gagal Bayar',
    iconName: 'XCircle',
    desc: 'Gagal diproses',
    activeClass: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-600/20',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
  },
];

export const STATUS_BADGE_MAP = {
  'Dalam Antrean': 'bg-slate-600 text-white border-transparent',
  'Dalam Review': 'bg-blue-600 text-white border-transparent',
  'Revisi Proposal': 'bg-orange-600 text-white border-transparent',
  'Menunggu Fisik': 'bg-amber-600 text-white border-transparent',
  'Dana Cair': 'bg-emerald-700 text-white border-transparent',
  'Menunggu Evidence': 'bg-violet-600 text-white border-transparent',
  'Menunggu Verif': 'bg-rose-600 text-white border-transparent',
  'Selesai': 'bg-[#1a5e1f] text-white border-transparent',
  'Gagal Bayar': 'bg-red-600 text-white border-transparent',
};

export const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(angka);
};

export const getStatusBadgeClass = (status) => {
  return STATUS_BADGE_MAP[status] || 'bg-slate-600 text-white border-transparent';
};

export const encodeStoragePath = (path = '') => {
  return String(path)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

const toBase64Url = (str = '') => {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
};

export const buildDocumentPreviewUrl = ({ src, title = 'Preview Dokumen', downloadUrl = '' }) => {
  const params = new URLSearchParams();
  params.set('d', toBase64Url(src));
  if (title) params.set('title', title);
  if (downloadUrl) params.set('dl', toBase64Url(downloadUrl));
  return `/preview-dokumen?${params.toString()}`;
};

export const buildFilePreviewUrl = (storagePath, title = 'Preview Dokumen') => {
  const src = `/api/preview-file/${encodeStoragePath(storagePath)}`;
  return buildDocumentPreviewUrl({ src, title });
};

export const buildBeritaAcaraPreviewUrl = (proposalId, nomorBa = '') => {
  const title = nomorBa ? `Berita Acara ${nomorBa}` : 'Berita Acara Verifikasi Proposal';
  return buildDocumentPreviewUrl({
    src: `/api/proposals/${proposalId}/berita-acara/preview`,
    title,
    downloadUrl: `/api/proposals/${proposalId}/berita-acara/download`,
  });
};
