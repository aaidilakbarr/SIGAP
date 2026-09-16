# 🔍 Audit Menyeluruh — SIGAP (Sistem Informasi Gerak Alur Proposal)

> **Tanggal Audit:** 7 Agustus 2026  
> **Branch:** `fitur/arsip`  
> **Scope:** Full-stack audit — Backend (Laravel), Frontend (React), Database, Security, UX

---

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Temuan CRITICAL — Keamanan & Otorisasi](#1-critical--keamanan--otorisasi)
3. [Temuan MAJOR — Integritas Data & Logika Bisnis](#2-major--integritas-data--logika-bisnis)
4. [Temuan MODERATE — Arsitektur & Maintainability](#3-moderate--arsitektur--maintainability)
5. [Temuan MINOR — UX & Polish](#4-minor--ux--polish)
6. [Audit Per-Role](#audit-per-role)
7. [Rekomendasi Prioritas Implementasi](#rekomendasi-prioritas-implementasi)

---

## Ringkasan Eksekutif

SIGAP adalah sistem monitoring proposal yang sudah berfungsi dengan baik secara fitur inti. Namun dari hasil audit menyeluruh, ditemukan **beberapa celah keamanan kritis** yang harus segera ditangani sebelum deployment ke production, terutama pada sisi **autentikasi tanpa password**, **absennya role-based authorization di backend**, dan **endpoint publik yang mengekspos file sensitif**.

| Severity | Jumlah Temuan |
|----------|:------------:|
| 🔴 CRITICAL | 6 |
| 🟠 MAJOR | 8 |
| 🟡 MODERATE | 7 |
| 🟢 MINOR | 6 |

---

## 1. CRITICAL — Keamanan & Otorisasi

### 🔴 C-01: Login Tanpa Password (Bypass Autentikasi Total)

> [!CAUTION]
> **Severity: CRITICAL** — Sistem login tidak memvalidasi password sama sekali.

**File:** [AuthController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/AuthController.php#L11-L35)

**Masalah:**
```php
public function login(Request $request)
{
    $role = $request->role; // Hanya menerima role string
    $user = User::where('role', $dbRole)->first(); // Langsung ambil user pertama
    $token = $user->createToken('auth-token')->plainTextToken; // Token langsung diberikan
}
```

Siapa pun bisa mendapatkan token autentikasi hanya dengan mengirim `POST /api/login` dengan `{"role": "master"}`. Tidak ada validasi email, password, atau credential apapun.

**Dampak:**
- Siapa saja bisa login sebagai SuperAdmin
- Seluruh data proposal, dokumen keuangan, dan Berita Acara bisa diakses/dimanipulasi
- Seluruh alur bisnis bisa dibypass

**Rekomendasi:**
- Implementasi login dengan email + password (`Hash::check`)
- Tambahkan rate limiting pada endpoint login
- Pertimbangkan 2FA untuk role admin/superadmin

---

### 🔴 C-02: Tidak Ada Role-Based Authorization di Backend

> [!CAUTION]
> **Severity: CRITICAL** — Semua endpoint hanya dilindungi `auth:sanctum` tanpa pembatasan role.

**File:** [api.php](file:///c:/laragon/www/admin_dashboard_laravel/routes/api.php#L29-L50)

**Masalah:**
Seluruh endpoint di dalam group `auth:sanctum` bisa diakses oleh semua role (user, admin, superadmin) tanpa pembedaan:

```php
Route::middleware('auth:sanctum')->group(function () {
    // User bisa akses updateStatus — seharusnya hanya admin
    Route::put('/proposals/{id}/status', [ProposalController::class, 'updateStatus']);
    // User bisa upload bukti transfer — seharusnya hanya admin
    Route::post('/proposals/{id}/upload-bukti', [ProposalController::class, 'uploadBuktiTransfer']);
    // User bisa lihat semua logs — seharusnya hanya superadmin
    Route::get('/logs', [ProposalController::class, 'getLogs']);
});
```

**Dampak:**
- User biasa bisa mengubah status proposal sendiri menjadi "Selesai"
- User biasa bisa upload bukti transfer palsu
- User bisa mengakses Activity Log yang seharusnya hanya untuk SuperAdmin
- User bisa men-generate Berita Acara

**Rekomendasi:**
- Buat middleware custom `CheckRole` atau gunakan gate/policy Laravel
- Pisahkan route group berdasarkan role:
  ```php
  Route::middleware(['auth:sanctum', 'role:admin,superadmin'])->group(...)
  Route::middleware(['auth:sanctum', 'role:superadmin'])->group(...)
  ```

---

### 🔴 C-03: Endpoint Preview File Publik Tanpa Autentikasi

> [!CAUTION]
> **Severity: CRITICAL** — File proposal, bukti transfer, dan evidence bisa diakses tanpa login.

**File:** [api.php](file:///c:/laragon/www/admin_dashboard_laravel/routes/api.php#L11)

**Masalah:**
```php
Route::get('/preview-file/{path}', [ProposalController::class, 'previewFile'])->where('path', '.*');
```

Endpoint ini **di luar** middleware `auth:sanctum`, dan parameter `{path}` menerima wildcard `.*`. Siapa pun bisa mengakses:
- `/api/preview-file/proposals/xxx.pdf` — Dokumen proposal
- `/api/preview-file/bukti_transfer/xxx.pdf` — Bukti transfer keuangan
- `/api/preview-file/evidence/xxx.pdf` — Dokumen LPJ

**Vulnerability tambahan:** Pola `.*` berpotensi Path Traversal attack (e.g., `../../../.env`).

**Dampak:**
- Kebocoran dokumen sensitif (proposal, bukti transfer, LPJ)
- Potensi akses ke file sistem via path traversal

**Rekomendasi:**
- Pindahkan ke dalam `auth:sanctum` middleware group
- Validasi path dengan whitelist folder (`proposals/`, `evidence/`, `bukti_transfer/`, `berita_acara/`)
- Tambahkan otorisasi: user hanya bisa akses file milik proposalnya sendiri
- Gunakan `Storage::disk('public')->exists()` dengan sanitasi path

---

### 🔴 C-04: Endpoint Berita Acara Preview & Download Publik

> [!WARNING]
> **Severity: CRITICAL** — Dokumen Berita Acara (PDF resmi) bisa diakses tanpa autentikasi.

**File:** [api.php](file:///c:/laragon/www/admin_dashboard_laravel/routes/api.php#L13-L15)

**Masalah:**
```php
// Di luar auth:sanctum
Route::get('/proposals/{proposal}/berita-acara/preview', [BeritaAcaraController::class, 'preview']);
Route::get('/proposals/{proposal}/berita-acara/download', [BeritaAcaraController::class, 'download']);
```

Dokumen resmi Berita Acara yang memuat data keuangan, tanda tangan, dan informasi personal bisa diunduh oleh siapa saja yang mengetahui proposal ID.

**Rekomendasi:**
- Pindahkan ke dalam `auth:sanctum` middleware group
- Tambahkan otorisasi: hanya pemilik proposal atau admin yang bisa akses

---

### 🔴 C-05: Test Endpoint di Production Route

> [!WARNING]
> **Severity: CRITICAL** — Route debugging masih aktif.

**File:** [api.php](file:///c:/laragon/www/admin_dashboard_laravel/routes/api.php#L17-L27)

**Masalah:**
```php
Route::post('/test-upload', function (Illuminate\Http\Request $request) {
    $file = $request->file('file');
    if (!$file) return 'No file';
    return [
        'valid' => $file->isValid(),
        'error' => $file->getError(),
        'path' => $file->getPathname(), // Mengekspos path server
        'realPath' => $file->getRealPath(), // Mengekspos struktur filesystem
        'isFile' => is_file($file->getPathname()),
    ];
});
```

Route ini **tidak memerlukan autentikasi** dan mengekspos informasi internal server (path filesystem).

**Rekomendasi:**
- **Hapus segera** route ini dari production codebase

---

### 🔴 C-06: APP_DEBUG=true & Database Tanpa Password

> [!CAUTION]
> **Severity: CRITICAL** — Konfigurasi production tidak aman.

**File:** [.env](file:///c:/laragon/www/admin_dashboard_laravel/.env)

**Masalah:**
```env
APP_DEBUG=true        # Error stack trace terekspos ke publik
DB_PASSWORD=          # Database tanpa password
```

**Rekomendasi:**
- Set `APP_DEBUG=false` di production
- Set password database yang kuat
- Jangan commit file `.env` ke repository

---

## 2. MAJOR — Integritas Data & Logika Bisnis

### 🟠 M-01: Race Condition pada Pembuatan Kode Tiket

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L118-L133)

**Masalah:**
```php
$latest = Proposal::where('kode_tiket', 'like', $prefix . '-%')
                  ->orderBy('id', 'desc')
                  ->first();
// ... tidak ada locking ...
$kode_tiket = $prefix . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
```

Jika dua user submit proposal secara bersamaan, bisa terjadi duplicate kode tiket karena tidak ada database transaction/lock.

**Rekomendasi:**
- Bungkus dengan `DB::transaction()` dan gunakan `lockForUpdate()`
- Atau gunakan database unique constraint (sudah ada) + retry mechanism

---

### 🟠 M-02: Tidak Ada Validasi Transisi Status (State Machine)

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L182-L246)

**Masalah:**
Method `updateStatus` menerima status baru apapun tanpa memvalidasi apakah transisi tersebut valid:

```php
$proposal->status = $request->status; // Langsung assign tanpa validasi
```

Tidak ada pengecekan apakah transisi yang diminta sesuai alur bisnis. Contoh abuse:
- Proposal "Dalam Antrean" langsung diubah ke "Selesai" (skip semua tahapan)
- Proposal "Selesai" diubah kembali ke "Dalam Antrean"
- User (jika bisa akses endpoint) mengubah status sesuka hati

**Rekomendasi:**
Implementasi allowed transitions map:
```php
$allowedTransitions = [
    'Dalam Antrean' => ['Dalam Review', 'Revisi Proposal'],
    'Dalam Review' => ['Revisi Proposal', 'Menunggu Fisik'],
    'Revisi Proposal' => ['Dalam Antrean'],
    'Menunggu Fisik' => ['Dana Cair'],
    'Dana Cair' => ['Menunggu Evidence'],
    'Menunggu Evidence' => ['Menunggu Verif'],
    'Menunggu Verif' => ['Selesai', 'Menunggu Evidence'],
];
```

---

### 🟠 M-03: Race Condition pada Nomor Berita Acara

**File:** [BeritaAcaraController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/BeritaAcaraController.php#L86-L90)

**Masalah:**
Meskipun menggunakan `DB::transaction()`, tidak ada `lockForUpdate()`:

```php
$nomorBa = DB::transaction(function() use ($romanMonth, $now) {
    $count = BeritaAcara::count(); // Bisa race condition
    $nextSeq = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
    return "BA-{$nextSeq}/SIGAP/{$romanMonth}/" . $now->format('Y');
});
```

Penomoran menggunakan `count()` bisa menghasilkan duplikat jika BA dihapus di kemudian hari, karena counter akan "mundur".

**Rekomendasi:**
- Gunakan `MAX()` pada kolom `nomor_ba` atau gunakan tabel counter terpisah dengan `lockForUpdate()`
- Tambahkan unique constraint pada `nomor_ba` (sudah ada di migration — bagus)

---

### 🟠 M-04: Deadline Tidak Di-enforce oleh Sistem

**Masalah:**
Sistem menyetel `revisi_deadline` 3 hari, tetapi tidak ada mekanisme yang:
1. Membatalkan proposal secara otomatis saat deadline terlewat
2. Mengirim reminder sebelum deadline habis
3. Mencegah upload setelah deadline terlewat

Frontend menampilkan warning deadline, tetapi backend **tidak memvalidasi** apakah deadline sudah lewat saat upload proposal/evidence.

**Rekomendasi:**
- Buat Laravel Scheduled Command untuk cek proposal yang melewati deadline
- Tambahkan validasi di `reuploadProposal()` dan `uploadEvidence()`:
  ```php
  if ($proposal->revisi_deadline && Carbon::now()->isAfter($proposal->revisi_deadline)) {
      return response()->json(['message' => 'Deadline sudah terlewat.'], 422);
  }
  ```

---

### 🟠 M-05: Upload Evidence Tidak Cek Ownership

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L249-L297)

**Masalah:**
```php
public function uploadEvidence(Request $request, $id)
{
    $proposal = Proposal::findOrFail($id);
    // Tidak ada pengecekan: $proposal->user_id === $request->user()->id
}
```

User A bisa upload evidence untuk proposal milik User B.

**Hal sama terjadi pada:**
- `reuploadProposal()` — [L299-L325](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L299-L325)
- `addComment()` — [L372-L395](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L372-L395)

**Rekomendasi:**
```php
if ($request->user()->role === 'user' && $proposal->user_id !== $request->user()->id) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

---

### 🟠 M-06: File Lama Tidak Dihapus Saat Evidence Di-upload Ulang

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L249-L267)

**Masalah:**
```php
$evidencePath = $proposal->evidence_dokumen; // Simpan path lama
if ($request->hasFile('evidence_dokumen')) {
    // Upload file baru TANPA menghapus file lama
    $evidencePath = $evidenceFile->storeAs('evidence', $originalName, 'public');
}
```

Setiap kali user upload evidence baru, file lama tetap tersimpan di server tanpa dihapus (orphan files).

**Rekomendasi:**
```php
if ($proposal->evidence_dokumen) {
    Storage::disk('public')->delete($proposal->evidence_dokumen);
}
```

---

### 🟠 M-07: `$guarded = []` pada Model ActivityLog dan Notification

**File:** [ActivityLog.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Models/ActivityLog.php#L12), [Notification.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Models/Notification.php#L12)

**Masalah:**
```php
protected $guarded = []; // Semua field bisa di-mass assign
```

Ini memungkinkan mass assignment attack jika ada endpoint yang menerima input langsung ke model ini.

**Rekomendasi:**
Gunakan `$fillable` secara eksplisit:
```php
protected $fillable = ['user_id', 'name', 'role', 'action', 'description'];
```

---

### 🟠 M-08: Notifikasi Tidak Dikirim Saat Re-upload Proposal

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php#L299-L325)

**Masalah:**
Saat user berhasil upload ulang proposal revisi, status kembali ke "Dalam Antrean" tetapi **tidak ada notifikasi** yang dikirim ke Admin/SuperAdmin. Admin tidak tahu bahwa revisi sudah diupload.

Bandingkan dengan `uploadEvidence()` yang sudah mengirim notifikasi ke admin.

**Rekomendasi:**
Tambahkan notifikasi ke admin setelah re-upload proposal berhasil.

---

## 3. MODERATE — Arsitektur & Maintainability

### 🟡 A-01: Tidak Ada Form Request Validation Class

**Masalah:**
Semua validasi dilakukan inline di controller:
```php
$request->validate([
    'kegiatan' => 'required|string',
    'jenis' => 'required|string',  // Tidak divalidasi terhadap enum yang valid
    ...
]);
```

Field `jenis` divalidasi hanya sebagai `string`, padahal di database menggunakan `enum`. User bisa mengirim nilai apapun.

**Rekomendasi:**
- Buat Form Request classes (`StoreProposalRequest`, `UpdateStatusRequest`, dll.)
- Validasi `jenis` dengan `Rule::in(['Advance', 'Reimburse'])`

---

### 🟡 A-02: Enum `jenis` Inkonsisten antara Migration dan Frontend

**File:** [proposals migration](file:///c:/laragon/www/admin_dashboard_laravel/database/migrations/2026_04_05_105034_create_proposals_table.php#L19)

**Masalah:**
Migration mendefinisikan 4 nilai enum:
```php
$table->enum('jenis', [
    'Advance Payment (Dana Di Depan)', 
    'Reimbursement (Diganti Kemudian)', 
    'Advance', 
    'Reimburse'
]);
```

Frontend hanya mengirim `'Advance'` atau `'Reimburse'`. Ini berarti 2 dari 4 enum values tidak pernah digunakan — menunjukkan tech debt dari iterasi sebelumnya.

**Rekomendasi:**
- Buat migration baru untuk menghapus enum values yang tidak digunakan
- Atau ubah ke `string` type jika ingin fleksibel

---

### 🟡 A-03: Fat Controller — ProposalController Terlalu Besar

**File:** [ProposalController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/ProposalController.php) — 437 baris

**Masalah:**
Satu controller menangani 10+ concerns:
- CRUD Proposal
- Status management
- File uploads (3 jenis berbeda)
- Activity logging
- Notifikasi
- CSV Export
- File preview
- Comments

**Rekomendasi:**
Pecah menjadi Service classes:
- `ProposalService` — Business logic
- `FileUploadService` — File handling
- `NotificationService` — Notifikasi
- `ActivityLogService` — Logging

---

### 🟡 A-04: Tidak Ada Middleware `EnsureFrontendRequestsAreStateful`

**File:** [Kernel.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Kernel.php#L42)

**Masalah:**
```php
'api' => [
    // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    // ^ Dikomentari
],
```

Ini berarti SPA tidak bisa menggunakan cookie-based authentication Sanctum. Semua request harus mengirim token via header, yang sudah ditangani di frontend — tetapi ini menghilangkan proteksi CSRF.

**Rekomendasi:**
- Aktifkan `EnsureFrontendRequestsAreStateful` jika frontend dan backend di domain yang sama
- Atau pastikan token disimpan secara aman (bukan di localStorage yang rentan XSS)

---

### 🟡 A-05: Duplikasi Kode Utility di Frontend

**File:** [utils.js](file:///c:/laragon/www/admin_dashboard_laravel/resources/js/components/shared/utils.js) dan [UserPortal.jsx](file:///c:/laragon/www/admin_dashboard_laravel/resources/js/components/UserPortal.jsx#L9-L21)

**Masalah:**
`formatRupiah()` dan `getStatusClass()` didefinisikan di **dua tempat** yang berbeda — di `utils.js` (untuk admin) dan diduplikat langsung di `UserPortal.jsx` (untuk user portal).

**Rekomendasi:**
Import dari satu source of truth (`utils.js`) di semua komponen.

---

### 🟡 A-06: Status Proposal Menggunakan Free-text String

**Masalah:**
Status proposal disimpan sebagai `string` di database tanpa enum constraint:
```php
$table->string('status')->default('Dalam Antrean');
```

Ini memungkinkan typo atau value tidak valid masuk ke database. Bandingkan di frontend, status ditulis sebagai string literal di berbagai tempat yang rawan inkonsistensi.

**Rekomendasi:**
- Ubah ke `enum` di database
- Buat PHP Enum class (`ProposalStatus`)
- Definisikan constants di frontend

---

### 🟡 A-07: Pagination di LogsPage Memanggil `fetchProposals` Bukan `fetchLogs`

**File:** [AdminPages.jsx](file:///c:/laragon/www/admin_dashboard_laravel/resources/js/components/pages/AdminPages.jsx#L192)

**Masalah:**
```jsx
// Di LogsPage
<Pagination currentPage={currentPage} totalPages={totalPages} onFetch={fetchProposals} />
//                                                                      ^^^^^^^^^^^^^^
// Seharusnya fetchLogs!
```

Pagination di halaman Activity Log memanggil `fetchProposals` alih-alih `fetchLogs`, sehingga **navigasi halaman di Activity Log tidak berfungsi dengan benar**.

**Rekomendasi:**
Ganti `onFetch={fetchProposals}` dengan `onFetch={fetchLogs}`.

---

## 4. MINOR — UX & Polish

### 🟢 U-01: Notifikasi Tidak Real-time

**Masalah:**
Notifikasi saat ini menggunakan polling (atau bahkan manual refresh). Tidak ada WebSocket/SSE/Pusher yang dikonfigurasi meskipun environment variables Pusher sudah ada di `.env`.

**Rekomendasi:**
- Implementasi polling berkala (setiap 30 detik) sebagai quick win
- Atau aktifkan Laravel Broadcasting + Pusher/Soketi untuk real-time

---

### 🟢 U-02: Tidak Ada Loading State & Error Handling yang Konsisten

**Masalah:**
Beberapa aksi (upload, update status) tidak menampilkan loading indicator. Jika request gagal, feedback hanya berupa toast generic.

**Rekomendasi:**
- Tambahkan loading spinner pada semua action buttons
- Tampilkan error message yang lebih deskriptif

---

### 🟢 U-03: Tidak Ada Konfirmasi Sebelum Aksi Penting

**Masalah:**
Tombol "✔ Acc" di halaman Verifikasi Evidence langsung mengubah status ke "Selesai" tanpa dialog konfirmasi. Ini juga berlaku untuk "✖ Tolak". Aksi kritis seperti ini seharusnya memerlukan konfirmasi.

**File:** [AdminPages.jsx](file:///c:/laragon/www/admin_dashboard_laravel/resources/js/components/pages/AdminPages.jsx#L100-L101)

**Rekomendasi:**
- Tambahkan modal konfirmasi sebelum aksi irreversible
- Minimal gunakan `window.confirm()`

---

### 🟢 U-04: Token Sanctum Tidak Punya Expiry

**File:** [AuthController.php](file:///c:/laragon/www/admin_dashboard_laravel/app/Http/Controllers/Api/AuthController.php#L29)

**Masalah:**
```php
$token = $user->createToken('auth-token')->plainTextToken;
```

Token dibuat tanpa expiry time. Sekali token bocor, bisa digunakan selamanya.

**Rekomendasi:**
- Set `expiration` di `config/sanctum.php`
- Atau buat token dengan abilities dan expiry: `createToken('auth', ['*'], now()->addHours(8))`

---

### 🟢 U-05: Tidak Ada Fitur Logout / Revoke Token

**Masalah:**
Tidak ada endpoint `/api/logout` untuk menghapus token. User tidak bisa log out secara aman.

**Rekomendasi:**
```php
Route::post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out']);
});
```

---

### 🟢 U-06: Tidak Ada Manajemen User (CRUD User)

**Masalah:**
SuperAdmin tidak memiliki kemampuan untuk:
- Menambah user baru
- Mengubah role user
- Menonaktifkan user
- Reset password

Semua user di-seed manual via database.

**Rekomendasi:**
- Buat modul User Management untuk SuperAdmin
- Minimal: tambah user, edit role, enable/disable akun

---

## Audit Per-Role

### 👤 Role: User / Pemohon

| Area | Status | Catatan |
|------|:------:|---------|
| Login | 🔴 | Tanpa password — siapa saja bisa login sebagai user manapun |
| Submit Proposal | 🟡 | Validasi backend kurang ketat (`file_proposal` nullable) |
| Track Progress | ✅ | Timeline dan detail berfungsi baik |
| Upload Revisi | 🟠 | Tidak ada cek ownership, tidak ada cek deadline, admin tidak dinotifikasi |
| Upload Evidence | 🟠 | Tidak ada cek ownership, file lama tidak dihapus |
| Lihat Berita Acara | 🔴 | Endpoint publik tanpa autentikasi |
| Notifikasi | 🟡 | Berfungsi tapi tidak real-time |
| Logout | 🔴 | Tidak ada fitur logout |

**Yang bisa dimaksimalkan:**
- Tambahkan halaman riwayat/arsip proposal yang sudah selesai
- Tambahkan notifikasi email/WhatsApp selain in-app notification
- Tambahkan fitur edit proposal sebelum di-review admin
- Tampilkan progress percentage di dashboard user

---

### 👨‍💼 Role: Admin / Reviewer

| Area | Status | Catatan |
|------|:------:|---------|
| Login | 🔴 | Tanpa password |
| Dashboard Stats | ✅ | Chart dan statistik berfungsi baik |
| Update Status | 🟠 | Tidak ada validasi transisi status yang valid |
| Upload Bukti Transfer | 🟡 | Berfungsi, tapi tidak ada otorisasi role di backend |
| Verifikasi Evidence | 🟡 | Aksi langsung tanpa konfirmasi |
| Generate Berita Acara | ✅ | Validasi status sudah ada, nomor BA sequential |
| Activity Log | 🟡 | Bisa diakses semua role (seharusnya hanya superadmin) |
| Ekspor CSV | ✅ | Berfungsi baik |
| Delete Comment | ✅ | Ada role check di backend |

**Yang bisa dimaksimalkan:**
- Tambahkan batch operations (approve/reject multiple proposals)
- Tambahkan filter berdasarkan pemohon/instansi
- Tambahkan dashboard analytics yang lebih advanced (trend line, comparison)
- Tambahkan kemampuan menambahkan catatan tanpa mengubah status
- Tambahkan fitur arsip/soft delete proposal

---

### 👑 Role: SuperAdmin / Master

| Area | Status | Catatan |
|------|:------:|---------|
| Semua fitur Admin | 🟠 | Sama seperti Admin — tidak ada fitur tambahan yang exclusive |
| Activity Log | 🟡 | Bisa diakses semua role |
| Master Database | ✅ | Berfungsi baik |
| User Management | ❌ | Tidak ada — tidak bisa manage user |
| System Settings | ❌ | Tidak ada — tidak bisa konfigurasi sistem |
| Role diff vs Admin | ⚠️ | Praktis tidak ada perbedaan fungsionalitas |

**Yang bisa dimaksimalkan:**
- Buat modul User Management (CRUD user, assign role)
- Buat modul System Settings (konfigurasi deadline, template BA)
- Buat exclusive access ke Activity Log
- Tambahkan audit trail yang lebih detail (IP address, user agent)
- Tambahkan fitur backup database
- Tambahkan laporan keuangan aggregate (total dana per bulan/instansi)
- Buat role hierarchy yang jelas: SuperAdmin > Admin > User

---

## Rekomendasi Prioritas Implementasi

### 🏁 Fase 1 — Security Hardening (Wajib sebelum Production)

| # | Item | Effort |
|---|------|--------|
| 1 | Implementasi login dengan email + password | Medium |
| 2 | Buat middleware CheckRole dan pasang di semua route | Medium |
| 3 | Pindahkan preview-file ke auth middleware + validasi path | Low |
| 4 | Pindahkan BA preview/download ke auth middleware | Low |
| 5 | Hapus route `/test-upload` | Trivial |
| 6 | Set `APP_DEBUG=false`, password DB | Trivial |
| 7 | Tambahkan endpoint logout + token expiry | Low |

### 🏁 Fase 2 — Business Logic Integrity

| # | Item | Effort |
|---|------|--------|
| 1 | Implementasi State Machine untuk transisi status | Medium |
| 2 | Tambahkan ownership check di upload endpoint | Low |
| 3 | Fix race condition kode tiket & nomor BA | Low |
| 4 | Enforce deadline di backend | Low |
| 5 | Bersihkan orphan files saat re-upload | Low |
| 6 | Tambahkan notifikasi saat re-upload proposal | Low |
| 7 | Fix pagination LogsPage (bug: memanggil `fetchProposals`) | Trivial |

### 🏁 Fase 3 — Architecture & Quality

| # | Item | Effort |
|---|------|--------|
| 1 | Refactor ke Form Request classes | Medium |
| 2 | Refactor fat controller ke Service classes | Medium |
| 3 | Konsolidasi duplikasi utility frontend | Low |
| 4 | Ubah status ke enum | Low |
| 5 | Aktifkan `EnsureFrontendRequestsAreStateful` | Low |

### 🏁 Fase 4 — Feature Enhancement

| # | Item | Effort |
|---|------|--------|
| 1 | User Management module untuk SuperAdmin | High |
| 2 | Real-time notifications (WebSocket/Pusher) | Medium |
| 3 | Loading states & error handling konsisten | Medium |
| 4 | Konfirmasi modal untuk aksi penting | Low |
| 5 | Fitur arsip proposal | Medium |

---

> [!IMPORTANT]
> **Fase 1 (Security Hardening) harus diselesaikan sebelum aplikasi di-deploy ke production.** Tanpa item-item ini, sistem rentan terhadap akses tidak sah yang bisa mengakibatkan kebocoran data keuangan dan dokumen resmi.
