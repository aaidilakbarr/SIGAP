<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_tiket',
        'user_id',
        'kegiatan',
        'jenis',
        'tgl_pelaksanaan',
        'dana_diajukan',
        'file_proposal',
        'catatan',
        'status',
        'bukti_transfer',
        'evidence_dokumen',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(ProposalComment::class);
    }
}
