import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_STAGES } from '../shared/utils';

export const Timeline = ({ currentStatus }) => {
  let currentIndex = STATUS_STAGES.findIndex((s) => s.key === currentStatus);
  const isFailed = currentStatus === 'Gagal Bayar';
  if (isFailed) currentIndex = 3;
  if (currentStatus === 'Revisi Proposal') currentIndex = 1;
  if (currentStatus === 'Menunggu Verif') currentIndex = 4;
  if (currentIndex === -1 && !isFailed) currentIndex = 0;

  return (
    <ol className="space-y-0">
      {STATUS_STAGES.map((stage, idx) => {
        const isDone = idx < currentIndex || currentStatus === 'Selesai';
        const isNow = idx === currentIndex && !isFailed && currentStatus !== 'Selesai';
        const isFailStep = isFailed && idx === 3;
        const isLast = idx === STATUS_STAGES.length - 1;

        return (
          <li key={stage.key} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-7 left-3.5 -ml-px h-[calc(100%-1.5rem)] w-0.5',
                  isDone ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <div
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                isDone && 'border-primary bg-primary text-primary-foreground',
                isNow && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/15',
                isFailStep && 'border-destructive bg-destructive text-white',
                !isDone && !isNow && !isFailStep && 'border-border bg-card text-muted-foreground'
              )}
            >
              {isDone ? (
                <Check className="size-3.5" />
              ) : isFailStep ? (
                <X className="size-3.5" />
              ) : (
                idx + 1
              )}
            </div>

            <div className="pt-0.5">
              <div
                className={cn(
                  'text-sm font-semibold leading-tight',
                  isNow ? 'text-primary' : isFailStep ? 'text-destructive' : 'text-foreground'
                )}
              >
                {stage.label}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{stage.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
