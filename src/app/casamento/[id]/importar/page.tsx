"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { parsePhone, formatPhone } from "@/lib/parse-phone";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Contact {
  id: string;
  name: string;
  phone: string;
  ddd: string;
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildContact(name: string, rawPhone: string): Contact {
  const parsed = parsePhone(rawPhone);
  return {
    id: uid(),
    name: name.trim(),
    phone: parsed.phone,
    ddd: parsed.ddd,
    city: parsed.city ?? "",
    state: parsed.state ?? "",
    category: CATEGORIES[0],
  };
}

function parseCsvText(text: string): Contact[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.includes(";") ? ";" : ",";
      const [name, phone] = line.split(sep).map((s) => s.trim());
      if (!name || !phone) return null;
      return buildContact(name, phone);
    })
    .filter((c): c is Contact => c !== null);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ImportarContatosPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useSession(); // ensure authenticated

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- Drag & drop ---- */

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

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
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsvText(text);
      setContacts((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  }

  /* ---- Manual add ---- */

  function handleAddManual() {
    if (!manualName.trim() || !manualPhone.trim()) return;
    setContacts((prev) => [...prev, buildContact(manualName, manualPhone)]);
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
            phone: c.phone,
            ddd: c.ddd,
            city: c.city,
            state: c.state,
            category: c.category,
          })),
        }),
      });
      if (!res.ok) throw new Error("Erro ao importar contatos");
      router.push(`/casamento/${id}/simulador`);
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

  /* ---- Render ---- */

  return (
    <main className="min-h-screen bg-[#F7F7F7] py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#1A3A33]">
            Importar Contatos
          </h1>
          <p className="font-body mt-1 text-[#1A3A33]/70">
            Adicione os convidados via arquivo CSV ou manualmente.
          </p>
        </div>

        {/* CSV Drop Zone */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1A3A33] mb-4">
            Importar CSV
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-12 px-6 ${
              dragOver
                ? "border-[#2C6B5E] bg-[#2C6B5E]/5"
                : "border-gray-300 hover:border-[#2C6B5E] hover:bg-[#2C6B5E]/5"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#2C6B5E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="font-body text-sm text-[#1A3A33]/70 text-center">
              Arraste um arquivo CSV aqui ou{" "}
              <span className="text-[#2C6B5E] font-semibold underline">
                clique para selecionar
              </span>
            </p>
            <p className="font-body text-xs text-gray-400">
              Formato: nome,telefone (ou nome;telefone) por linha
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Manual Add */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-heading text-lg font-semibold text-[#1A3A33] mb-4">
            Adicionar manualmente
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
              className="font-body flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1A3A33] placeholder:text-gray-400 focus:border-[#2C6B5E] focus:ring-1 focus:ring-[#2C6B5E] outline-none"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
              className="font-body flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1A3A33] placeholder:text-gray-400 focus:border-[#2C6B5E] focus:ring-1 focus:ring-[#2C6B5E] outline-none"
            />
            <button
              onClick={handleAddManual}
              className="font-body rounded-lg bg-[#2C6B5E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#245a4f] transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Contact List */}
        {contacts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-[#1A3A33]">
              Contatos ({totalContacts})
            </h2>

            {/* Summary bar */}
            <div className="font-body rounded-lg bg-[#F7F7F7] px-4 py-3 text-sm text-[#1A3A33]/80">
              {totalContacts} contato{totalContacts !== 1 ? "s" : ""} &mdash;{" "}
              {withCity} com cidade identificada ({pct}%)
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-[#1A3A33]/50">
                    <th className="pb-3 pr-3">Nome</th>
                    <th className="pb-3 pr-3">Telefone</th>
                    <th className="pb-3 pr-3">DDD</th>
                    <th className="pb-3 pr-3">Cidade</th>
                    <th className="pb-3 pr-3">Estado</th>
                    <th className="pb-3 pr-3">Categoria</th>
                    <th className="pb-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 pr-3 text-[#1A3A33]">{c.name}</td>
                      <td className="py-3 pr-3 text-[#1A3A33]">
                        {formatPhone(c.ddd, c.phone)}
                      </td>
                      <td className="py-3 pr-3">
                        {c.ddd && (
                          <span className="inline-block rounded-full bg-[#2C6B5E]/10 text-[#2C6B5E] text-xs font-semibold px-2.5 py-0.5">
                            {c.ddd}
                            {c.city ? ` - ${c.city}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <input
                          type="text"
                          value={c.city}
                          onChange={(e) =>
                            updateContact(c.id, { city: e.target.value })
                          }
                          className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E]"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <input
                          type="text"
                          value={c.state}
                          onChange={(e) =>
                            updateContact(c.id, { state: e.target.value })
                          }
                          className="w-24 rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E]"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={c.category}
                          onChange={(e) =>
                            updateContact(c.id, { category: e.target.value })
                          }
                          className="rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E] bg-white"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => removeContact(c.id)}
                          className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label={`Remover ${c.name}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-100 bg-[#F7F7F7] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-semibold text-[#1A3A33]">
                        {c.name}
                      </p>
                      <p className="font-body text-sm text-[#1A3A33]/70">
                        {formatPhone(c.ddd, c.phone)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeContact(c.id)}
                      className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label={`Remover ${c.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {c.ddd && (
                    <span className="inline-block rounded-full bg-[#2C6B5E]/10 text-[#2C6B5E] text-xs font-semibold px-2.5 py-0.5">
                      {c.ddd}
                      {c.city ? ` - ${c.city}` : ""}
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-body text-xs text-gray-400">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={c.city}
                        onChange={(e) =>
                          updateContact(c.id, { city: e.target.value })
                        }
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E]"
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs text-gray-400">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={c.state}
                        onChange={(e) =>
                          updateContact(c.id, { state: e.target.value })
                        }
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-body text-xs text-gray-400">
                      Categoria
                    </label>
                    <select
                      value={c.category}
                      onChange={(e) =>
                        updateContact(c.id, { category: e.target.value })
                      }
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-[#1A3A33] outline-none focus:border-[#2C6B5E] bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="font-body rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Import button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleImport}
                disabled={loading || contacts.length === 0}
                className="font-body rounded-lg bg-[#C4734F] px-8 py-3 text-sm font-semibold text-white hover:bg-[#b3644a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Importando...
                  </span>
                ) : (
                  `Importar todos (${totalContacts})`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
