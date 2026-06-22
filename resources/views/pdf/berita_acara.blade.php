<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Berita Acara - {{ $beritaAcara->nomor_ba }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 2.5cm 2cm 2cm 2cm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
        }
        .title {
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            margin: 0;
        }
        .number {
            font-size: 11pt;
            margin-top: 5px;
        }
        .paragraph {
            text-align: justify;
            margin-bottom: 15px;
        }
        .party-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        .party-table td {
            vertical-align: top;
            padding: 2px 0;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 35px;
        }
        .signature-cell {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
        .signature-role {
            font-weight: bold;
            margin-bottom: 70px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .signature-title {
            font-size: 11pt;
        }
        .mengetahui-block {
            margin-top: 35px;
            text-align: center;
        }
        .mengetahui-title {
            margin-bottom: 70px;
        }
    </style>
</head>
<body>

    <!-- Header / Title -->
    <div class="header">
        <h1 class="title">BERITA ACARA SERAH TERIMA BANTUAN</h1>
        <div class="number">Nomor : {{ $beritaAcara->nomor_ba }}</div>
    </div>

    <!-- Opening Paragraph -->
    <div class="paragraph">
        Pada hari ini, {{ $hari }} tanggal {{ $tanggal }}, bertandatangan di bawah ini:
    </div>

    <!-- Pihak Pertama -->
    <table class="party-table">
        <tr>
            <td style="width: 4%;">1.</td>
            <td style="width: 15%;">Nama</td>
            <td style="width: 2%;">:</td>
            <td style="width: 79%; font-weight: bold;">{{ $beritaAcara->generatedBy->name }}</td>
        </tr>
        <tr>
            <td></td>
            <td>Jabatan</td>
            <td>:</td>
            <td>Staf Humas & Protokoler</td>
        </tr>
        <tr>
            <td></td>
            <td>Alamat</td>
            <td>:</td>
            <td>Jalan Letjend. Suprapto No. 2 Medan</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3" style="padding-top: 4px; font-style: italic;">
                Selanjutnya disebut <strong>"Pihak Pertama"</strong>
            </td>
        </tr>
    </table>

    <!-- Pihak Kedua -->
    <table class="party-table" style="margin-bottom: 25px;">
        <tr>
            <td style="width: 4%;">2.</td>
            <td style="width: 15%;">Nama</td>
            <td style="width: 2%;">:</td>
            <td style="width: 79%; font-weight: bold;">{{ $proposal->user->name }}</td>
        </tr>
        <tr>
            <td></td>
            <td>Jabatan</td>
            <td>:</td>
            <td>Ketua</td>
        </tr>
        <tr>
            <td></td>
            <td>Alamat</td>
            <td>:</td>
            <td>{{ $proposal->user->instansi ?? 'Medan' }}</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3" style="padding-top: 4px; font-style: italic;">
                Selanjutnya disebut <strong>"Pihak Kedua"</strong>
            </td>
        </tr>
    </table>

    <!-- Letter Body -->
    <div class="paragraph">
        Dengan ini menerangkan bahwa Pihak Pertama telah menyerahkan dana sebesar Rp. {{ number_format($proposal->dana_diajukan, 0, ',', '.') }} ({{ $terbilang }} rupiah) kepada Pihak Kedua dan Pihak Kedua telah menerima dana bantuan melalui No. rekening: {{ $proposal->nomor_rekening }} nama rekening: {{ $proposal->atas_nama }} tanggal {{ $tglTransfer }}.
    </div>

    <div class="paragraph">
        Penerimaan bantuan keuangan bertanggungjawab secara formal dan material atas penggunaan keuangan yang diterima.
    </div>

    <div class="paragraph" style="margin-bottom: 30px;">
        Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya, untuk dapat dipergunakan sebagaimana mestinya.
    </div>

    <!-- Signatures Section -->
    <table class="signature-table">
        <tr>
            <td class="signature-cell">
                <div class="signature-role">Pihak Kedua</div>
                <div style="height: 65px;"></div>
                <div class="signature-name">({{ strtoupper($proposal->user->instansi ?? $proposal->user->name) }})</div>
            </td>
            <td class="signature-cell">
                <div class="signature-role">
                    Pihak Pertama<br>
                    PT Perkebunan Nusantara IV
                </div>
                <div style="height: 48px;"></div>
                <div class="signature-name">{{ $beritaAcara->generatedBy->name }}</div>
                <div class="signature-title">Staf Humas & Protokoler</div>
            </td>
        </tr>
    </table>

    <!-- Mengetahui Block -->
    <div class="mengetahui-block">
        <div class="mengetahui-title">Mengetahui</div>
        <div style="height: 65px;"></div>
        <div class="signature-name">Maktal Kunto Aji</div>
        <div class="signature-title">Kasubbag Kesekretariatan dan Humas</div>
    </div>

</body>
</html>
