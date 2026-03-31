"use client";

import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { parsePhone, formatPhone } from "@/lib/parse-phone";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Contact {
  id: string;
  name: string;
  ddi: string;   // country code, e.g. "55"
  ddd: string;   // area code,     e.g. "11"
  phone: string; // local digits after DDD
  city: string;
  state: string;
  category: string;
}

const CATEGORIES = [
  "Familia Noivo",
  "Familia Noiva",
  "Amigos Noivo",
  "Amigos Noiva",
  "Trabalho",
] as const;

// Common DDI codes for the dropdown
const DDI_OPTIONS = [
  { code: "55", flag: "🇧🇷", label: "Brasil (+55)" },
  { code: "1",  flag: "🇺🇸", label: "EUA/Canadá (+1)" },
  { code: "351", flag: "🇵🇹", label: "Portugal (+351)" },
  { code: "54",  flag: "🇦🇷", label: "Argentina (+54)" },
  { code: "598", flag: "🇺🇾", label: "Uruguai (+598)" },
  { code: "56",  flag: "🇨🇱", label: "Chile (+56)" },
  { code: "34",  flag: "🇪🇸", label: "Espanha (+34)" },
  { code: "39",  flag: "🇮🇹", label: "Itália (+39)" },
  { code: "44",  flag: "🇬🇧", label: "Reino Unido (+44)" },
  { code: "49",  flag: "🇩🇪", label: "Alemanha (+49)" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildContact(name: string, rawPhone: string, ddi = "55"): Contact {
  const parsed = parsePhone(rawPhone, ddi);
  return {
    id: uid(),
    name: name.trim(),
    ddi: parsed.ddi,
    ddd: parsed.ddd,
    phone: parsed.phone,
    city: parsed.city ?? "",
    state: parsed.state ?? "",
    category: CATEGORIES[0],
  };
}

/**
 * CSV format supported:
 *   - 3 columns: Nome, DDI, Telefone   (new preferred format)
 *   - 2 columns: Nome, Telefone        (legacy, assumes DDI=55)
 * Separator: comma or semicolon. First row can be a header (skipped).
 */
function parseCsvText(text: string): Contact[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const sep = line.includes(";") ? ";" : ",";
      const cols = line.split(sep).map((s) => s.trim().replace(/^"|"$/g, ""));

      // Skip header row
      if (cols[0].toLowerCase() === "nome") return null;

      let name: string;
      let ddi: string;
      let rawPhone: string;

      if (cols.length >= 3) {
        // Nome, DDI, Telefone
        [name, ddi, rawPhone] = cols;
        ddi = ddi.replace(/\D/g, "") || "55";
      } else if (cols.length === 2) {
        // Nome, Telefone (legacy)
        [name, rawPhone] = cols;
        ddi = "55";
      } else {
        return null;
      }

      if (!name || !rawPhone) return null;
      return buildContact(name, rawPhone, ddi);
    })
    .filter((c): c is Contact => c !== null);
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ImportarContatosPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useSession();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Manual add state
  const [manualName, setManualName] = useState("");
  const [manualDdi, setManualDdi] = useState("55");
  const [manualPhone, setManualPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactPickerSupported, setContactPickerSupported] = useState(false);
  const [pickingContacts, setPickingContacts] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContactPickerSupported(
      typeof navigator !== "undefined" &&
        "contacts" in navigator &&
        "ContactsManager" in (window as Window & { ContactsManager?: unknown })
    );
  }, []);

  /* ---- Contact Picker API ---- */

  async function handleContactPicker() {
    if (!contactPickerSupported) return;
    setPickingContacts(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (navigator as any).contacts.select(["name", "tel"], { multiple: true });
      const parsed: Contact[] = [];
      for (const entry of raw) {
        const name = (entry.name?.[0] ?? "").trim();
        const tel = (entry.tel?.[0] ?? "").trim();
        if (!name || !tel) continue;
        parsed.push(buildContact(name, tel, "55"));
      }
      if (parsed.length > 0) setContacts((prev) => [...prev, ...parsed]);
    } catch {
      // user cancelled or permission denied
    } finally {
      setPickingContacts(false);
    }
  }

  /* ---- File handling ---- */

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }, []);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsvText(text);
      setContacts((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file, "UTF-8");
  }

  /* ---- Manual add ---- */

  function handleAddManual() {
    if (!manualName.trim() || !manualPhone.trim()) return;
    setContacts((prev) => [...prev, buildContact(manualName, manualPhone, manualDdi)]);
    setManualName("");
    setManualPhone("");
  }

  /* ---- Contact mutations ---- */

  function updateContact(contactId: string, patch: Partial<Contact>) {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, ...patch } : c))
    );
  }

  function removeContact(contactId: string) {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  }

  /* ---- Submit ---- */

  async function handleImport() {
    if (contacts.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weddings/${id}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: contacts.map((c) => ({
            name: c.name,
            // Store full international number: +DDI DDD PHONE
            phone: c.ddi === "55"
              ? `+55${c.ddd}${c.phone}`
              : `+${c.ddi}${c.ddd}${c.phone}`,
            ddd: c.ddd || null,
            city: c.city || null,
            state: c.state || null,
            category: c.category,
          })),
        }),
      });
      if (!res.ok) throw new Error("Erro ao importar contatos");
      router.push(`/casamento/${id}/convidados`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  /* ---- Summary ---- */

  const totalContacts = contacts.length;
  const withCity = contacts.filter((c) => c.city).length;
  const pct = totalContacts > 0 ? Math.round((withCity / totalContacts) * 100) : 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-ivory py-8 px-4 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/casamento/${id}/convidados`} className="p-2 rounded-xl hover:bg-midnight/5 transition text-midnight/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-midnight">Importar Contatos</h1>
            <p className="font-body text-sm text-midnight/60">CSV, agenda do celular ou manual</p>
          </div>
        </div>

        {/* ── Contact Picker ── */}
        <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm p-5">
          <p className="font-body text-[10px] font-medium tracking-[0.18em] uppercase text-gold mb-3">Importar do celular</p>
          {contactPickerSupported ? (
            <button
              onClick={handleContactPicker}
              disabled={pickingContacts}
              className="flex items-center gap-3 w-full rounded-xl border-2 border-midnight/20 bg-midnight/5 hover:bg-midnight/10 px-4 py-3.5 transition disabled:opacity-50"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-midnight/15 text-midnight">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <div className="text-left flex-1">
                <p className="font-body text-sm font-semibold text-midnight">
                  {pickingContacts ? "Abrindo agenda…" : "Selecionar da agenda"}
                </p>
                <p className="font-body text-xs text-midnight/50">Escolha um ou vários contatos de uma vez</p>
              </div>
              {pickingContacts && (
                <svg className="h-4 w-4 animate-spin text-midnight" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 opacity-60">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-midnight/50">Selecionar da agenda</p>
                <p className="font-body text-xs text-midnight/40">Disponível no Chrome para Android</p>
              </div>
            </div>
          )}
        </div>

        {/* ── CSV Import ── */}
        <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm p-5">
          <p className="font-body text-[10px] font-medium tracking-[0.18em] uppercase text-gold mb-3">Importar CSV</p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-10 px-6 ${
              dragOver ? "border-midnight bg-midnight/5" : "border-gray-200 hover:border-midnight/40 hover:bg-midnight/3"
            }`}
          >
            <svg className="h-9 w-9 text-midnight/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-body text-sm text-midnight/70 text-center">
              Arraste um arquivo CSV ou{" "}
              <span className="text-midnight font-semibold underline">clique para selecionar</span>
            </p>
          </div>

          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />

          {/* Format guide */}
          <div className="mt-4 rounded-xl bg-fog border border-midnight/8 p-4">
            <p className="font-body text-xs font-semibold text-midnight mb-2">Formato do CSV</p>
            <div className="space-y-2">
              <div>
                <p className="font-body text-[10px] text-gold uppercase tracking-wider mb-1">Recomendado (com DDI)</p>
                <code className="block font-mono text-xs bg-white rounded-lg px-3 py-2 text-midnight border border-midnight/10">
                  Nome,DDI,Telefone<br />
                  João Silva,55,11999999999<br />
                  Maria Costa,55,21988887777<br />
                  John Smith,1,2125551234
                </code>
              </div>
              <div>
                <p className="font-body text-[10px] text-stone uppercase tracking-wider mb-1">Legado (DDI assume +55)</p>
                <code className="block font-mono text-xs bg-white rounded-lg px-3 py-2 text-midnight/60 border border-midnight/8">
                  Nome,Telefone<br />
                  João Silva,11999999999
                </code>
              </div>
            </div>
            <p className="font-body text-[10px] text-stone mt-2">Separador: vírgula ou ponto e vírgula. Aceita cabeçalho ou não.</p>
          </div>
        </div>

        {/* ── Manual Add ── */}
        <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm p-5">
          <p className="font-body text-[10px] font-medium tracking-[0.18em] uppercase text-gold mb-3">Adicionar manualmente</p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome completo"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
              className="font-body w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-midnight placeholder:text-gray-400 focus:border-midnight focus:ring-1 focus:ring-midnight outline-none"
            />

            {/* DDI + Phone row */}
            <div className="flex gap-2">
              {/* DDI selector */}
              <div className="flex-shrink-0">
                <label className="font-body text-[10px] text-stone uppercase tracking-wider block mb-1">DDI</label>
                <div className="relative">
                  <select
                    value={manualDdi}
                    onChange={(e) => setManualDdi(e.target.value)}
                    className="font-body appearance-none rounded-xl border border-gray-200 pl-3 pr-7 py-3 text-sm text-midnight bg-white focus:border-midnight outline-none cursor-pointer"
                  >
                    {DDI_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.flag} +{opt.code}
                      </option>
                    ))}
                    <option value="outro">Outro</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Phone number */}
              <div className="flex-1">
                <label className="font-body text-[10px] text-stone uppercase tracking-wider block mb-1">
                  {manualDdi === "55" ? "DDD + Número" : "Número"}
                </label>
                <div className="flex items-center rounded-xl border border-gray-200 focus-within:border-midnight focus-within:ring-1 focus-within:ring-midnight overflow-hidden">
                  <span className="pl-3 font-body text-sm text-stone select-none">+{manualDdi}</span>
                  <input
                    type="tel"
                    placeholder={manualDdi === "55" ? "11 99999-9999" : "número"}
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                    className="font-body flex-1 bg-transparent px-2 py-3 text-sm text-midnight placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddManual}
              disabled={!manualName.trim() || !manualPhone.trim()}
              className="font-body w-full rounded-xl bg-midnight px-6 py-3 text-sm font-semibold text-white hover:bg-midnight/85 transition disabled:opacity-40"
            >
              + Adicionar contato
            </button>
          </div>
        </div>

        {/* ── Contact List ── */}
        {contacts.length > 0 && (
          <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] font-medium tracking-[0.18em] uppercase text-gold">
                Contatos ({totalContacts})
              </p>
              <span className="font-body text-xs text-stone">
                {withCity} com cidade ({pct}%)
              </span>
            </div>

            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-xl border border-gray-100 bg-fog/50 p-3.5 space-y-2.5">
                  {/* Name row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-midnight truncate">{c.name}</p>
                      <p className="font-body text-xs text-stone mt-0.5">
                        {formatPhone(c.ddd, c.phone, c.ddi)}
                        {c.city && <span className="ml-1.5 text-midnight/50">· {c.city}{c.state ? `, ${c.state}` : ""}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => removeContact(c.id)}
                      className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* DDI + Category row */}
                  <div className="flex gap-2 items-center flex-wrap">
                    {/* DDI badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-midnight/8 text-midnight text-[10px] font-body font-semibold">
                      {DDI_OPTIONS.find(o => o.code === c.ddi)?.flag ?? "🌍"} +{c.ddi}
                    </span>
                    {c.ddd && (
                      <span className="px-2 py-0.5 rounded-full bg-midnight/5 text-midnight text-[10px] font-body font-medium">
                        DDD {c.ddd}
                      </span>
                    )}
                    {/* Category */}
                    <select
                      value={c.category}
                      onChange={(e) => updateContact(c.id, { category: e.target.value })}
                      className="ml-auto rounded-lg border border-gray-200 px-2 py-1 text-xs text-midnight bg-white outline-none font-body"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="font-body rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={loading || contacts.length === 0}
              className="font-body w-full rounded-xl bg-gold px-8 py-3.5 text-sm font-semibold text-white hover:bg-gold/85 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importando...
                </span>
              ) : (
                `Importar ${totalContacts} contato${totalContacts !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
