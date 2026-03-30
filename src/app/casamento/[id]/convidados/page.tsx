"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import WhatsAppBlast from "@/components/whatsapp-blast";

declare global {
  interface Window { ContactsManager: unknown; }
}

/* ─── Types ─────────────────────────────────────────────────────────── */

type Category =
  | "familia_noivo"
  | "familia_noiva"
  | "amigos_noivo"
  | "amigos_noiva"
  | "trabalho";

type Status = "confirmado" | "pendente" | "recusado";
type GuestListType = "A" | "B" | "C";

interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  city?: string;
  state?: string;
  category: Category;
  guestList: GuestListType;
  rsvpStatus: Status;
  whatsappSentAt?: string | null;
}

interface WeddingInfo {
  date?: string | null;
  venue?: string | null;
  slug?: string | null;
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
  familia_noivo: "bg-midnight/15 text-midnight",
  familia_noiva: "bg-gold/15 text-gold",
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

const LIST_META: Record<GuestListType, { label: string; emoji: string; color: string; desc: string }> = {
  A: { label: "Lista Oficial", emoji: "👑", color: "bg-midnight text-white", desc: "Convidados confirmados — a cerimonialista tem acesso" },
  B: { label: "Lista Reserva", emoji: "🔄", color: "bg-amber-500 text-white", desc: "Próximos da fila se alguém desistir" },
  C: { label: "Lista Talvez", emoji: "💭", color: "bg-gray-400 text-white", desc: "Pensando se convida ou não" },
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

function ArrowIcon({ className = "w-4 h-4", direction = "right" }: { className?: string; direction?: "left" | "right" | "up" | "down" }) {
  const rotation = { left: 180, right: 0, up: -90, down: 90 }[direction];
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotation}deg)` }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ─── Animation variants ─────────────────────────────────────────────── */

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
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo>({});

  // Active list tab
  const [activeList, setActiveList] = useState<GuestListType>("A");

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Contact Picker
  const [contactPickerSupported, setContactPickerSupported] = useState(false);
  const [pickingContacts, setPickingContacts] = useState(false);
  const [pickedContacts, setPickedContacts] = useState<{ name: string; phone: string; suggested?: string }[]>([]);
  const [pickedCategory, setPickedCategory] = useState<Category>("familia_noivo");
  const [pickedList, setPickedList] = useState<GuestListType>("A");
  const [importingContacts, setImportingContacts] = useState(false);
  const [cleaningNames, setCleaningNames] = useState(false);

  // Modal (add guest)
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("familia_noivo");
  const [formList, setFormList] = useState<GuestListType>("A");
  const [formStatus, setFormStatus] = useState<Status>("pendente");
  const [submitting, setSubmitting] = useState(false);

  // Move guest modal
  const [moveTarget, setMoveTarget] = useState<Guest | null>(null);

  // WhatsApp confirmation panel
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  /* ── Fetch guests ──────────────────────────────────────────────── */

  const fetchGuests = useCallback(async () => {
    try {
      const [guestsRes, weddingRes] = await Promise.all([
        fetch(`/api/weddings/${weddingId}/guests`),
        fetch(`/api/weddings/${weddingId}`),
      ]);
      if (guestsRes.ok) {
        const data = await guestsRes.json();
        setGuests(data.map((g: Guest) => ({ ...g, guestList: g.guestList || "A" })));
      }
      if (weddingRes.ok) {
        const w = await weddingRes.json();
        setWeddingInfo({
          date: w.weddingDate ?? null,
          venue: w.venue ?? w.ceremonyVenue ?? null,
          slug: w.slug ?? null,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar convidados", err);
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (authStatus === "authenticated") fetchGuests();
  }, [authStatus, fetchGuests]);

  useEffect(() => {
    setContactPickerSupported(
      typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window
    );
  }, []);

  /* ── Computed ─────────────────────────────────────────────────── */

  const guestsByList = useMemo(() => ({
    A: guests.filter(g => (g.guestList || "A") === "A"),
    B: guests.filter(g => g.guestList === "B"),
    C: guests.filter(g => g.guestList === "C"),
  }), [guests]);

  const currentListGuests = guestsByList[activeList];

  const filtered = currentListGuests.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "todos" || g.category === filterCategory;
    const matchStatus = filterStatus === "todos" || g.rsvpStatus === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // KPIs for active list
  const total = currentListGuests.length;
  const confirmados = currentListGuests.filter((g) => g.rsvpStatus === "confirmado").length;
  const pendentes = currentListGuests.filter((g) => g.rsvpStatus === "pendente").length;
  const recusados = currentListGuests.filter((g) => g.rsvpStatus === "recusado").length;
  const pctConfirmados = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  // Global stats
  const totalAll = guests.length;
  const totalA = guestsByList.A.length;

  /* ── Actions ───────────────────────────────────────────────────── */

  async function handleContactPicker() {
    if (!contactPickerSupported) return;
    setPickingContacts(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (navigator as any).contacts.select(["name", "tel"], { multiple: true });
      const parsed: { name: string; phone: string; suggested?: string }[] = [];
      for (const entry of raw) {
        const name = (entry.name?.[0] ?? "").trim();
        const phone = (entry.tel?.[0] ?? "").trim();
        if (name) parsed.push({ name, phone });
      }
      if (parsed.length === 0) return;

      setPickedContacts(parsed);
      setPickedCategory("familia_noivo");
      setPickedList(activeList);

      // Clean names via AI in background
      setCleaningNames(true);
      try {
        const res = await fetch("/api/ai/clean-names", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: parsed }),
        });
        if (res.ok) {
          const { cleaned } = await res.json() as { cleaned: string[] };
          setPickedContacts((prev) =>
            prev.map((c, i) => ({
              ...c,
              suggested: cleaned[i] && cleaned[i] !== c.name ? cleaned[i] : undefined,
            }))
          );
        }
      } catch {
        // AI failed — silently ignore
      } finally {
        setCleaningNames(false);
      }
    } catch {
      // cancelled or permission denied
    } finally {
      setPickingContacts(false);
    }
  }

  async function confirmImportContacts() {
    if (pickedContacts.length === 0) return;
    setImportingContacts(true);
    try {
      const payload = pickedContacts.map((c) => ({
        name: c.suggested || c.name,
        phone: c.phone,
        category: pickedCategory,
        guestList: pickedList,
        rsvpStatus: "pendente",
      }));
      const res = await fetch(`/api/weddings/${weddingId}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: payload }),
      });
      if (res.ok) {
        await fetchGuests();
        setPickedContacts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportingContacts(false);
    }
  }

  async function cycleStatus(guest: Guest) {
    const newStatus = STATUS_CYCLE[guest.rsvpStatus];
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/guests/${guest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: guest.name, rsvpStatus: newStatus }),
        }
      );
      if (res.ok) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id ? { ...g, rsvpStatus: newStatus } : g
          )
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status", err);
    }
  }

  async function moveGuestToList(guest: Guest, targetList: GuestListType) {
    try {
      const res = await fetch(
        `/api/weddings/${weddingId}/guests/${guest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestList: targetList }),
        }
      );
      if (res.ok) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id ? { ...g, guestList: targetList } : g
          )
        );
        setMoveTarget(null);
      }
    } catch (err) {
      console.error("Erro ao mover convidado", err);
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
          guestList: formList,
          rsvpStatus: formStatus,
        }),
      });
      if (res.ok) {
        const newGuest = await res.json();
        setGuests((prev) => [...prev, { ...newGuest, guestList: newGuest.guestList || formList }]);
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
    setFormList(activeList);
    setFormStatus("pendente");
  }

  /* ── Auth guard ────────────────────────────────────────────────── */

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-ivory py-6 px-4 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl text-midnight">
              Convidados
            </h1>
            <p className="font-body text-sm text-gray-500 mt-1">
              {totalAll} convidado{totalAll !== 1 ? "s" : ""} no total &middot; {totalA} na lista oficial
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWhatsApp(!showWhatsApp)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-body font-medium bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
              title="Confirmação via WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Confirmar</span>
            </button>
            <button
              onClick={contactPickerSupported ? handleContactPicker : undefined}
              disabled={pickingContacts}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition flex-shrink-0 ${
                contactPickerSupported
                  ? "bg-midnight text-white hover:bg-midnight/90 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-default"
              }`}
              title={contactPickerSupported ? "Importar contatos da agenda" : "Disponível no Chrome para Android"}
            >
              {pickingContacts ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <PeopleIcon className="w-4 h-4" />
              )}
              Importar
            </button>
          </div>
        </div>

        {/* ── WhatsApp Blast Modal ─────────────────────────────────── */}
        {showWhatsApp && (
          <WhatsAppBlast
            weddingId={weddingId}
            guests={guests.map((g) => ({
              id: g.id,
              name: g.name,
              phone: g.phone || null,
              rsvpStatus: g.rsvpStatus,
              guestList: g.guestList,
              whatsappSentAt: g.whatsappSentAt ?? null,
            }))}
            weddingInfo={weddingInfo}
            onClose={() => setShowWhatsApp(false)}
            onSent={(sentIds) => {
              const now = new Date().toISOString();
              setGuests((prev) =>
                prev.map((g) =>
                  sentIds.includes(g.id) ? { ...g, whatsappSentAt: now } : g
                )
              );
            }}
          />
        )}

        {/* ── List Tabs (A / B / C) ────────────────────────────────── */}
        <div className="flex gap-2 mb-2">
          {(["A", "B", "C"] as GuestListType[]).map((listType) => {
            const meta = LIST_META[listType];
            const count = guestsByList[listType].length;
            const isActive = activeList === listType;
            return (
              <button
                key={listType}
                onClick={() => setActiveList(listType)}
                className={`flex-1 sm:flex-initial relative px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white shadow-md text-midnight ring-2 ring-midnight/30"
                    : "bg-white/50 text-gray-500 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-base">{meta.emoji}</span>
                  <span>{meta.label}</span>
                  <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold ${
                    isActive ? meta.color : "bg-gray-200 text-gray-600"
                  }`}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* List description + insight */}
        <div className="mb-6">
          <p className="font-body text-xs text-gray-400 px-1">
            {LIST_META[activeList].desc}
          </p>
          {activeList === "B" && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <p className="font-body text-xs text-amber-700">
                <strong>Dica:</strong> Nossa matematica de presenca e bem realista — a Lista B acaba sendo mais
                uma seguranca do que necessidade. Use para organizar, mas confie nos numeros da Lista Oficial.
              </p>
            </div>
          )}
          {activeList === "A" && totalA > 0 && (
            <div className="mt-2 bg-midnight/5 border border-midnight/10 rounded-xl px-3 py-2">
              <p className="font-body text-xs text-midnight">
                <strong>Lista Oficial</strong> — sua cerimonialista tem acesso a esta lista para coordenar
                logistica, buffet e layout das mesas.
              </p>
            </div>
          )}
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <PeopleIcon className="w-5 h-5 text-midnight" />
              <span className="font-body text-sm text-gray-500">Total</span>
            </div>
            <p className="font-heading text-3xl text-midnight">{total}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="font-body text-sm text-gray-500">Confirmados</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl text-midnight">{confirmados}</p>
              <span className="font-body text-sm text-green-600">{pctConfirmados}%</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-body text-sm text-gray-500">Pendentes</span>
            </div>
            <p className="font-heading text-3xl text-midnight">{pendentes}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="font-body text-sm text-gray-500">Recusados</span>
            </div>
            <p className="font-heading text-3xl text-midnight">{recusados}</p>
          </div>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200 appearance-none"
          >
            <option value="todos">Todos</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200 appearance-none"
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
            <p className="font-body text-gray-400 mb-2">
              {currentListGuests.length === 0
                ? `Nenhum convidado na ${LIST_META[activeList].label}`
                : "Nenhum resultado encontrado"}
            </p>
            {currentListGuests.length === 0 && (
              <p className="font-body text-sm text-gray-400">
                Adicione convidados usando o botao <span className="text-gold font-semibold">+</span> ou importe da sua agenda
              </p>
            )}
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
                      Local
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Categoria
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Status
                    </th>
                    <th className="text-left font-body text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4">
                      Mover
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
                    const wasSent = !!guest.whatsappSentAt;
                    const sentDate = guest.whatsappSentAt
                      ? new Date(guest.whatsappSentAt).toLocaleDateString("pt-BR")
                      : null;

                    return (
                      <tr
                        key={guest.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-midnight text-white flex items-center justify-center font-body text-sm font-semibold shrink-0">
                              {getInitials(guest.name)}
                            </div>
                            <div>
                              <span className="font-body text-midnight font-medium block">
                                {guest.name}
                              </span>
                              {wasSent && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-body font-semibold bg-green-100 text-green-700 mt-0.5"
                                  title={`WhatsApp enviado em ${sentDate}`}
                                >
                                  <WhatsAppIcon className="w-2.5 h-2.5" />
                                  Enviado{sentDate ? ` ${sentDate}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-body text-sm text-gray-600">
                          {guest.phone || "---"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {ddd && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body font-semibold bg-gray-100 text-gray-500">
                                {ddd}
                              </span>
                            )}
                            <span className="font-body text-sm text-gray-600">
                              {location || (dddState ? dddState : "---")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium ${CATEGORY_COLORS[guest.category] || "bg-gray-100 text-gray-600"}`}>
                            {CATEGORY_LABELS[guest.category] || guest.category || "---"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => cycleStatus(guest)}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium cursor-pointer transition-colors ${STATUS_COLORS[guest.rsvpStatus]}`}
                          >
                            {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            {(["A", "B", "C"] as GuestListType[])
                              .filter(l => l !== activeList)
                              .map(targetList => (
                                <button
                                  key={targetList}
                                  onClick={() => moveGuestToList(guest, targetList)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-body font-semibold hover:shadow-sm transition-all border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-midnight"
                                  title={`Mover para ${LIST_META[targetList].label}`}
                                >
                                  {targetList}
                                </button>
                              ))}
                          </div>
                        </td>
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
                const wasSentMobile = !!guest.whatsappSentAt;
                const sentDateMobile = guest.whatsappSentAt
                  ? new Date(guest.whatsappSentAt).toLocaleDateString("pt-BR")
                  : null;

                return (
                  <div key={guest.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-midnight text-white flex items-center justify-center font-body text-sm font-semibold shrink-0">
                          {getInitials(guest.name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-body text-midnight font-medium">{guest.name}</p>
                            {wasSentMobile && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-body font-semibold bg-green-100 text-green-700"
                                title={`WhatsApp enviado em ${sentDateMobile}`}
                              >
                                <WhatsAppIcon className="w-2.5 h-2.5" />
                                {sentDateMobile}
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-gray-400">{guest.phone || "Sem telefone"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMoveTarget(guest)}
                        className="p-2 rounded-lg text-gray-400 hover:text-midnight hover:bg-midnight/10 transition-colors"
                        title="Mover para outra lista"
                      >
                        <ArrowIcon className="w-4 h-4" direction="right" />
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium ${CATEGORY_COLORS[guest.category] || "bg-gray-100 text-gray-600"}`}>
                        {CATEGORY_LABELS[guest.category] || guest.category || "---"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cycleStatus(guest)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-medium cursor-pointer transition-colors ${STATUS_COLORS[guest.rsvpStatus]}`}
                        >
                          {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGuest(guest.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            setFormList(activeList);
            setModalOpen(true);
          }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gold text-white rounded-full shadow-lg hover:bg-gold/90 transition-all duration-200 flex items-center justify-center z-40"
        >
          <PlusIcon />
        </button>

        {/* ── Move Guest Modal (Mobile) ───────────────────────────── */}
        <AnimatePresence>
          {moveTarget && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMoveTarget(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 z-10"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h3 className="font-heading text-lg text-midnight mb-1">
                  Mover {moveTarget.name}
                </h3>
                <p className="font-body text-sm text-gray-500 mb-4">
                  Atualmente na {LIST_META[moveTarget.guestList || "A" as GuestListType].label}
                </p>
                <div className="space-y-2">
                  {(["A", "B", "C"] as GuestListType[])
                    .filter(l => l !== (moveTarget.guestList || "A"))
                    .map(targetList => {
                      const meta = LIST_META[targetList];
                      return (
                        <button
                          key={targetList}
                          onClick={() => moveGuestToList(moveTarget, targetList)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-midnight hover:bg-midnight/5 transition-all text-left"
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${meta.color}`}>
                            {meta.emoji}
                          </span>
                          <div>
                            <p className="font-body text-sm font-medium text-midnight">{meta.label}</p>
                            <p className="font-body text-xs text-gray-400">{meta.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                </div>
                <button
                  onClick={() => setMoveTarget(null)}
                  className="w-full mt-3 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-body text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Import Contacts Modal ─────────────────────────────── */}
        <AnimatePresence>
          {pickedContacts.length > 0 && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setPickedContacts([])}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 max-h-[80vh] flex flex-col"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h2 className="font-heading text-xl text-midnight mb-1">
                  {pickedContacts.length} contato{pickedContacts.length !== 1 ? "s" : ""} selecionado{pickedContacts.length !== 1 ? "s" : ""}
                </h2>
                <p className="font-body text-sm text-gray-500 mb-4">
                  Escolha a categoria e para qual lista importar:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block font-body text-xs text-gray-500 mb-1">Categoria</label>
                    <select
                      value={pickedCategory}
                      onChange={(e) => setPickedCategory(e.target.value as Category)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none appearance-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-gray-500 mb-1">Importar para</label>
                    <select
                      value={pickedList}
                      onChange={(e) => setPickedList(e.target.value as GuestListType)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none appearance-none"
                    >
                      <option value="A">{LIST_META.A.emoji} Lista Oficial</option>
                      <option value="B">{LIST_META.B.emoji} Lista Reserva</option>
                      <option value="C">{LIST_META.C.emoji} Lista Talvez</option>
                    </select>
                  </div>
                </div>

                {pickedList !== "A" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                    <p className="font-body text-xs text-amber-700">
                      Convidados importados para a <strong>{LIST_META[pickedList].label}</strong> nao serao vistos pela cerimonialista.
                      Voce pode move-los para a Lista Oficial depois.
                    </p>
                  </div>
                )}

                {cleaningNames && (
                  <div className="flex items-center gap-2 mb-3 text-xs font-body text-midnight">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    IA verificando os nomes...
                  </div>
                )}

                <div className="overflow-y-auto flex-1 space-y-2 mb-5">
                  {pickedContacts.map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {c.suggested ? (
                            <>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-body text-sm font-semibold text-midnight">{c.suggested}</p>
                                <span className="text-[10px] font-body bg-midnight/10 text-midnight px-2 py-0.5 rounded-full">sugerido pela IA</span>
                              </div>
                              <p className="font-body text-xs text-gray-400 line-through mt-0.5">{c.name}</p>
                              <div className="flex gap-3 mt-1">
                                <button
                                  onClick={() =>
                                    setPickedContacts((prev) =>
                                      prev.map((p, j) => j === i ? { ...p, name: p.suggested!, suggested: undefined } : p)
                                    )
                                  }
                                  className="text-[11px] font-body text-midnight underline"
                                >
                                  Aceitar sugestao
                                </button>
                                <button
                                  onClick={() =>
                                    setPickedContacts((prev) =>
                                      prev.map((p, j) => j === i ? { ...p, suggested: undefined } : p)
                                    )
                                  }
                                  className="text-[11px] font-body text-gray-400 underline"
                                >
                                  Manter original
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="font-body text-sm font-medium text-midnight">{c.name}</p>
                          )}
                          {c.phone && <p className="font-body text-xs text-gray-400 mt-0.5">{c.phone}</p>}
                        </div>
                        <button
                          onClick={() => setPickedContacts((prev) => prev.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPickedContacts([])}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-body font-medium hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmImportContacts}
                    disabled={importingContacts}
                    className="flex-1 px-4 py-3 bg-midnight text-white rounded-xl font-body font-medium hover:bg-midnight/90 transition disabled:opacity-40"
                  >
                    {importingContacts ? "Adicionando..." : `Adicionar na Lista ${pickedList}`}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <motion.div
                className="absolute inset-0 bg-black/40"
                onClick={() => setModalOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h2 className="font-heading text-2xl text-midnight mb-6">
                  Novo Convidado
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="guest-name" className="block font-body text-sm text-gray-500 mb-1">Nome</label>
                    <input
                      id="guest-name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-phone" className="block font-body text-sm text-gray-500 mb-1">Telefone</label>
                    <input
                      id="guest-phone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-email" className="block font-body text-sm text-gray-500 mb-1">Email</label>
                    <input
                      id="guest-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="guest-category" className="block font-body text-sm text-gray-500 mb-1">Categoria</label>
                      <select
                        id="guest-category"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as Category)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none appearance-none"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="guest-list" className="block font-body text-sm text-gray-500 mb-1">Lista</label>
                      <select
                        id="guest-list"
                        value={formList}
                        onChange={(e) => setFormList(e.target.value as GuestListType)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none appearance-none"
                      >
                        <option value="A">{LIST_META.A.emoji} Oficial</option>
                        <option value="B">{LIST_META.B.emoji} Reserva</option>
                        <option value="C">{LIST_META.C.emoji} Talvez</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guest-status" className="block font-body text-sm text-gray-500 mb-1">Status</label>
                    <select
                      id="guest-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as Status)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-body text-midnight bg-white focus:border-midnight focus:ring-1 focus:ring-midnight outline-none transition-all duration-200 appearance-none"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="recusado">Recusado</option>
                    </select>
                  </div>
                </div>

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
                    className="flex-1 px-4 py-3 bg-gold text-white rounded-xl font-body font-medium hover:bg-gold/90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
