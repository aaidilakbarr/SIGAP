import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from '../../context/AppContext';

export default function NotificationBell() {
  const { user, showToast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.status === 'success') {
        setUnreadNotifications(res.data.unread || []);
        setReadNotifications(res.data.read || []);
      }
    } catch (e) {
      console.error("Gagal mengambil notifikasi", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling every 10 seconds for real-time feel
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await axios.post('/api/notifications/mark-read');
      if (res.data.status === 'success') {
        showToast('Semua notifikasi ditandai telah dibaca! 🎉');
        // Instantly update state for seamless UX
        setReadNotifications([...unreadNotifications.map(n => ({ ...n, is_read: true })), ...readNotifications]);
        setUnreadNotifications([]);
        setIsOpen(false);
      }
    } catch (e) {
      showToast('Gagal menandai notifikasi');
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const totalUnread = unreadNotifications.length;

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button 
        className="notif-bell-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {totalUnread > 0 && (
          <span className="notif-badge">{totalUnread}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifikasi</span>
            {totalUnread > 0 && (
              <button className="notif-mark-btn" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-body">
            {/* Section: Belum Dibaca */}
            {unreadNotifications.length > 0 && (
              <div className="notif-section">
                <div className="notif-section-title">Belum Dibaca</div>
                <div className="notif-list">
                  {unreadNotifications.map(n => (
                    <div key={n.id} className="notif-item unread">
                      <div className="notif-item-dot"></div>
                      <div className="notif-item-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{formatTime(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Sudah Dibaca */}
            {readNotifications.length > 0 && (
              <div className="notif-section">
                <div className="notif-section-title">Sudah Dibaca</div>
                <div className="notif-list">
                  {readNotifications.map(n => (
                    <div key={n.id} className="notif-item read">
                      <div className="notif-item-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{formatTime(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {unreadNotifications.length === 0 && readNotifications.length === 0 && (
              <div className="notif-empty">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#9ca3af" 
                  strokeWidth="1.5"
                  style={{ marginBottom: '8px' }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div>Tidak ada notifikasi</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
