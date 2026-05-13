import React from 'react';

export const STATUS_STAGES = [
  { key: 'Dalam Antrean', label: 'Input', desc: 'Proposal disubmit dan masuk antrean sistem.' },
  { key: 'Dalam Review', label: 'Review', desc: 'Proposal sedang direview oleh pimpinan.' },
  { key: 'Menunggu Fisik', label: 'Fisik', desc: 'Menunggu penyerahan berkas fisik proposal.' },
  { key: 'Dana Cair', label: 'Dana Cair', desc: 'Dana telah berhasil dicairkan kepada pemohon.' },
  { key: 'Menunggu Evidence', label: 'Upload LPJ', desc: 'Pemohon harus mengunggah bukti/evidence.' },
  { key: 'Selesai', label: 'Selesai', desc: 'Seluruh proses telah selesai dan laporan diterima.' },
];

export const Timeline = ({ currentStatus }) => {
  let currentIndex = STATUS_STAGES.findIndex(s => s.key === currentStatus);
  const isFailed = currentStatus === 'Gagal Bayar';
  if (isFailed) currentIndex = 3;
  if (currentIndex === -1 && !isFailed) currentIndex = 0;

  return (
    <div className="up-timeline-vertical">
      {STATUS_STAGES.map((stage, idx) => {
        const isDone = idx < currentIndex || currentStatus === 'Selesai';
        const isNow = idx === currentIndex && !isFailed;
        const isFailStep = isFailed && idx === 3;

        return (
          <div key={stage.key}
            className={`up-tlv-item ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${isFailStep ? 'fail-step' : ''}`}
          >
            <div className="up-tlv-left">
              <div className={`up-tlv-dot ${isDone ? 'done' : ''} ${isNow ? 'now' : ''} ${isFailStep ? 'fail' : ''}`}>
                {isDone ? '✓' : isFailStep ? '✕' : (idx + 1)}
              </div>
              <div className={`up-tlv-line ${isDone ? 'done' : ''}`} />
            </div>
            <div className="up-tlv-content">
              <div className="up-tlv-label">{stage.label}</div>
              <div className="up-tlv-desc">{stage.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
