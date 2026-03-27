"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────── */

type Category =
  | "familia_noivo"
  | "familia_noiva"
  | "amigos_noivo"
  | "amigos_noiva"
  | "trabalho";

type Status = "confirmado" | "pendente" | "recusado";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  city?: string;
  state?: string;
  category: Category;
  status: Status;
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<Category, string> = {
  familia_noivo: "Familia Noivo",
  familia_noiva: "Familia Noiva",
  amigos_noivo: "Amigos Noivo",
  amigos_noiva: "Amigos Noiva",
  trabalho: "Trabalho",
};

const CATEGORY_COLORS: Record<Category, string> = {
  familia_noivo: "bg-teal/15 text-teal",
  familia_noiva: "bg-copper/15 text-copper",
  amigos_noivo: "bg-blue-100 text-blue-700",
  amigos_noiva: "bg-pink-100 text-pink-700",
  trabalho: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<Status, string> = {
  confirmado: "bg-green-100 text-green-700",
  pendente: "bg-amber-100 text-amber-700",
  recusado: "bg-red-100 text-red-700",
};

const STATUS_CYCLE: Record<Status, Status> = {
  pendente: "confirmado",
  confirmado: "recusado",
  recusado: "pendente",
};

const DDD_STATE: Record<string, string> = {
  "11": "SP", "12": "SP", "13": "SP", "14": "SP", "15": "SP", "16": "SP",
  "17": "SP", "18": "SP", "19": "SP",
  "21": "RJ", "22": "RJ", "24": "RJ",
  "27": "ES", "28": "ES",
  "31": "MG", "32": "MG", "33": "MG", "34": "MG", "35": "MG", "37": "MG", "38": "MG",
  "41": "PR", "42": "PR", "43": "PR", "44": "PR", "45": "PR", "46": "PR",
  "47": "SC", "48": "SC", "49": "SC",
  "51": "RS", "53": "RS", "54": "RS", "55": "RS",
  "61": "DF", "62": "GO", "63": "TO", "64": "GO", "65": "MT", "66": "MT", "67": "MS",
  "68": "AC", "69": "RO",
  "71": "BA", "73": "BA", "74": "BA", "75": "BA", "77": "BA",
  "79": "SE",
  "81": "PE", "82": "AL", "83": "PB", "84": "RN", "85": "CE", "86": "PI",
  "87": "PE", "88": "CE", "89": "PI",
  "91": "PA", "92": "AM", "93": "PA", "94": "PA", "95": "RR", "96": "AP", "97": "AM", "98": "MA", "99": "MA",
};

function extractDDD(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const ddd = digits.startsWith("55") ? digits.slice(2, 4) : digits.slice(0, 2);
    return ddd;
  }
  return null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ─── SVG Icons ─────────────────────────────────────────────────────── */

function PeopleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlusIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/* ─── Modal overlay variants ────────────────────────────────────────── */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

/* ─── Page Component ────────────────────────────────────────────────── */

export default function ConvidadosPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status: authStatus } = useSession();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("familia_noivo");
  const [formStatus, setFormStatus] = useState<Status>("pendente");
  const [submitting, setSubmitting] = useState(false);

  /* ── Fetch guests ──────────────────────────────────────────────── */

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests`);
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (err) {
      console.error("Erro ao carregar convidados", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchGuests();
    }
  }, [authStatus, fetchGuests]);

  /* ── Filtered list ─────────────────────────────────────────────── */

  const filtered = guests.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "todos" || g.category === filterCategory;
    const matchStatus =
      filterStatus === "todos" || g.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  /* ── KPI values ────────────────────────────────────────────────── */

  const total = guests.length;
  const confirmados = guests.filter((g) => g.status === "confirmado").length;
  const pendentes = guests.filter((g) => g.status === "pendente").length;
  const recusados = guests.filter((g) => g.status === "recusado").length;

  const pctConfirmados = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  /* ── Actions ───────────────────────────────────────────────────── */

  async function cycleStatus(guest: Guest) {
    const newStatus = STATUS_CYCLE[guest.status];
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/guests/${guest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id ? { ...g, status: newStatus } : g
          )
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  }

  async function deleteGuest(guestId: string) {
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/guests/${guestId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
      }
    } catch (err) {
      console.error("Erro ao excluir convidado", err);
    }
  }

  async function handleAddGuest() {
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          category: formCategory,
          status: formStatus,
        }),
      });
      if (res.ok) {
        const newGuest = await res.json();
        setGuests((prev) => [...prev, newGuest]);
        resetForm();
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao adicionar convidado", err);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormCategory("familia_noivo");
    setFormStatus("pendente");
  }

  /* ── Auth guard ────────────────────────────────────────────────── */

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-off-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="font-heading text-3xl sm:text-4xl text-verde-noite mb-1">
          Convidados
        </h1>
        <p className="font-body text-gray-500 mb-8">
          Gerencie sua lista de convidados
        </p>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <PeopleIcon className="w-5 h-5 text-teal" />
              <span className="font-body text-sm text-gray-500">
                Total
              </span>
            </div>
            <p className="font-heading text-3xl text-verde-noite">{total}</p>
          </div>

          {/* Confirmados */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="font-body text-sm text-gray-500">
                Confirmados
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl text-verde-noite">
                {confirmados}
              </p>
              <span className="font-body text-sm text-green-600">
                {pctConfirmados}%
              </span>
            </div>
          </div>

          {/* Pendentes */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-body text-sm text-gray-500">
                Pendentes
              </span>
            </div>
            <p className="font-heading text-3xl text-verde-noite">
              {pendentes}
            </p>
          </div>

          {/* Recusados */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="font-body text-sm text-gray-500">
                Recusados
              </span>
            </div>
            <p className="font-heading text-3xl text-verde-noite">
              {recusados}
            </p>
          </div>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200 appearance-none"
          >
            <option value="todos">Todos</option>
            <option value="familia_noivo">Familia Noivo</option>
            <option value="familia_noiva">Familia Noiva</option>
            <option value="amigos_noivo">Amigos Noivo</option>
            <option value="amigos_noiva">Amigos Noiva</option>
            <option value="trabalho">Trabalho</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200 appearance-none"
          >
            <option value="todos">Todos</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>

        {/* ── Guest List ─────────────────────────────────────────── */}

        {filtered.length === 0 && !loading ? (
          <div className="text-center py-16">
            <PeopleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-body text-gray-400">
              {guests.length === 0
                ? "Nenhum convidado adicionado ainda"
                : "Nenhum resultado encontrado"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                      Convidado
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Telefone
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Localidade
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Categoria
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Status
                    </th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((guest) => {
                    const ddd = extractDDD(guest.phone);
                    const dddState = ddd ? DDD_STATE[ddd] : null;
                    const location =
                      guest.city && guest.state
                        ? `${guest.city}, ${guest.state}`
                        : guest.city || guest.state || null;

                    return (
                      <tr
                        key={guest.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Name + avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center font-body text-sm font-semibold shrink-0">
                              {getInitials(guest.name)}
                            </div>
                            <span className="font-body text-verde-noite font-medium">
                              {guest.name}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4 font-body text-sm text-gray-600">
                          {guest.phone || "---"}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {ddd && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body font-semibold bg-gray-100 text-gray-500">
                                {ddd}
                              </span>
                            )}
                            <span className="font-body text-sm text-gray-600">
                              {location ||
                                (dddState ? dddState : "---")}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium ${
                              CATEGORY_COLORS[guest.category]
                            }`}
                          >
                            {CATEGORY_LABELS[guest.category]}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => cycleStatus(guest)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium cursor-pointer transition-colors ${
                              STATUS_COLORS[guest.status]
                            }`}
                          >
                            {guest.status.charAt(0).toUpperCase() +
                              guest.status.slice(1)}
                          </button>
                        </td>

                        {/* Delete */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => deleteGuest(guest.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((guest) => {
                const ddd = extractDDD(guest.phone);
                const dddState = ddd ? DDD_STATE[ddd] : null;
                const location =
                  guest.city && guest.state
                    ? `${guest.city}, ${guest.state}`
                    : guest.city || guest.state || null;

                return (
                  <div
                    key={guest.id}
                    className="bg-white rounded-2xl shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center font-body text-sm font-semibold shrink-0">
                          {getInitials(guest.name)}
                        </div>
                        <div>
                          <p className="font-body text-verde-noite font-medium">
                            {guest.name}
                          </p>
                          <p className="font-body text-xs text-gray-400">
                            {guest.phone || "Sem telefone"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteGuest(guest.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {ddd && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body font-semibold bg-gray-100 text-gray-500">
                          {ddd}
                        </span>
                      )}
                      <span className="font-body text-xs text-gray-500">
                        {location || (dddState ? dddState : "")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium ${
                          CATEGORY_COLORS[guest.category]
                        }`}
                      >
                        {CATEGORY_LABELS[guest.category]}
                      </span>
                      <button
                        type="button"
                        onClick={() => cycleStatus(guest)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium cursor-pointer transition-colors ${
                          STATUS_COLORS[guest.status]
                        }`}
                      >
                        {guest.status.charAt(0).toUpperCase() +
                          guest.status.slice(1)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Floating Action Button ─────────────────────────────── */}
        <button
          type="button"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-copper text-white rounded-full shadow-lg hover:bg-copper/90 transition-all duration-200 flex items-center justify-center z-40"
        >
          <PlusIcon />
        </button>

        {/* ── Add Guest Modal ────────────────────────────────────── */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal panel */}
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 z-10"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h2 className="font-heading text-2xl text-verde-noite mb-6">
                  Novo Convidado
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="guest-name"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Nome
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="guest-phone"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Telefone
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="guest-email"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="guest-category"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Categoria
                    </label>
                    <select
                      id="guest-category"
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(e.target.value as Category)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200 appearance-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="guest-status"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="guest-status"
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as Status)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="recusado">Recusado</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-body font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGuest}
                    disabled={!formName.trim() || submitting}
                    className="flex-1 px-4 py-3 bg-copper text-white rounded-xl font-body font-medium hover:bg-copper/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Adicionando..." : "Adicionar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
