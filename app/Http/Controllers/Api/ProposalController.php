<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proposal;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'user') {
            $proposals = Proposal::with('user')->where('user_id', $user->id)->get();
        } else {
            $proposals = Proposal::with('user')->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $proposals
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kegiatan' => 'required|string',
            'jenis' => 'required|string',
            'tgl_pelaksanaan' => 'required|date',
            'dana_diajukan' => 'required|numeric',
            'file_proposal' => 'nullable|file'
        ]);

        $latest = Proposal::orderBy('id', 'desc')->first();
        $nextId = $latest ? $latest->id + 1 : 1;
        $kode_tiket = 'PRO-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

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
            'status' => 'Dalam Antrean'
        ]);

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function updateStatus(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->status = $request->status;
        $proposal->save();

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }

    public function uploadEvidence(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        
        $evidencePath = $proposal->evidence_dokumen;
        if ($request->hasFile('evidence_dokumen')) {
            $evidencePath = $request->file('evidence_dokumen')->store('evidence', 'public');
        }
        
        $proposal->evidence_dokumen = $evidencePath;
        $proposal->status = 'Menunggu Verif';
        $proposal->save();

        return response()->json(['status' => 'success', 'data' => $proposal]);
    }
}
