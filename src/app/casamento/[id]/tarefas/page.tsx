"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import BottomNav from "@/components/bottom-nav";

const GOLD = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#A98950",
  LOW: "rgba(61,50,42,0.42)",
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

interface WeddingTask {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  createdBy: { id: string; name: string | null };
}

type FilterStatus = "all" | "PENDING" | "DONE";

export default function TarefasPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });
  const [creating, setCreating] = useState(false);

  async function loadTasks() {
    const res = await fetch(`/api/weddings/${weddingId}/tasks`);
    if (res.ok) {
      const data: WeddingTask[] = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") loadTasks();
  }, [status, weddingId]);

  async function toggleStatus(task: WeddingTask) {
    const next = task.status === "DONE" ? "PENDING" : "DONE";
    const res = await fetch(`/api/weddings/${weddingId}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      const updated = tasks.map((t) => t.id === task.id ? { ...t, status: next as WeddingTask["status"] } : t);
      setTasks(updated);
      // Trigger confetti when all tasks are done
      if (next === "DONE" && updated.every((t) => t.status === "DONE") && updated.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }

  async function handleCreate() {
    if (!newTask.title.trim()) return;
    setCreating(true);
    const res = await fetch(`/api/weddings/${weddingId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      setShowModal(false);
      setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
      loadTasks();
    }
    setCreating(false);
  }

  const filtered = tasks.filter((t) => filter === "all" ? true : t.status === filter);
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Confetti */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Planejamento
        </p>
        <h1 className="text-[30px] font-light leading-tight"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Tarefas
        </h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Progress bar */}
        {tasks.length > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              <span>{doneCount} de {tasks.length} concluídas</span>
              <span>{Math.round((doneCount / tasks.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white" style={{ border: "1px solid rgba(169,137,80,0.15)" }}>
              <div className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / tasks.length) * 100}%`, background: GOLD }} />
            </div>
          </div>
        )}

        {/* Filters + New Task button */}
        <div className="flex items-center gap-2">
          {(["all", "PENDING", "DONE"] as FilterStatus[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] transition"
              style={{
                fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "0.08em",
                background: filter === f ? GOLD : "white",
                color: filter === f ? "white" : "rgba(61,50,42,0.42)",
                border: `1px solid ${filter === f ? GOLD : "rgba(169,137,80,0.2)"}`,
              }}>
              {f === "all" ? "Todas" : f === "PENDING" ? "Pendentes" : "Concluídas"}
            </button>
          ))}
          <button onClick={() => setShowModal(true)}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background: GOLD }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {filter === "all" ? "Nenhuma tarefa ainda" : "Nenhuma tarefa neste filtro"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-start gap-3"
                style={{ border: "1.5px solid rgba(169,137,80,0.12)", boxShadow: "0 1px 6px rgba(61,50,42,0.04)" }}>
                <button onClick={() => toggleStatus(task)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: task.status === "DONE" ? GOLD : "rgba(169,137,80,0.3)",
                    background: task.status === "DONE" ? GOLD : "transparent",
                  }}>
                  {task.status === "DONE" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{
                    color: task.status === "DONE" ? "rgba(61,50,42,0.35)" : BROWN,
                    textDecoration: task.status === "DONE" ? "line-through" : "none",
                    fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300,
                  }}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: PRIORITY_COLOR[task.priority] }}>
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                        · {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10">
            <h2 className="text-[22px] font-light mb-5" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
              Nova Tarefa
            </h2>
            <div className="space-y-3">
              <input value={newTask.title} onChange={(e) => setNewTask((n) => ({ ...n, title: e.target.value }))}
                placeholder="O que precisa ser feito?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
              <select value={newTask.priority} onChange={(e) => setNewTask((n) => ({ ...n, priority: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                <option value="HIGH">Alta prioridade</option>
                <option value="MEDIUM">Média prioridade</option>
                <option value="LOW">Baixa prioridade</option>
              </select>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((n) => ({ ...n, dueDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: BROWN, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: GOLD }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="flex-1 py-3 rounded-xl text-white text-sm disabled:opacity-50"
                style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                {creating ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav weddingId={weddingId} />
    </div>
  );
}

// Confetti overlay — reuses the pattern from /src/app/onboarding/page.tsx
function ConfettiOverlay() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: ["#3D322A", "#A98950", "#FAF6EF"][Math.floor(Math.random() * 3)],
      }))
    );
  }, []);

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          to { transform: translateY(100vh) rotateZ(360deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} className="fixed pointer-events-none w-2 h-2 rounded-full"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            backgroundColor: p.color,
            animation: `confetti-fall 2.5s ease-in forwards`,
            animationDelay: `${p.delay}s`,
            zIndex: 9999,
          }} />
      ))}
    </>
  );
}
