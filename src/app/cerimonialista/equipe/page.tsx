"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string;
  phone: string | null;
  createdAt: string;
}

const ROLES = ["assistente", "coordenador", "assessor", "mestre de cerimônia", "outro"];

export default function EquipePage() {
  const { status: authStatus } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "assistente", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/planner/team");
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authStatus === "authenticated") load();
  }, [authStatus]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", role: "assistente", phone: "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(m: TeamMember) {
    setEditing(m);
    setForm({ name: m.name, email: m.email ?? "", role: m.role, phone: m.phone ?? "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/planner/team/${editing.id}` : "/api/planner/team";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        await load();
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao salvar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover ${name} da equipe?`)) return;
    await fetch(`/api/planner/team/${id}`, { method: "DELETE" });
    await load();
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-midnight">Equipe</h1>
          <p className="font-body text-sm text-midnight/50 mt-1">
            Gerencie assistentes e atribua casamentos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition"
        >
          Adicionar membro
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <p className="font-heading text-xl text-midnight/40 mb-2">Equipe vazia</p>
          <p className="font-body text-sm text-midnight/30">
            Adicione assistentes para delegar casamentos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading text-lg text-midnight">{m.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-midnight/10 text-midnight text-xs font-body rounded-full capitalize">
                    {m.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-1.5 text-midnight/40 hover:text-midnight transition"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-1.5 text-red-400/50 hover:text-red-500 transition"
                    title="Remover"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {m.email && (
                  <p className="font-body text-sm text-midnight/60">
                    <span className="text-midnight/40">Email: </span>{m.email}
                  </p>
                )}
                {m.phone && (
                  <p className="font-body text-sm text-midnight/60">
                    <span className="text-midnight/40">Tel: </span>{m.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl text-midnight mb-5">
              {editing ? "Editar membro" : "Novo membro da equipe"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm mb-1 text-midnight/70">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-gold outline-none"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block font-body text-sm mb-1 text-midnight/70">Função</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-gold outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-body text-sm mb-1 text-midnight/70">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-gold outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block font-body text-sm mb-1 text-midnight/70">Telefone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-gold outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {error && <p className="font-body text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-midnight/70 rounded-xl font-body text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
