# Admin Dashboard 

Proyek ini adalah aplikasi Admin Dashboard interaktif yang dibangun menggunakan **Laravel 10** sebagai backend/API dan **React** (dengan Vite) sebagai frontend.

## Persyaratan Sistem (Prerequisites)
Sebelum menjalankan proyek ini, pastikan sistem Anda telah terinstal beberapa perangkat lunak berikut:

- [PHP](https://www.php.net/downloads) (Versi 8.1 atau lebih baru)
- [Composer](https://getcomposer.org/) (Untuk manajemen dependensi PHP)
- [Node.js & npm](https://nodejs.org/) (Untuk manajemen dependensi JavaScript dan Vite server)
- Database server (Opsional: **MySQL**, MariaDB, atau PostgreSQL. Anda juga bisa langsung menggunakan **SQLite** untuk proses yang lebih cepat)
- Git (opsional, untuk melakukan clone)

## Cara Clone Proyek
Jika proyek ini sudah ada di dalam repository Git Anda (seperti GitHub/GitLab), jalankan perintah berikut di terminal:

```bash
git clone <URL_REPOSITORY_ANDA>
cd admin-dashboard-laravel
```
*(Ganti `<URL_REPOSITORY_ANDA>` dengan link repositori yang sesuai)*

## Cara Setup Proyek

Setelah berhasil melakukan clone, ikuti langkah-langkah di bawah ini untuk mengatur backend (Laravel) dan frontend (React).

### 1. Konfigurasi Backend (Laravel)

1. Buka terminal pada folder/direktori proyek (`admin-dashboard-laravel`).
2. Instal semua dependensi PHP dengan Composer:
   ```bash
   composer install
   ```
3. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Di Windows, Anda bisa menggunakan `copy .env.example .env` atau menyalinnya secara manual menggunakan file explorer)*
4. Buat kunci aplikasi Laravel (App Key):
   ```bash
   php artisan key:generate
   ```
5. Sesuaikan konfigurasi database. Buka file `.env` dan perbarui bagian pengaturan koneksi databasenya. Anda bisa memilih menggunakan MySQL atau SQLite:

   **Opsi A: Menggunakan MySQL (Laragon / XAMPP)**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nama_database_anda
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *(Pastikan Anda telah membuat database kosong di MySQL dengan nama yang sesuai sebelum melanjutkan)*.

   **Opsi B: Menggunakan SQLite (Setup Sangat Cepat & Mudah di Laragon)**
   ```env
   DB_CONNECTION=sqlite
   ```
   *(Hapus atau beri komentar/tanda `#` pada baris `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD`. Nanti saat Anda menjalankan migrasi di langkah ke-6, Laravel secara otomatis akan menanyakan apakah Anda ingin membuat file `database.sqlite` jika file-nya belum ada).*
6. Jalankan migrasi database (dan seeder jika ada data dummy):
   ```bash
   php artisan migrate
   # atau jika Anda memiliki data dummy/seeder:
   # php artisan migrate --seed
   ```
7. Buat link storage (untuk mengakses dan menyimpan file/gambar melalui folder public):
   ```bash
   php artisan storage:link
   ```

### 2. Konfigurasi Frontend (React & Vite)
1. Buka kembali terminal di folder proyek yang sama.
2. Instal semua dependensi JavaScript/Node:
   ```bash
   npm install
   ```

## Cara Menjalankan Proyek

Untuk menjalankan proyek secara komprehensif, Anda perlu menjalankan **dua proses secara bersamaan** (sebaiknya gunakan dua tab/jendela terminal yang berbeda).

**Terminal 1 (Menjalankan server backend PHP/Laravel):**
```bash
php artisan serve
```
*(Server backend biasanya akan berjalan di `http://127.0.0.1:8000`)*

**Terminal 2 (Menjalankan server frontend React/Vite):**
```bash
npm run dev
```
*(Server development untuk aset frontend akan berjalan)*

> 🚀 **Selesai!** Anda sekarang dapat membuka aplikasi dengan mengakses `http://127.0.0.1:8000` atau URL lokal yang disediakan oleh Laravel Artisan/Vite di web browser Anda.
