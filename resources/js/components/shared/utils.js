// ─── Shared utilities & constants ────────────────────────────────────────────

export const TITLES = {
  dashboard: 'Dashboard',
  proposals: 'Manajemen Proposal',
  verification: 'Verifikasi Evidence',
  portal: 'Portal Pemohon',
  master: 'Master Database',
  logs: 'Activity Log',
};

export const STATUS_STAGES = [
  { key: 'Dalam Antrean',    label: 'Input',      desc: 'Proposal disubmit dan masuk antrean sistem.' },
  { key: 'Dalam Review',     label: 'Review',     desc: 'Proposal sedang direview oleh pimpinan.' },
  { key: 'Menunggu Fisik',   label: 'Fisik',      desc: 'Menunggu penyerahan berkas fisik proposal.' },
  { key: 'Dana Cair',        label: 'Dana Cair',  desc: 'Dana telah berhasil dicairkan kepada pemohon.' },
  { key: 'Menunggu Evidence',label: 'Upload LPJ', desc: 'Pemohon harus mengunggah bukti/evidence.' },
  { key: 'Selesai',          label: 'Selesai',    desc: 'Seluruh proses telah selesai dan laporan diterima.' },
];

export const STATUS_OPTIONS = [
  { value: 'Dalam Antrean',    icon: '🕐', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', desc: 'Antrean sistem' },
  { value: 'Dalam Review',     icon: '🔍', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'Sedang direview' },
  { value: 'Revisi Proposal',  icon: '✏️', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', desc: 'Perlu perbaikan' },
  { value: 'Menunggu Fisik',   icon: '📦', color: '#b45309', bg: '#fffbeb', border: '#fde68a', desc: 'Berkas fisik' },
  { value: 'Dana Cair',        icon: '💸', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', desc: 'Dana dicairkan' },
  { value: 'Menunggu Evidence',icon: '📋', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', desc: 'Upload LPJ' },
  { value: 'Selesai',          icon: '✅', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Proses selesai' },
  { value: 'Gagal Bayar',      icon: '❌', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'Gagal diproses' },
];

export const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '';
  return new Intl.NumberFormat('id-ID').format(angka);
};

export const getStatusClass = (status) => {
  if (status === 'Menunggu Evidence' || status === 'Menunggu Verif') return 'sw';
  if (status === 'Selesai') return 'sd';
  if (status === 'Gagal Bayar') return 'sf';
  if (status === 'Dalam Review' || status === 'Revisi Proposal') return 'sr';
  if (status === 'Menunggu Fisik') return 'sn';
  return 'sq';
};
