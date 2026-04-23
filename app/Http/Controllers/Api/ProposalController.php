<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proposal;
use App\Models\ActivityLog;
use App\Models\ProposalComment;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Proposal::with(['user', 'comments.user']);
        
        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }
        
        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('kode_tiket', 'like', "%{$s}%")
                  ->orWhere('kegiatan', 'like', "%{$s}%")
                  ->orWhere('jenis', 'like', "%{$s}%")
                  ->orWhereHas('user', function($uq) use ($s) {
                      $uq->where('name', 'like', "%{$s}%")
                         ->orWhere('instansi', 'like', "%{$s}%");
                  });
            });
        }
        
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('tgl_pelaksanaan', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('tgl_pelaksanaan', '<=', $request->date_to);
        }
        
        $query->orderBy('created_at', 'desc');
        
        if ($request->has('export') && $request->export == '1') {
            $proposals = $query->get();
        } else {
            $proposals = $query->paginate(10);
        }

        return response()->json([
            'status' => 'success',
            'data' => $proposals
        ]);
    }

    public function getStats(Request $request)
    {
        $user = $request->user();
        $query = Proposal::query();
        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        }
        
        // Month filter for status array
        $statusQuery = clone $query;
        if ($request->has('month') && $request->month !== '') {
            // MySQL month is 1-12, js month is 0-11
            $month = intval($request->month) + 1;
            $statusQuery->whereMonth('tgl_pelaksanaan', $month);
        }
        
        $statusCounts = $statusQuery->selectRaw('status, count(*) as total')
                                    ->groupBy('status')
                                    ->pluck('total', 'status')
                                    ->toArray();
                                    
        $monthlyCountsQuery = clone $query;
        $monthlyData = $monthlyCountsQuery->selectRaw('MONTH(tgl_pelaksanaan) as month, count(*) as total')
                                          ->whereNotNull('tgl_pelaksanaan')
                                          ->groupBy('month')
                                          ->pluck('total', 'month')
                                          ->toArray();
                                          
        return response()->json([
            'status' => 'success',
            'data' => [
                'status_counts' => $statusCounts,
                'monthly_counts' => $monthlyData,
                'total_queue' => (clone $query)->where('status', '!=', 'Selesai')->count(),
                'total_review' => (clone $query)->where('status', 'Dalam Review')->count(),
                'total_evidence' => (clone $query)->where('status', 'Menunggu Evidence')->count(),
                'total_verif' => (clone $query)->where('status', 'Menunggu Verif')->count(),
                'total_selesai' => (clone $query)->where('status', 'Selesai')->count()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kegiatan' => 'required|string',
            'jenis' => 'required|string',
            'tgl_pelaksanaan' => 'required|date',
            'dana_diajukan' => 'required|numeric',
            'file_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'nama_bank' => 'nullable|string',
            'nomor_rekening' => 'nullable|string'
        ]);

        $now = \Carbon\Carbon::now();
        $prefix = 'PRO-' . $now->format('Ym');
        
        $latest = Proposal::where('kode_tiket', 'like', $prefix . '-%')
                          ->orderBy('id', 'desc')
                          ->first();
                          
        if ($latest) {
            $parts = explode('-', $latest->kode_tiket);
            $lastNumber = intval(end($parts));
            $nextId = $lastNumber + 1;
        } else {
            $nextId = 1;
        }
        
        $kode_tiket = $prefix . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        $path = null;
        if ($request->hasFile('file_proposal')) {
            $file = $request->file('file_proposal');
            if (!$file->isValid()) {
                return response()->json(['message' => 'Gagal mengupload file proposal. Ukuran file mungkin terlalu besar atau format tidak didukung.'], 422);
            }
            $path = $file->store('proposals', 'public');
        }

        $proposal = Proposal::create([
            'kode_tiket' => $kode_tiket,
            'user_id' => $request->user()->id,
            'kegiatan' => $request->kegiatan,
            'jenis' => $request->jenis,
            'tgl_pelaksanaan' => $request->tgl_pelaksanaan,
            'dana_diajukan' => $request->dana_diajukan,
            'catatan' => $request->catatan,
            'file_proposal' => $path,
            'status' => 'Dalam Antrean',
            'nama_bank' => $request->nama_bank,
            'nomor_rekening' => $request->nomor_rekening
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Mengajukan Proposal Baru',
            'description' => "Proposal {$kode_tiket} diajukan untuk kegiatan {$request->kegiatan}."
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function updateStatus(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $oldStatus = $proposal->status;
        $proposal->status = $request->status;

        if ($request->status === 'Revisi Proposal') {
            if ($proposal->file_proposal) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($proposal->file_proposal);
            }
            $proposal->file_proposal = null;
            $proposal->revisi_deadline = \Carbon\Carbon::now()->addDays(3);
        }

        if ($request->status === 'Menunggu Evidence') {
            if ($oldStatus === 'Menunggu Verif' && $proposal->evidence_dokumen) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($proposal->evidence_dokumen);
                $proposal->evidence_dokumen = null;
            }
            // Always set deadline when requesting evidence
            $proposal->revisi_deadline = \Carbon\Carbon::now()->addDays(3);
        }

        $proposal->save();

        if ($request->filled('catatan_revisi')) {
            ProposalComment::create([
                'user_id' => $request->user()->id,
                'proposal_id' => $proposal->id,
                'komentar' => $request->catatan_revisi,
            ]);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Update Status Proposal',
            'description' => "Status proposal {$proposal->kode_tiket} diubah dari {$oldStatus} menjadi {$request->status}."
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function uploadEvidence(Request $request, $id)
    {
        $request->validate([
            'evidence_dokumen' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);

        $proposal = Proposal::findOrFail($id);
        
        $evidencePath = $proposal->evidence_dokumen;
        if ($request->hasFile('evidence_dokumen')) {
            $evidencePath = $request->file('evidence_dokumen')->store('evidence', 'public');
        }
        
        $proposal->evidence_dokumen = $evidencePath;
        $proposal->status = 'Menunggu Verif';
        $proposal->revisi_deadline = null;
        $proposal->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Upload Evidence',
            'description' => "Pengguna mengunggah evidence untuk proposal {$proposal->kode_tiket}."
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function reuploadProposal(Request $request, $id)
    {
        $request->validate([
            'file_proposal' => 'required|file|mimes:pdf,doc,docx|max:10240'
        ]);

        $proposal = Proposal::findOrFail($id);
        
        $path = $request->file('file_proposal')->store('proposals', 'public');
        
        $proposal->file_proposal = $path;
        $proposal->status = 'Dalam Antrean';
        $proposal->revisi_deadline = null;
        $proposal->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Upload Ulang Proposal',
            'description' => "Pengguna mengunggah ulang file proposal {$proposal->kode_tiket} setelah diminta revisi."
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function uploadBuktiTransfer(Request $request, $id)
    {
        $request->validate([
            'bukti_transfer' => 'required|mimes:pdf|max:5120'
        ]);

        $proposal = Proposal::findOrFail($id);
        
        $path = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
        
        $oldStatus = $proposal->status;
        $proposal->bukti_transfer = $path;
        $proposal->status = 'Dana Cair';
        $proposal->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Upload Bukti Transfer',
            'description' => "Admin mengunggah bukti pengiriman dana PDF untuk {$proposal->kode_tiket}. Status dari {$oldStatus} ke Dana Cair."
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function getLogs()
    {
        $logs = ActivityLog::orderBy('created_at', 'desc')->paginate(10);
        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    public function addComment(Request $request, $id)
    {
        $request->validate([
            'komentar' => 'required|string'
        ]);

        $proposal = Proposal::findOrFail($id);
        
        $comment = ProposalComment::create([
            'proposal_id' => $proposal->id,
            'user_id' => $request->user()->id,
            'komentar' => $request->komentar
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'name' => $request->user()->name,
            'role' => $request->user()->role,
            'action' => 'Komentar Proposal',
            'description' => "Menambahkan komentar pada proposal {$proposal->kode_tiket}."
        ]);

        return response()->json(['status' => 'success', 'data' => $comment->load('user')]);
    }

    public function deleteComment(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['superadmin', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment = ProposalComment::findOrFail($id);
        $proposalId = $comment->proposal_id;
        $comment->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'action' => 'Hapus Catatan Revisi',
            'description' => "Menghapus catatan revisi pada proposal ID {$proposalId}."
        ]);

        return response()->json(['status' => 'success']);
    }
}
