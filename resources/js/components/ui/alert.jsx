import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        default: 'bg-card text-foreground border-border',
        info: 'bg-sky-50 text-sky-900 border-sky-200',
        warning: 'bg-amber-50 text-amber-950 border-amber-200',
        success: 'bg-emerald-50 text-emerald-950 border-emerald-200',
        destructive: 'bg-red-50 text-red-900 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({ className, variant, ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn('font-semibold leading-snug tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-sm leading-relaxed opacity-90', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
