"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

interface OcrItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface OcrResult {
  vendor: string;
  category: string;
  items: OcrItem[];
  paymentTerms: string | null;
  validUntil: string | null;
  totalValue: number;
  notes: string | null;
  rawOcrText: string;
}

interface WeddingInfo {
  id: string;
  couple: string;
}

interface VendorInfo {
  id: string;
  name: string;
  category: string;
  weddingId: string;
}


const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function ImportarOrcamentoPage() {
  const { status: authStatus } = useSession();
  const [weddings, setWeddings] = useState<WeddingInfo[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState("");
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [editedItems, setEditedItems] = useState<OcrItem[]>([]);
  const [editedVendorName, setEditedVendorName] = useState("");
  const [editedTotal, setEditedTotal] = useState(0);
  const [editedPaymentTerms, setEditedPaymentTerms] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/planner/weddings")
      .then((r) => r.json())
      .then((data) => {
        const list: WeddingInfo[] = (Array.isArray(data) ? data : []).map(
          (a: { wedding: { id: string; partnerName1: string; partnerName2: string } }) => ({
            id: a.wedding.id,
            couple: `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`,
          })
        );
        setWeddings(list);
        if (list.length > 0) setSelectedWeddingId(list[0].id);
      })
      .catch(console.error);
  }, [authStatus]);

  useEffect(() => {
    if (!selectedWeddingId) return;
    fetch(`/api/weddings/${selectedWeddingId}/vendors`)
      .then((r) => r.json())
      .then((data) => setVendors(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedWeddingId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setSaved(false);
    setError(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "application/pdf": [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  async function handleProcess() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ocr/quote", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao processar");
      }
      const data: OcrResult = await res.json();
      setResult(data);
      setEditedItems(
        (data.items || []).map((item) => ({
          description: item.description || "",
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
          total: item.total || 0,
        }))
      );
      setEditedVendorName(data.vendor || "");
      setEditedTotal(data.totalValue || 0);
      setEditedPaymentTerms(data.paymentTerms || "");
      setEditedNotes(data.notes || "");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  function updateItem(index: number, field: keyof OcrItem, value: string | number) {
    setEditedItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === "description" ? value : Number(value) };
      if (field === "qty" || field === "unitPrice") {
        next[index].total = next[index].qty * next[index].unitPrice;
      }
      return next;
    });
  }

  function addItem() {
    setEditedItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0, total: 0 }]);
  }

  function removeItem(index: number) {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  }

  function recalcTotal() {
    const sum = editedItems.reduce((acc, item) => acc + (item.total || 0), 0);
    setEditedTotal(sum);
  }

  async function handleSave() {
    if (!selectedWeddingId || !selectedVendorId || !result) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/weddings/${selectedWeddingId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendorId,
          totalValue: editedTotal,
          items: editedItems,
          paymentTerms: editedPaymentTerms,
          notes: editedNotes,
          rawOcrText: result.rawOcrText,
          status: "pendente",
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
      setFile(null);
      setPreview(null);
      setResult(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div {...fadeUp} className="mb-8">
        <h1 className="font-heading text-3xl text-midnight">Importar Orçamento</h1>
        <p className="font-body text-sm text-midnight/50 mt-1">
          Envie uma foto ou PDF do orçamento e a AI extrai os itens automaticamente
        </p>
      </motion.div>

      {/* Saved success */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-body text-sm text-green-700">Orçamento salvo com sucesso!</span>
            <button
              onClick={() => setSaved(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload + selectors */}
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="space-y-4">
          {/* Wedding + Vendor selectors */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="font-heading text-lg text-midnight">Vincular a</h2>
            <div>
              <label className="block font-body text-sm text-midnight mb-1">Casamento</label>
              <select
                value={selectedWeddingId}
                onChange={(e) => setSelectedWeddingId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
              >
                {weddings.length === 0 && <option value="">Nenhum casamento</option>}
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>{w.couple}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-body text-sm text-midnight mb-1">Fornecedor</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
              >
                <option value="">Selecionar fornecedor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropzone */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-heading text-lg text-midnight mb-4">Arquivo do Orçamento</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragActive
                  ? "border-midnight bg-midnight/5"
                  : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-midnight/50 hover:bg-midnight/5"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <p className="font-body text-midnight font-medium">{file.name}</p>
                  <p className="font-body text-sm text-midnight/50 mt-1">
                    {(file.size / 1024).toFixed(0)} KB · {file.type}
                  </p>
                  <p className="font-body text-xs text-midnight mt-2">Clique para trocar</p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-midnight/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="font-body text-midnight/60">
                    {isDragActive ? "Solte o arquivo aqui" : "Arraste ou clique para enviar"}
                  </p>
                  <p className="font-body text-xs text-midnight/40 mt-1">
                    JPG, PNG, WebP ou PDF · máx. 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Image preview */}
            {preview && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-gray-50" />
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!file || processing || !selectedVendorId}
              className="mt-4 w-full py-2.5 rounded-xl bg-midnight text-white font-body text-sm hover:bg-midnight/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando com AI…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
                  </svg>
                  Extrair com AI
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right: Review table */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <AnimatePresence>
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg text-midnight">Revisar Itens</h2>
                  <span className="px-2 py-1 text-xs font-body bg-midnight/10 text-midnight rounded-full">
                    {result.category}
                  </span>
                </div>

                {/* Vendor name */}
                <div>
                  <label className="block font-body text-xs text-midnight/40 mb-1 uppercase tracking-wide">Fornecedor</label>
                  <input
                    value={editedVendorName}
                    onChange={(e) => setEditedVendorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
                  />
                </div>

                {/* Items table */}
                <div>
                  <label className="block font-body text-xs text-midnight/40 mb-2 uppercase tracking-wide">Itens</label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="text-left text-xs text-midnight/40 border-b">
                          <th className="pb-2 font-medium">Descrição</th>
                          <th className="pb-2 font-medium w-12 text-center">Qtd</th>
                          <th className="pb-2 font-medium w-24 text-right">Unit.</th>
                          <th className="pb-2 font-medium w-24 text-right">Total</th>
                          <th className="pb-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {editedItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5">
                              <input
                                value={item.description}
                                onChange={(e) => updateItem(idx, "description", e.target.value)}
                                className="w-full px-2 py-1 rounded border border-transparent hover:border-gray-200 focus:border-midnight focus:ring-1 focus:ring-midnight/20 outline-none text-sm"
                              />
                            </td>
                            <td className="py-1.5">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateItem(idx, "qty", e.target.value)}
                                className="w-12 px-1 py-1 rounded border border-transparent hover:border-gray-200 focus:border-midnight focus:ring-1 focus:ring-midnight/20 outline-none text-center text-sm"
                              />
                            </td>
                            <td className="py-1.5">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                                className="w-24 px-2 py-1 rounded border border-transparent hover:border-gray-200 focus:border-midnight focus:ring-1 focus:ring-midnight/20 outline-none text-right text-sm"
                              />
                            </td>
                            <td className="py-1.5 text-right text-midnight font-medium">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-1.5">
                              <button
                                onClick={() => removeItem(idx)}
                                className="p-1 text-gray-300 hover:text-red-400 transition"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={addItem}
                      className="text-xs font-body text-midnight hover:underline"
                    >
                      + Adicionar item
                    </button>
                    <button
                      onClick={recalcTotal}
                      className="text-xs font-body text-midnight/40 hover:text-midnight transition"
                    >
                      Recalcular total
                    </button>
                  </div>
                </div>

                {/* Payment terms & total */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/40 mb-1 uppercase tracking-wide">Condições</label>
                    <input
                      value={editedPaymentTerms}
                      onChange={(e) => setEditedPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition"
                      placeholder="Ex: 50% entrada + 50% no dia"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/40 mb-1 uppercase tracking-wide">Valor Total</label>
                    <input
                      type="number"
                      value={editedTotal}
                      onChange={(e) => setEditedTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition font-semibold text-midnight"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/40 mb-1 uppercase tracking-wide">Notas</label>
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:ring-2 focus:ring-midnight/30 focus:border-midnight outline-none transition resize-none"
                  />
                </div>

                {/* Total summary */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-body text-midnight/60 text-sm">Total do orçamento</span>
                  <span className="font-heading text-xl text-midnight">
                    {formatCurrency(editedTotal)}
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !selectedVendorId}
                  className="w-full py-3 rounded-xl bg-gold text-white font-body font-medium hover:bg-gold/90 transition disabled:opacity-40"
                >
                  {saving ? "Salvando…" : "Confirmar e Salvar"}
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <svg className="w-16 h-16 text-midnight/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-body text-midnight/40 text-sm">
                  Envie um arquivo e clique em<br />&quot;Extrair com AI&quot; para ver os itens aqui
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cost note */}
      <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="mt-4 font-body text-xs text-midnight/30 text-center">
        Custo estimado por extração: ~R$0,05 · Powered by GPT-4o Vision
      </motion.p>
    </div>
  );
}
