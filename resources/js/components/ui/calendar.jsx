import React from 'react';
import { DayPicker } from 'react-day-picker';
import { id as idLocale } from 'date-fns/locale';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = idLocale,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn('p-3', className)}
      classNames={{
        root: 'w-full',
        months: 'relative flex flex-col',
        month: 'flex w-full flex-col gap-2',
        month_caption: 'flex h-8 items-center justify-center px-9',
        caption_label: 'text-sm font-bold tracking-tight text-foreground select-none capitalize',
        dropdowns: 'flex items-center justify-center gap-1.5',
        dropdown_root:
          'relative inline-flex items-center rounded-md border border-input bg-card text-xs font-semibold shadow-xs focus-within:ring-2 focus-within:ring-ring/30',
        dropdown: 'absolute inset-0 opacity-0 cursor-pointer',
        nav: 'absolute inset-x-0 top-0 flex h-8 items-center justify-between pointer-events-none',
        button_previous:
          'pointer-events-auto z-10 inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 cursor-pointer',
        button_next:
          'pointer-events-auto z-10 inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 cursor-pointer',
        month_grid: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7',
        weekday:
          'flex h-8 items-center justify-center text-[11px] font-semibold uppercase text-muted-foreground select-none',
        weeks: 'flex flex-col gap-1',
        week: 'grid grid-cols-7',
        day: 'flex h-8 items-center justify-center p-0',
        day_button:
          'inline-flex size-8 items-center justify-center rounded-md text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:font-semibold',
        today:
          '[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-bold',
        outside:
          '[&>button]:text-muted-foreground/40 [&>button]:hover:text-muted-foreground',
        disabled: '[&>button]:text-muted-foreground/30 [&>button]:pointer-events-none',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) => {
          if (orientation === 'left') {
            return <ChevronLeft className={cn('size-4', iconClassName)} {...iconProps} />;
          }
          if (orientation === 'right') {
            return <ChevronRight className={cn('size-4', iconClassName)} {...iconProps} />;
          }
          return <ChevronDown className={cn('size-3.5', iconClassName)} {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
