import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function NotificationBell() {
  const { user, showToast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.status === 'success') {
        setUnreadNotifications(res.data.unread || []);
        setReadNotifications(res.data.read || []);
      }
    } catch (e) {
      console.error('Gagal mengambil notifikasi', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.post('/api/notifications/mark-read');
      if (res.data.status === 'success') {
        showToast('Semua notifikasi ditandai telah dibaca.', 'success');
        setReadNotifications([
          ...unreadNotifications.map((n) => ({ ...n, is_read: true })),
          ...readNotifications,
        ]);
        setUnreadNotifications([]);
        setIsOpen(false);
      }
    } catch (e) {
      showToast('Gagal menandai notifikasi.', 'error');
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const totalUnread = unreadNotifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative size-11 sm:size-10"
          aria-label="Buka notifikasi"
          title="Notifikasi"
        >
          <Bell className="size-4.5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-xs">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Notifikasi</span>
            {totalUnread > 0 && (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                {totalUnread} baru
              </span>
            )}
          </div>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary hover:text-primary"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5" />
              Tandai dibaca
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-border">
          {unreadNotifications.length > 0 && (
            <div>
              <div className="bg-muted/50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Belum Dibaca
              </div>
              <div className="divide-y divide-border/70">
                {unreadNotifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 bg-primary/[0.03] px-4 py-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground">{n.title}</div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                      <div className="mt-1 text-[11px] font-medium text-muted-foreground/80">
                        {formatTime(n.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <div className="bg-muted/50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sudah Dibaca
              </div>
              <div className="divide-y divide-border/70">
                {readNotifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 opacity-80">
                    <div className="text-xs font-semibold text-foreground">{n.title}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground/80">
                      {formatTime(n.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unreadNotifications.length === 0 && readNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="size-5" />
              </div>
              <div className="text-sm font-medium text-foreground">Belum ada notifikasi</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pembaruan status proposal akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
