<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Berita Acara - {{ $beritaAcara->nomor_ba }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #1a202c;
            margin: 0;
            padding: 10px;
        }
        /* Kop Surat Styles */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 3px double #1a202c;
            margin-bottom: 25px;
        }
        .kop-logo {
            width: 70px;
            vertical-align: middle;
            padding-bottom: 10px;
        }
        .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-bottom: 10px;
        }
        .kop-title {
            font-size: 16pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1b4d3e; /* Sleek forest green accent */
        }
        .kop-subtitle {
            font-size: 10pt;
            margin: 3px 0 0 0;
            color: #4a5568;
            font-style: italic;
        }
        .kop-address {
            font-size: 9pt;
            margin: 3px 0 0 0;
            color: #718096;
        }

        /* Document Title */
        .doc-title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            text-decoration: underline;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .doc-number {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 30px;
            color: #4a5568;
        }

        /* Content Styles */
        .opening-text {
            text-align: justify;
            margin-bottom: 20px;
            text-indent: 30px;
        }
        
        /* Table Styles */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .data-table td {
            padding: 8px 10px;
            vertical-align: top;
        }
        .data-table td.label {
            width: 30%;
            font-weight: bold;
            color: #4a5568;
            border-bottom: 1px solid #e2e8f0;
        }
        .data-table td.value {
            width: 70%;
            border-bottom: 1px solid #e2e8f0;
        }
        
        /* Highlight box for Selesai */
        .status-badge {
            display: inline-block;
            background-color: #def7ec;
            color: #03543f;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10pt;
            text-transform: uppercase;
        }

        /* Notes Section */
        .notes-section {
            background-color: #f7fafc;
            border-left: 4px solid #1b4d3e;
            padding: 12px 15px;
            margin-bottom: 30px;
            border-radius: 0 4px 4px 0;
        }
        .notes-title {
            font-weight: bold;
            font-size: 11pt;
            color: #1b4d3e;
            margin-bottom: 5px;
        }
        .notes-content {
            font-style: italic;
            color: #4a5568;
        }

        /* Closing text */
        .closing-text {
            text-align: justify;
            margin-bottom: 40px;
        }

        /* Signature Table */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }
        .signature-cell {
            width: 50%;
            text-align: center;
        }
        .signature-role {
            font-weight: bold;
            margin-bottom: 60px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .signature-title {
            font-size: 10pt;
            color: #718096;
        }
    </style>
</head>
<body>

    <!-- Kop Surat -->
    <table class="kop-table">
        <tr>
            @if(file_exists(public_path('icon_web.png')))
                <td class="kop-logo">
                    <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('icon_web.png'))) }}" width="60" height="60" alt="Logo">
                </td>
            @endif
            <td class="kop-text" style="{{ file_exists(public_path('icon_web.png')) ? 'padding-right: 60px;' : '' }}">
                <div class="kop-title">Sistem Informasi Gerak Alur Proposal (SIGAP)</div>
                <div class="kop-subtitle">Sistem Verifikasi, Monitoring, dan Pengawasan Pencairan Dana Hibah</div>
                <div class="kop-address">Jln. Raya Protokol No. 123, Blok C, Jakarta • Telp: (021) 123-4567 • Email: support@sigap.go.id</div>
            </td>
        </tr>
    </table>

    <!-- Document Title -->
    <div class="doc-title">Berita Acara Verifikasi Proposal</div>
    <div class="doc-number">Nomor: {{ $beritaAcara->nomor_ba }}</div>

    <!-- Opening Text -->
    <div class="opening-text">
        Pada hari ini, <strong>{{ $hari }}</strong>, tanggal <strong>{{ $tanggal }}</strong>, bertempat di Kantor Administrasi SIGAP, yang bertanda tangan di bawah ini menyatakan bahwa dokumen laporan dan verifikasi proposal kegiatan telah diperiksa secara seksama dan dinyatakan selesai dengan rincian data sebagai berikut:
    </div>

    <!-- Data Table -->
    <table class="data-table">
        <tr>
            <td class="label">Kode Tiket</td>
            <td class="value" style="font-weight: bold; font-family: monospace; font-size: 11pt;">{{ $proposal->kode_tiket }}</td>
        </tr>
        <tr>
            <td class="label">Nama Pemohon</td>
            <td class="value">{{ $proposal->user->name }}</td>
        </tr>
        <tr>
            <td class="label">Instansi / Lembaga</td>
            <td class="value">{{ $proposal->user->instansi ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Nama Kegiatan</td>
            <td class="value" style="font-weight: bold;">{{ $proposal->kegiatan }}</td>
        </tr>
        <tr>
            <td class="label">Jenis Pengajuan</td>
            <td class="value">{{ $proposal->jenis }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Pelaksanaan</td>
            <td class="value">{{ \Carbon\Carbon::parse($proposal->tgl_pelaksanaan)->isoFormat('LL') }}</td>
        </tr>
        <tr>
            <td class="label">Dana yang Disetujui</td>
            <td class="value" style="font-weight: bold; color: #1b4d3e;">Rp {{ number_format($proposal->dana_diajukan, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Status Verifikasi</td>
            <td class="value">
                <span class="status-badge">Selesai / Terverifikasi</span>
            </td>
        </tr>
        <tr>
            <td class="label">Tanggal Disetujui</td>
            <td class="value">{{ $beritaAcara->created_at->isoFormat('LL') }}</td>
        </tr>
    </table>

    <!-- Catatan Admin (if exists) -->
    @if(!empty($beritaAcara->catatan_admin))
        <div class="notes-section">
            <div class="notes-title">Catatan Reviewer / Admin:</div>
            <div class="notes-content">"{{ $beritaAcara->catatan_admin }}"</div>
        </div>
    @endif

    <!-- Closing Text -->
    <div class="closing-text">
        Demikian Berita Acara Verifikasi Proposal ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya sebagai bukti sah pencairan dan penyelesaian laporan pertanggungjawaban kegiatan.
    </div>

    <!-- Signatures -->
    <table class="signature-table">
        <tr>
            <td class="signature-cell">
                <div class="signature-role">Pihak Reviewer (Admin)</div>
                <div class="signature-name">{{ $beritaAcara->generatedBy->name }}</div>
                <div class="signature-title">Reviewer Administrasi SIGAP</div>
            </td>
            <td class="signature-cell">
                <div class="signature-role">Pihak Pemohon (User)</div>
                <div class="signature-name">{{ $proposal->user->name }}</div>
                <div class="signature-title">Penanggung Jawab Kegiatan</div>
            </td>
        </tr>
    </table>

</body>
</html>
