<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\BeritaAcara;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BeritaAcaraController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BeritaAcara::with(['proposal.user', 'generatedBy']);

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('nomor_ba', 'like', "%{$s}%")
                  ->orWhereHas('proposal', function($pq) use ($s) {
                      $pq->where('kode_tiket', 'like', "%{$s}%")
                         ->orWhere('kegiatan', 'like', "%{$s}%")
                         ->orWhereHas('user', function($uq) use ($s) {
                             $uq->where('name', 'like', "%{$s}%");
                         });
                  });
            });
        }

        // Users can only view their own proposal's Berita Acara
        if ($user->role === 'user') {
            $query->whereHas('proposal', function($pq) use ($user) {
                $pq->where('user_id', $user->id);
            });
        }

        $beritaAcaras = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $beritaAcaras
        ]);
    }

    public function generate(Request $request, $proposalId)
    {
        $user = $request->user();

        // 1. Authorization: admin or superadmin only
        if (!in_array($user->role, ['admin', 'superadmin', 'reviewer', 'master'])) {
            return response()->json(['message' => 'Unauthorized. Only Admins can generate Berita Acara.'], 403);
        }

        // 2. Find Proposal
        $proposal = Proposal::with('user')->findOrFail($proposalId);

        // 3. Validation: status must be 'Selesai'
        if ($proposal->status !== 'Selesai') {
            return response()->json(['message' => 'Berita Acara hanya dapat dibuat untuk proposal yang sudah SELESAI.'], 422);
        }

        // 4. Validation: BA must not already exist
        if ($proposal->beritaAcara) {
            return response()->json(['message' => 'Berita Acara untuk proposal ini sudah pernah dibuat.'], 422);
        }

        // 5. Generate BA Nomor sequentially
        $now = Carbon::now();
        
        $romanMonths = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        $romanMonth = $romanMonths[$now->format('n')];

        // Using transaction/lock for safe sequential generation
        $nomorBa = DB::transaction(function() use ($romanMonth, $now) {
            $count = BeritaAcara::count();
            $nextSeq = str_pad($count + 1, 3, '0', STR_PAD_LEFT);
            return "BA-{$nextSeq}/SIGAP/{$romanMonth}/" . $now->format('Y');
        });

        // 6. Define localized Indonesian date parameters
        $days = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu'
        ];
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $hari = $days[$now->format('l')];
        $tanggal = $now->format('d') . ' ' . $months[$now->format('n')] . ' ' . $now->format('Y');

        // Create temporary BA record instance for rendering (needed for relations or numbers)
        $beritaAcara = new BeritaAcara();
        $beritaAcara->nomor_ba = $nomorBa;
        $beritaAcara->generated_by = $user->id;
        $beritaAcara->generatedBy = $user;
        $beritaAcara->catatan_admin = $request->catatan_admin;
        $beritaAcara->created_at = $now;

        // 7. Render PDF using DomPDF
        $pdf = Pdf::loadView('pdf.berita_acara', compact('beritaAcara', 'proposal', 'hari', 'tanggal'));
        
        // Ensure folder public/storage/berita_acara exists
        if (!Storage::disk('public')->exists('berita_acara')) {
            Storage::disk('public')->makeDirectory('berita_acara');
        }

        // File name & path
        $filename = 'BA_' . str_replace('/', '_', $nomorBa) . '_' . time() . '.pdf';
        $filePath = 'berita_acara/' . $filename;

        // Save PDF to public storage
        Storage::disk('public')->put($filePath, $pdf->output());

        // 8. Save BA to DB
        $dbBeritaAcara = BeritaAcara::create([
            'proposal_id' => $proposal->id,
            'nomor_ba' => $nomorBa,
            'generated_by' => $user->id,
            'catatan_admin' => $request->catatan_admin,
            'file_path' => $filePath,
        ]);

        // 9. Logs
        ActivityLog::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'action' => 'Generate Berita Acara',
            'description' => "Berita Acara {$nomorBa} berhasil di-generate untuk proposal {$proposal->kode_tiket}."
        ]);

        // 10. Send Notifications to User/Pemohon
        Notification::create([
            'user_id' => $proposal->user_id,
            'title' => 'Berita Acara Diterbitkan',
            'message' => "Berita Acara dengan nomor {$nomorBa} telah diterbitkan untuk proposal {$proposal->kode_tiket} Anda.",
            'is_read' => false
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Berita Acara berhasil di-generate.',
            'data' => $dbBeritaAcara->load(['proposal', 'generatedBy'])
        ]);
    }

    public function preview($proposalId)
    {
        $proposal = Proposal::findOrFail($proposalId);
        $beritaAcara = $proposal->beritaAcara;

        if (!$beritaAcara) {
            abort(404, 'Berita Acara belum dibuat untuk proposal ini.');
        }

        if (!Storage::disk('public')->exists($beritaAcara->file_path)) {
            abort(404, 'File PDF tidak ditemukan di server.');
        }

        $file = Storage::disk('public')->get($beritaAcara->file_path);
        $mimeType = Storage::disk('public')->mimeType($beritaAcara->file_path);

        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline; filename="' . basename($beritaAcara->file_path) . '"');
    }

    public function download($proposalId)
    {
        $proposal = Proposal::findOrFail($proposalId);
        $beritaAcara = $proposal->beritaAcara;

        if (!$beritaAcara) {
            abort(404, 'Berita Acara belum dibuat untuk proposal ini.');
        }

        if (!Storage::disk('public')->exists($beritaAcara->file_path)) {
            abort(404, 'File PDF tidak ditemukan di server.');
        }

        return Storage::disk('public')->download($beritaAcara->file_path, basename($beritaAcara->file_path));
    }
}
