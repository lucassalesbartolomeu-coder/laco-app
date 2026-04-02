"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ─────────────────────────────────────────────────────────── */

type GiftStatus = "available" | "reserved" | "received";

interface Gift {
  id: string;
  name: string;
  description?: string;
  price: number;
  url?: string;
  store?: string;
  status: GiftStatus;
  reservedBy?: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value
  );

const STATUS_BADGE: Record<GiftStatus, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-700",
  received: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<GiftStatus, string> = {
  available: "Disponivel",
  reserved: "Reservado",
  received: "Recebido",
};

/* ─── SVG Icons ────────────────────────────────────────────────────── */

function GiftIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Modal variants ───────────────────────────────────────────────── */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

/* ─── Page Component ─────────────────────────────────────────────── */

export default function PresentesPage() {
  const params = useParams();
  const router = useRouter();
  const weddingId = params?.id as string;
  const { data: session, status: authStatus } = useSession();
  const toast = useToast();

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formLoja, setFormLoja] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Gift | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Auth redirect ──────────────────────────────────────────────── */

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  /* ── Fetch gifts ────────────────────────────────────────────────── */

  const fetchGifts = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/gifts`);
      if (res.ok) {
        const data = await res.json();
        setGifts(data);
      }
    } catch (err) {
      toast.error("Erro ao carregar presentes. Tente novamente.");
      console.error("Erro ao carregar presentes", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchGifts();
    }
  }, [authStatus, fetchGifts]);

  /* ── Form helpers ───────────────────────────────────────────────── */

  function resetForm() {
    setFormNome("");
    setFormDescricao("");
    setFormValor("");
    setFormLink("");
    setFormLoja("");
    setEditingGift(null);
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(gift: Gift) {
    setEditingGift(gift);
    setFormNome(gift.name);
    setFormDescricao(gift.description || "");
    setFormValor(String(gift.price));
    setFormLink(gift.url || "");
    setFormLoja(gift.store || "");
    setModalOpen(true);
  }

  /* ── Save (create or update) ────────────────────────────────────── */

  async function handleSave() {
    if (!formNome.trim()) return;
    setSubmitting(true);

    const body = {
      name: formNome.trim(),
      description: formDescricao.trim() || undefined,
      price: parseFloat(formValor) || 0,
      url: formLink.trim() || undefined,
      store: formLoja.trim() || undefined,
    };

    try {
      if (editingGift) {
        const res = await fetch(
          `/api/weddings/${weddingId}/gifts/${editingGift.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (res.ok) {
          const updated = await res.json();
          setGifts((prev) =>
            prev.map((g) => (g.id === editingGift.id ? updated : g))
          );
          resetForm();
          setModalOpen(false);
          toast.success("Presente atualizado com sucesso!");
        } else {
          toast.error("Erro ao atualizar presente.");
        }
      } else {
        const res = await fetch(`/api/weddings/${weddingId}/gifts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const newGift = await res.json();
          setGifts((prev) => [...prev, newGift]);
          resetForm();
          setModalOpen(false);
          toast.success("Presente adicionado à lista! 🎁");
        } else {
          toast.error("Erro ao adicionar presente.");
        }
      }
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
      console.error("Erro ao salvar presente", err);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Delete ─────────────────────────────────────────────────────── */

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/gifts/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setGifts((prev) => prev.filter((g) => g.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success("Presente removido da lista.");
      } else {
        toast.error("Erro ao remover presente.");
      }
    } catch (err) {
      toast.error("Erro inesperado ao excluir presente.");
      console.error("Erro ao excluir presente", err);
    } finally {
      setDeleting(false);
    }
  }

  /* ── Mark as received ───────────────────────────────────────────── */

  async function markAsReceived(gift: Gift) {
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/gifts/${gift.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: gift.name, status: "received" }),
        }
      );
      if (res.ok) {
        setGifts((prev) =>
          prev.map((g) =>
            g.id === gift.id ? { ...g, status: "received" as GiftStatus } : g
          )
        );
        toast.success(`"${gift.name}" marcado como recebido! 🎁`);
      } else {
        toast.error("Erro ao atualizar presente.");
      }
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
      console.error("Erro ao marcar como recebido", err);
    }
  }

  /* ── Auth guard / loading ───────────────────────────────────────── */

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  /* ── Render ─────────────────────────────────────────────────────── */

  const GOLD = "#A98950";
  const BROWN = "#3D322A";
  const CREME = "#FAF6EF";

  return (
    <div className="min-h-screen" style={{ background: CREME }}>
      {/* Light header */}
      <div style={{ background: CREME }} className="px-5 pt-10 pb-6">
        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" as const, fontWeight: 500 }}>
          Lista de Presentes
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: BROWN, lineHeight: 1.2, marginTop: "4px" }}>
          Presentes
        </h1>
        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", color: "rgba(61,50,42,0.5)", marginTop: "6px", letterSpacing: "0.02em" }}>
          Gerencie sua lista e acompanhe reservas
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 px-5 py-2">
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
        <div style={{ width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.7 }} />
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-end mb-6">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gold text-white rounded-xl font-body font-medium hover:bg-gold/90 transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar presente
          </button>
        </div>

        {/* ── Gift Grid ──────────────────────────────────────────── */}

        {gifts.length === 0 ? (
          <div className="text-center py-16">
            <GiftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-body text-gray-400">
              Nenhum presente adicionado ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-white rounded-2xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 overflow-hidden" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}
              >
                {/* Placeholder image area */}
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <GiftIcon className="w-12 h-12 text-gray-300" />
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading text-lg text-midnight">
                      {gift.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium shrink-0 ml-2 ${STATUS_BADGE[gift.status]}`}
                    >
                      {STATUS_LABEL[gift.status]}
                      {gift.status === "reserved" && gift.reservedBy && (
                        <span className="ml-1">por {gift.reservedBy}</span>
                      )}
                    </span>
                  </div>

                  {gift.description && (
                    <p className="font-body text-sm text-gray-500 mb-2 line-clamp-2">
                      {gift.description}
                    </p>
                  )}

                  {gift.store && (
                    <p className="font-body text-xs text-gray-400 mb-1">
                      {gift.store}
                    </p>
                  )}

                  <p className="font-heading text-xl text-gold mb-4">
                    {formatCurrency(gift.price)}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(gift)}
                      className="inline-flex items-center gap-1.5 font-body text-sm text-midnight hover:text-midnight/80 transition-colors"
                    >
                      <PencilIcon />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(gift)}
                      className="inline-flex items-center gap-1.5 font-body text-sm text-red-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon />
                      Excluir
                    </button>

                    {gift.status === "reserved" && (
                      <button
                        type="button"
                        onClick={() => markAsReceived(gift)}
                        className="inline-flex items-center gap-1.5 font-body text-sm text-gold hover:text-gold/80 transition-colors ml-auto"
                      >
                        <CheckIcon />
                        Marcar como Recebido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add / Edit Modal ───────────────────────────────────── */}
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
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal panel */}
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 z-10 pb-safe"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h2 className="font-heading text-2xl text-midnight mb-6">
                  {editingGift ? "Editar Presente" : "Novo Presente"}
                </h2>

                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label
                      htmlFor="gift-nome"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Nome *
                    </label>
                    <input
                      id="gift-nome"
                      type="text"
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Descricao */}
                  <div>
                    <label
                      htmlFor="gift-descricao"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Descricao
                    </label>
                    <textarea
                      id="gift-descricao"
                      rows={3}
                      value={formDescricao}
                      onChange={(e) => setFormDescricao(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Valor */}
                  <div>
                    <label
                      htmlFor="gift-valor"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Valor
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-gray-400">
                        R$
                      </span>
                      <input
                        id="gift-valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formValor}
                        onChange={(e) => setFormValor(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label
                      htmlFor="gift-link"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Link
                    </label>
                    <input
                      id="gift-link"
                      type="url"
                      placeholder="https://..."
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Loja */}
                  <div>
                    <label
                      htmlFor="gift-loja"
                      className="block font-body text-sm text-gray-500 mb-1"
                    >
                      Loja
                    </label>
                    <input
                      id="gift-loja"
                      type="text"
                      value={formLoja}
                      onChange={(e) => setFormLoja(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-body font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formNome.trim() || submitting}
                    className="flex-1 px-4 py-3 bg-gold text-white rounded-xl font-body font-medium hover:bg-gold/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Delete Confirm Dialog ──────────────────────────────── */}
        <AnimatePresence>
          {deleteTarget && (
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
                onClick={() => setDeleteTarget(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Dialog */}
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h2 className="font-heading text-xl text-midnight mb-2">
                  Excluir presente
                </h2>
                <p className="font-body text-sm text-gray-500 mb-6">
                  Tem certeza que deseja excluir{" "}
                  <span className="font-medium text-midnight">
                    {deleteTarget.name}
                  </span>
                  ? Esta acao nao pode ser desfeita.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-body font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-body font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Excluindo..." : "Excluir"}
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
