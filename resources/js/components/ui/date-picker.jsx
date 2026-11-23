import React, { useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function parseIsoDate(value) {
  if (!value) return undefined;
  const parts = String(value).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return undefined;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  displayFormat = 'd MMM yyyy',
  clearable = true,
  disabled = false,
  className,
  align = 'start',
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseIsoDate(value);

  const handleSelect = (date) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    } else if (clearable) {
      onChange('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          className={cn(
            'h-11 sm:h-9 w-full justify-between gap-2 px-3 font-normal text-left bg-card border-input hover:bg-card hover:border-primary/40',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className={cn('truncate text-sm', selectedDate && 'font-medium text-foreground')}>
              {selectedDate
                ? format(selectedDate, displayFormat, { locale: idLocale })
                : placeholder}
            </span>
          </span>
          {clearable && selectedDate && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear(e);
                }
              }}
              aria-label="Hapus tanggal"
              className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-[280px] max-w-[calc(100vw-1.5rem)] p-0 overflow-hidden">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
          autoFocus
        />
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary hover:text-primary"
            onClick={() => {
              onChange(format(new Date(), 'yyyy-MM-dd'));
              setOpen(false);
            }}
          >
            Hari ini
          </Button>
          {clearable && selectedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              Hapus
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
