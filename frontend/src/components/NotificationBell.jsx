import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Trophy, TrendingDown, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '@/services/notificationService';

const POLL_INTERVAL_MS = 30_000;

const TYPE_META = {
    WON: {
        icon: <Trophy className="w-4 h-4 text-[#2A9D8F]" />,
        bg: 'bg-[#EAF7F5]',
    },
    OUTBID: {
        icon: <TrendingDown className="w-4 h-4 text-[#E05252]" />,
        bg: 'bg-red-50',
    },
    default: {
        icon: <Bell className="w-4 h-4 text-[#6B9E99]" />,
        bg: 'bg-[#F4FAFA]',
    },
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const fetchCount = useCallback(async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch {
            // silently ignore auth errors when polling
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const list = await getNotifications();
            setNotifications(Array.isArray(list) ? list : []);
            const unread = (Array.isArray(list) ? list : []).filter((n) => !n.read).length;
            setUnreadCount(unread);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll for new notifications
    useEffect(() => {
        fetchCount();
        const timer = setInterval(fetchCount, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchCount]);

    // Close panel when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleOpen = () => {
        if (!open) fetchNotifications();
        setOpen((prev) => !prev);
    };

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        await markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleClick = async (n) => {
        if (!n.read) {
            await markAsRead(n.id);
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }
        if (n.link) {
            navigate(n.link);
            setOpen(false);
        }
    };

    const meta = (type) => TYPE_META[type] || TYPE_META.default;

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[#6B9E99] hover:text-[#2A9D8F] hover:bg-[#F4FAFA] transition-all"
                title={isAr ? 'الإشعارات' : 'Notifications'}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -end-1 flex items-center justify-center h-4 min-w-[16px] px-0.5 rounded-full bg-[#E05252] text-white text-[10px] font-bold leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className={`absolute ${isAr ? 'left-0' : 'right-0'} top-11 z-50 w-80 bg-white rounded-xl shadow-xl border border-[#C5E0DC] overflow-hidden`}
                    dir={isAr ? 'rtl' : 'ltr'}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#C5E0DC] bg-[#F4FAFA]">
                        <span className="font-bold text-[#1A2E2C] text-sm">
                            {isAr ? 'الإشعارات' : 'Notifications'}
                            {unreadCount > 0 && (
                                <span className="ms-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-[#E05252] text-white text-xs font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-xs text-[#2A9D8F] hover:text-[#1A7A6E] font-semibold transition-colors"
                                    title={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    {isAr ? 'قراءة الكل' : 'Read all'}
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-[#6B9E99] hover:text-[#1A2E2C] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#EAF7F5]">
                        {loading ? (
                            <div className="py-8 text-center text-sm text-[#6B9E99]">
                                {isAr ? 'جار التحميل...' : 'Loading...'}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-2 text-[#6B9E99]">
                                <Bell className="w-8 h-8 opacity-40" />
                                <p className="text-sm">{isAr ? 'لا توجد إشعارات' : 'No notifications yet'}</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const { icon, bg } = meta(n.type);
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleClick(n)}
                                        className={`w-full text-start flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? 'bg-white hover:bg-[#F4FAFA]' : 'bg-[#EAF7F5] hover:bg-[#DDF3EF]'}`}
                                    >
                                        <span className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${bg}`}>
                                            {icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-relaxed ${n.read ? 'text-[#6B9E99]' : 'text-[#1A2E2C] font-semibold'}`}>
                                                {isAr && n.messageAr ? n.messageAr : n.message}
                                            </p>
                                            <p className="text-[11px] text-[#6B9E99] mt-0.5">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.read && (
                                            <button
                                                onClick={(e) => handleMarkRead(n.id, e)}
                                                className="flex-shrink-0 mt-1 text-[#2A9D8F] hover:text-[#1A7A6E]"
                                                title={isAr ? 'تحديد كمقروء' : 'Mark as read'}
                                            >
                                                <CheckCheck className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
