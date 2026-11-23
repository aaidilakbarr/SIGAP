import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import webIcon from '@/assets/icon-web.svg';

function fromBase64Url(str = '') {
  if (!str) return '';
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export default function DocumentPreviewPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const src = useMemo(() => {
    const encoded = params.get('d');
    if (encoded) return fromBase64Url(encoded);
    return params.get('src') || '';
  }, [params]);
  const explicitDownloadUrl = useMemo(() => {
    const encoded = params.get('dl');
    if (encoded) return fromBase64Url(encoded);
    return params.get('download') || '';
  }, [params]);
  const title = params.get('title') || 'Preview Dokumen';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileKind, setFileKind] = useState(null); // 'pdf' | 'image' | 'other'
  const [blobUrl, setBlobUrl] = useState('');
  const [filename, setFilename] = useState('dokumen.pdf');
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    document.title = `${title} | SIGAP`;
  }, [title]);

  useEffect(() => {
    let active = true;
    let createdBlobUrl = '';

    const loadDocument = async () => {
      if (!src || !src.startsWith('/')) {
        setError('Tautan dokumen tidak valid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setFileKind(null);

      try {
        const res = await axios.get(src, {
          baseURL: window.APP_URL || '',
          params: { format: 'base64' },
          headers: {
            'ngrok-skip-browser-warning': '69420',
            Accept: 'application/json',
          },
        });

        if (!active) return;

        const payload = res.data;
        if (!payload?.data) {
          throw new Error('Data dokumen kosong');
        }

        const mimeType = payload.mime_type || 'application/pdf';
        const derivedName = payload.filename || 'dokumen.pdf';
        setFilename(derivedName);

        const blob = base64ToBlob(payload.data, mimeType);
        createdBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(createdBlobUrl);

        if (mimeType.toLowerCase().includes('application/pdf')) {
          setFileKind('pdf');
        } else if (mimeType.toLowerCase().startsWith('image/')) {
          setFileKind('image');
        } else {
          setFileKind('other');
        }
      } catch (err) {
        if (!active) return;
        const status = err?.response?.status;
        if (status === 404) {
          setError('Berkas dokumen tidak ditemukan di server (404).');
        } else {
          setError('Gagal memuat dokumen untuk pratinjau. Periksa koneksi lalu coba lagi.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDocument();

    return () => {
      active = false;
      if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
    };
  }, [src, reloadNonce]);

  const handleDownload = () => {
    if (explicitDownloadUrl) {
      window.location.href = explicitDownloadUrl;
      return;
    }
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Compact Native Viewer Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src={webIcon} alt="SIGAP" className="size-8 shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground sm:text-base">{title}</h1>
              <div className="truncate text-[11px] text-muted-foreground">{filename}</div>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0"
            onClick={handleDownload}
            disabled={!blobUrl && !explicitDownloadUrl}
          >
            <Download className="size-4" />
            <span>Download</span>
          </Button>
        </div>
      </header>

      {/* Native Viewport */}
      <main className="relative flex flex-1 min-h-0 flex-col">
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div className="mt-3 text-sm font-semibold text-foreground">
              Memuat pratinjau dokumen...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <h2 className="text-base font-bold text-foreground">Pratinjau Tidak Tersedia</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{error}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReloadNonce((n) => n + 1)}
                  >
                    <RefreshCw className="size-4" />
                    Coba Lagi
                  </Button>
                  {explicitDownloadUrl && (
                    <Button type="button" onClick={handleDownload}>
                      <Download className="size-4" />
                      Unduh File
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && fileKind === 'pdf' && blobUrl && (
          <iframe
            src={blobUrl}
            title={title}
            className="h-full w-full flex-1 border-0 bg-muted/30"
          />
        )}

        {!loading && !error && fileKind === 'image' && blobUrl && (
          <div className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
            <img
              src={blobUrl}
              alt={title}
              className="max-h-full max-w-full rounded-lg border border-border bg-white object-contain shadow-sm"
            />
          </div>
        )}

        {!loading && !error && fileKind === 'other' && (
          <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="size-6" />
                </div>
                <h2 className="text-base font-bold text-foreground">{filename}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Format berkas ini tidak dapat ditampilkan langsung di browser. Gunakan tombol di bawah untuk mengunduhnya.
                </p>
                <Button type="button" className="mt-5" onClick={handleDownload}>
                  <Download className="size-4" />
                  Download Berkas
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
