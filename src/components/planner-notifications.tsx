"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  weddingId: string | null;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}

export function PlannerNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/planner/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.notifications) setNotifications(d.notifications);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

  // Close drawer when clicking outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/planner/notifications", { method: "PATCH" });
    }
  }

  return (
    <div className="relative" ref={drawerRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
        aria-label="Notificações"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-midnight border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="font-body text-sm font-semibold text-white">Notificações</span>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  setNotifications([]);
                  await fetch("/api/planner/notifications", { method: "PATCH" });
                }}
                className="font-body text-xs text-white/40 hover:text-white/70 transition"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="font-body text-sm text-white/30 text-center py-8">Nenhuma notificação</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-white/6 last:border-0 ${!n.read ? "bg-white/5" : ""}`}
                >
                  <p className="font-body text-sm text-white/80 leading-snug">{n.message}</p>
                  <p className="font-body text-xs text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
