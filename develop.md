# DEVELOP.md — Fitur Berita Acara (SIGAP)

## Konteks & Tujuan

Fitur **Berita Acara** adalah fitur baru yang dikembangkan di atas sistem manajemen proposal SIGAP (Laravel 10 + React JS + Vite). Fitur ini memungkinkan Admin dan Super Admin untuk men-generate dokumen Berita Acara (BA) dalam format PDF secara otomatis berdasarkan data proposal yang telah selesai diproses.

---

## Keputusan Desain (Design Decisions)

| Aspek | Keputusan |
|---|---|
| **Trigger generate BA** | Hanya saat `proposals.status === 'selesai'` |
| **Jumlah BA per proposal** | 1 BA saja (tidak berubah meskipun ada revisi) |
| **Kapan BA dapat diakses** | Setelah seluruh alur proposal selesai (`status: selesai`) |
| **Hak generate** | Admin & Super Admin only |
| **Hak preview/download** | Admin, Super Admin, dan User/Pemohon |
| **Format output** | PDF (generate via DomPDF) |
| **BA untuk proposal ditolak** | Tidak ada / tidak relevan |

---

## Alur Fitur

```
Proposal Diajukan (User)
        ↓
Admin/SuperAdmin Review
        ↓
     [Approved]
        ↓
Proses berlanjut (kegiatan, upload LPJ/Evidence)
        ↓
Admin verifikasi LPJ
        ↓
     [Status: Selesai]  ← hook di sini
        ↓
Tombol "Generate Berita Acara" aktif (Admin/SuperAdmin only)
        ↓
BA di-generate → PDF disimpan, record tersimpan di DB
        ↓
Semua role bisa Preview & Download PDF BA
```

---

## Struktur Database

### Tabel Baru: `berita_acaras`

```sql
CREATE TABLE berita_acaras (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    proposal_id     BIGINT UNSIGNED NOT NULL,
    nomor_ba        VARCHAR(100) NOT NULL UNIQUE,
    generated_by    BIGINT UNSIGNED NOT NULL,
    catatan_admin   TEXT NULL,
    file_path       VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,

    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);
```

### Format Nomor BA (Auto-Generate)
```
BA-[increment 3 digit]/SIGAP/[Bulan Romawi]/[Tahun]
Contoh: BA-001/SIGAP/VI/2026
```

---

## Task Backend (Laravel)

### 1. Migration
```
php artisan make:migration create_berita_acaras_table
```
Isi sesuai struktur tabel di atas.

### 2. Model
```
php artisan make:model BeritaAcara
```

**Relasi:**
```php
// BeritaAcara.php
public function proposal() {
    return $this->belongsTo(Proposal::class);
}

public function generatedBy() {
    return $this->belongsTo(User::class, 'generated_by');
}

// Proposal.php — tambahkan:
public function beritaAcara() {
    return $this->hasOne(BeritaAcara::class);
}
```

### 3. Install DomPDF
```
composer require barryvdh/laravel-dompdf
```

### 4. Template PDF (Blade View)
Buat file: `resources/views/pdf/berita_acara.blade.php`

Struktur template:
```
- KOP SURAT (Logo SIGAP + Nama Institusi)
- Judul: BERITA ACARA VERIFIKASI PROPOSAL
- Nomor BA
- Paragraf pembuka (hari, tanggal, pihak yang bersangkutan)
- Tabel Data Proposal:
    - Nama Pemohon
    - Judul Proposal
    - Nominal Dana yang Disetujui
    - Tanggal Pengajuan
    - Tanggal Disetujui
    - Status: DISETUJUI
- Catatan Admin (jika ada)
- Kolom Tanda Tangan:
    - Kiri: Admin/Reviewer (nama + jabatan)
    - Kanan: Pemohon (nama)
```

### 5. Controller
```
php artisan make:controller BeritaAcaraController
```

**Method yang dibutuhkan:**

```php
// Generate BA — hanya admin/superadmin
public function generate(Request $request, Proposal $proposal)
{
    // 1. Validasi: proposal harus berstatus 'selesai'
    // 2. Validasi: BA belum pernah dibuat untuk proposal ini
    // 3. Generate nomor BA otomatis
    // 4. Render PDF dari blade template
    // 5. Simpan PDF ke storage/app/public/berita_acara/
    // 6. Simpan record ke tabel berita_acaras
    // 7. Return response sukses
}

// Preview BA — semua role yang punya akses ke proposal
public function preview(Proposal $proposal)
{
    // Load beritaAcara dari proposal
    // Stream PDF ke browser (inline)
}

// Download BA — semua role yang punya akses ke proposal
public function download(Proposal $proposal)
{
    // Load beritaAcara dari proposal
    // Return file download response
}

// List semua BA — admin/superadmin only
public function index()
{
    // Paginate semua berita_acaras dengan relasi proposal & user
}
```

### 6. Routes
Tambahkan ke `routes/api.php` atau `routes/web.php`:

```php
Route::middleware(['auth', 'role:admin,superadmin'])->group(function () {
    Route::post('/proposals/{proposal}/berita-acara/generate', [BeritaAcaraController::class, 'generate']);
    Route::get('/berita-acara', [BeritaAcaraController::class, 'index']);
});

// Accessible oleh semua role (admin, superadmin, user)
Route::middleware(['auth'])->group(function () {
    Route::get('/proposals/{proposal}/berita-acara/preview', [BeritaAcaraController::class, 'preview']);
    Route::get('/proposals/{proposal}/berita-acara/download', [BeritaAcaraController::class, 'download']);
});
```

### 7. Policy (Opsional tapi disarankan)
```
php artisan make:policy BeritaAcaraPolicy --model=BeritaAcara
```

---

## Task Frontend (React JS)

### Komponen yang Perlu Dibuat/Dimodifikasi

#### A. Halaman Detail Proposal (`ProposalDetail.jsx` atau sejenisnya)

Tambahkan section **Berita Acara** di bagian bawah halaman:

```
Kondisi render:
- proposals.status === 'selesai'           → tampilkan section BA
- role === 'admin' || 'superadmin'
  && beritaAcara === null                  → tampilkan tombol "Generate BA"
- role === 'admin' || 'superadmin'
  && beritaAcara !== null                  → tombol Generate disabled/hidden
- beritaAcara !== null                     → tampilkan tombol "Preview" & "Download"
  (semua role)
```

**Tombol Generate (Admin/SuperAdmin):**
```jsx
<button
  onClick={handleGenerate}
  disabled={isGenerating || proposal.berita_acara !== null}
>
  {isGenerating ? 'Membuat BA...' : 'Generate Berita Acara'}
</button>
```

**Tombol Preview & Download (semua role):**
```jsx
<button onClick={handlePreview}>Preview BA</button>
<button onClick={handleDownload}>Download BA</button>
```

#### B. Halaman List Berita Acara (Baru) — Admin/SuperAdmin Only

Route: `/admin/berita-acara`

Tampilkan tabel berisi:
```
| No | Nomor BA | Judul Proposal | Pemohon | Dibuat Oleh | Tanggal | Aksi |
```

Kolom Aksi: tombol Preview & Download.

#### C. Sidebar/Navigation

Tambahkan menu **"Berita Acara"** di navigasi khusus role Admin & Super Admin.

---

## Urutan Pengerjaan (Prioritas Demo)

```
Step 1 — Migration & Model BeritaAcara          (Backend)
Step 2 — Install DomPDF + Template Blade PDF    (Backend) ← paling krusial
Step 3 — BeritaAcaraController (generate, preview, download)
Step 4 — Route & middleware
Step 5 — Integrasi tombol di halaman detail proposal (React)
Step 6 — Halaman List Berita Acara (React)      ← jika waktu cukup
Step 7 — Tambahkan link menu di Sidebar         (React)
```

---

## Catatan Penting

- **Satu proposal hanya boleh punya satu BA.** Pastikan ada validasi di `generate()` untuk cek apakah BA sudah ada sebelum membuat baru.
- **BA hanya bisa di-generate jika status proposal adalah `selesai`.** Validasi wajib ada di backend, bukan hanya di frontend.
- **File PDF disimpan di server** (`storage/app/public/berita_acara/`), bukan di-generate ulang setiap kali preview/download — cukup stream file yang sudah ada.
- Jalankan `php artisan storage:link` agar folder storage accessible via URL publik.
- Nomor BA harus **unik dan berurutan** — gunakan `DB::table('berita_acaras')->count() + 1` atau sequence tersendiri.

---

## Checklist Demo

- [ ] Migration berhasil dijalankan
- [ ] Generate BA berhasil membuat file PDF & record di DB
- [ ] PDF tampil dengan data proposal yang benar
- [ ] Tombol Generate hanya muncul untuk Admin/SuperAdmin
- [ ] Tombol Generate tidak bisa diklik jika BA sudah ada
- [ ] Preview PDF berjalan di browser
- [ ] Download PDF berhasil
- [ ] User/Pemohon bisa akses Preview & Download (tidak bisa Generate)
- [ ] List Berita Acara tampil di halaman admin
