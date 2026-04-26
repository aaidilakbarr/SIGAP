<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Proposal;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'nomor_telepon' => '081111111111',
                'instansi' => 'Pusat',
                'whatsapp' => '08111111111',
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'nomor_telepon' => '082222222222',
                'instansi' => 'Fakultas',
                'whatsapp' => '08222222222',
            ]
        );

        $user1 = User::firstOrCreate(
            ['email' => 'user1@example.com'],
            [
                'name' => 'Ahmad Fauzi',
                'password' => Hash::make('password'),
                'role' => 'user',
                'nomor_telepon' => '081234567891',
                'instansi' => 'FKIP Univ. Negeri',
                'whatsapp' => '08123456789',
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'user2@example.com'],
            [
                'name' => 'Siti Rahma',
                'password' => Hash::make('password'),
                'role' => 'user',
                'nomor_telepon' => '081298765432',
                'instansi' => 'Fak. Ekonomi',
                'whatsapp' => '08129876543',
            ]
        );

        // Proposals
        Proposal::firstOrCreate(
            ['kode_tiket' => 'PRO-001'],
            [
                'user_id' => $user1->id,
                'kegiatan' => 'Seminar Nasional AI',
                'jenis' => 'Advance',
                'tgl_pelaksanaan' => '2025-06-28',
                'dana_diajukan' => 7500000,
                'status' => 'Dalam Review',
            ]
        );

        Proposal::firstOrCreate(
            ['kode_tiket' => 'PRO-002'],
            [
                'user_id' => $user2->id,
                'kegiatan' => 'Workshop Kewirausahaan',
                'jenis' => 'Advance',
                'tgl_pelaksanaan' => '2025-06-30',
                'dana_diajukan' => 5000000,
                'status' => 'Dalam Antrean',
            ]
        );

        Proposal::firstOrCreate(
            ['kode_tiket' => 'PRO-003'],
            [
                'user_id' => $user1->id,
                'kegiatan' => 'PKM Pengabdian',
                'jenis' => 'Reimburse',
                'tgl_pelaksanaan' => '2025-06-20',
                'dana_diajukan' => 5000000,
                'status' => 'Menunggu Evidence',
            ]
        );

        Proposal::firstOrCreate(
            ['kode_tiket' => 'PRO-004'],
            [
                'user_id' => $user2->id,
                'kegiatan' => 'Kuliah Umum Intl',
                'jenis' => 'Advance',
                'tgl_pelaksanaan' => '2025-07-05',
                'dana_diajukan' => 15000000,
                'status' => 'Menunggu Fisik',
            ]
        );

        Proposal::firstOrCreate(
            ['kode_tiket' => 'PRO-005'],
            [
                'user_id' => $user1->id,
                'kegiatan' => 'Riset Kolaboratif',
                'jenis' => 'Advance',
                'tgl_pelaksanaan' => '2025-06-10',
                'dana_diajukan' => 8500000,
                'status' => 'Selesai',
            ]
        );
    }
}
