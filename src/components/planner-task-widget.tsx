"use client";

import { useEffect, useRef, useState } from "react";

interface PlannerTask {
  id: string;
  title: string;
  dueDate: string | null;
  done: boolean;
  priority: string;
  weddingId: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgente: "text-red-500",
  normal:  "text-midnight/40",
  baixa:   "text-midnight/25",
};

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
}

function isToday(dueDate: string | null) {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function formatDue(dueDate: string | null) {
  if (!dueDate) return null;
  if (isToday(dueDate)) return "Hoje";
  if (isOverdue(dueDate)) return `Vencida`;
  return new Date(dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function PlannerTaskWidget() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("planner-tasks-collapsed") === "true";
    }
    return false;
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/planner/tasks")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTasks(d); })
      .catch(() => {});
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("planner-tasks-collapsed", String(next));
  }

  async function handleAdd() {
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/planner/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), dueDate: newDate || null }),
      });
      const task = await res.json();
      if (res.ok) {
        setTasks((prev) => [task, ...prev]);
        setNewTitle("");
        setNewDate("");
      }
    } finally {
      setAdding(false);
      inputRef.current?.focus();
    }
  }

  async function toggleDone(task: PlannerTask) {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
    await fetch(`/api/planner/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    // Remove done tasks from list after a short delay
    if (!task.done) {
      setTimeout(() => setTasks((prev) => prev.filter((t) => t.id !== task.id)), 600);
    }
  }

  const todayAndOverdue = tasks.filter((t) => isToday(t.dueDate) || isOverdue(t.dueDate));
  const upcoming = tasks.filter((t) => !isToday(t.dueDate) && !isOverdue(t.dueDate));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button onClick={toggleCollapsed} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-body text-sm font-semibold text-midnight">Minhas Tarefas</span>
          {todayAndOverdue.length > 0 && (
            <span className="px-1.5 py-0.5 bg-gold/10 text-gold text-[10px] font-body font-semibold rounded-full">
              {todayAndOverdue.length} hoje
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-midnight/30 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="border-t border-gray-50">
          {/* Add task input */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-50">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Adicionar tarefa..."
              className="flex-1 font-body text-sm text-midnight placeholder:text-midnight/30 outline-none bg-transparent"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="font-body text-xs text-midnight/40 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-gold transition w-[120px]"
            />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim() || adding}
              className="w-7 h-7 rounded-lg bg-midnight/10 text-midnight flex items-center justify-center hover:bg-midnight/20 transition disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="font-body text-xs text-midnight/30 text-center py-8 italic">
              Boa hora para prospectar novos casais. 🎯
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {[...todayAndOverdue, ...upcoming].map((task) => {
                const due = formatDue(task.dueDate);
                const overdue = isOverdue(task.dueDate);
                return (
                  <div key={task.id} className={`flex items-center gap-3 px-4 py-3 transition-opacity duration-300 ${task.done ? "opacity-40" : ""}`}>
                    <button
                      onClick={() => toggleDone(task)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        task.done
                          ? "bg-midnight border-midnight"
                          : "border-gray-300 hover:border-midnight"
                      }`}
                    >
                      {task.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`font-body text-sm flex-1 ${task.done ? "line-through text-midnight/40" : "text-midnight"}`}>
                      {task.title}
                    </span>
                    {due && (
                      <span className={`font-body text-[10px] flex-shrink-0 ${overdue ? "text-red-400 font-semibold" : isToday(task.dueDate) ? "text-gold font-semibold" : "text-midnight/30"}`}>
                        {due}
                      </span>
                    )}
                    {task.priority === "urgente" && !task.done && (
                      <span className={`font-body text-[10px] ${PRIORITY_COLORS.urgente}`}>!</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
