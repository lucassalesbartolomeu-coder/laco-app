"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface WeddingEvent {
  weddingId: string;
  couple: string;
  date: string;
  venue: string | null;
}

const MONTHS = [
  "Janeiro","Fevereiro","Marco","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];

export default function AgendaPage() {
  const { status: authStatus } = useSession();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/planner/weddings")
      .then((r) => r.json())
      .then((data) => {
        const evts: WeddingEvent[] = (Array.isArray(data) ? data : [])
          .filter((a: { wedding: { weddingDate: string | null } }) => a.wedding.weddingDate)
          .map((a: { wedding: { id: string; partnerName1: string; partnerName2: string; weddingDate: string; venue: string | null } }) => ({
            weddingId: a.wedding.id,
            couple: `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`,
            date: a.wedding.weddingDate,
            venue: a.wedding.venue,
          }));
        setEvents(evts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function eventsOnDay(day: number) {
    const ds = dateStr(day);
    return events.filter((e) => e.date.startsWith(ds));
  }

  const selectedEvents = selectedDate
    ? events.filter((e) => e.date.startsWith(selectedDate))
    : [];

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="font-heading text-3xl text-midnight mb-8">Agenda</h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-lg text-midnight/50 hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-heading text-xl text-midnight">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-lg text-midnight/50 hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-3 text-center font-body text-xs text-midnight/40 font-semibold uppercase border-b">
              {wd}
            </div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="p-2 border-b border-r border-gray-50 min-h-[72px]" />;
            const dayEvents = eventsOnDay(day);
            const isSelected = selectedDate === dateStr(day);
            const isToday = dateStr(day) === new Date().toISOString().slice(0, 10);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr(day))}
                className={`p-2 border-b border-r border-gray-50 min-h-[72px] text-left transition hover:bg-gray-50 ${
                  isSelected ? "bg-midnight/5 ring-1 ring-midnight" : ""
                }`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-body text-sm ${
                  isToday ? "bg-gold text-white" : "text-midnight"
                }`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.weddingId} className="bg-midnight/10 text-midnight rounded px-1 py-0.5 text-[10px] font-body truncate mt-0.5">
                        {e.couple}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-heading text-lg text-midnight mb-4">
            Eventos em {selectedDate.split("-").reverse().join("/")}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="font-body text-midnight/40 text-sm">Nenhum evento neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e) => (
                <div key={e.weddingId} className="flex items-center gap-4 p-3 bg-fog rounded-lg">
                  <div className="w-2 h-8 rounded-full bg-gold" />
                  <div>
                    <p className="font-body text-midnight font-medium">{e.couple}</p>
                    {e.venue && <p className="font-body text-sm text-midnight/50">{e.venue}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
