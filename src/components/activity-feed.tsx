"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityItem {
  type: "gift" | "rsvp";
  message: string;
  time: string;
  icon: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

interface ActivityFeedProps {
  weddingId: string;
}

export default function ActivityFeed({ weddingId }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!weddingId) return;
    fetch(`/api/weddings/${weddingId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ActivityItem[]) => {
        setItems(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [weddingId]);

  if (!loaded || items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {visible.map((item, i) => (
          <motion.div
            key={`${item.type}-${item.time}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="flex items-center gap-3 bg-white border-l-2 border-midnight rounded-xl px-4 py-2.5 shadow-sm"
          >
            <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
            <p className="font-body text-xs text-midnight/70 flex-1 leading-snug">
              {item.message.replace(item.icon, "").trim()}
            </p>
            <span className="font-body text-[10px] text-midnight/35 flex-shrink-0 whitespace-nowrap">
              {timeAgo(item.time)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="font-body text-xs text-midnight hover:text-midnight/80 transition-colors px-1"
        >
          {expanded ? "Ver menos" : `Ver mais ${items.length - 3} atividade${items.length - 3 > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
