<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeritaAcara extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'nomor_ba',
        'generated_by',
        'catatan_admin',
        'file_path',
    ];

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
