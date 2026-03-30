"use client";

interface EngagementData {
  estimatedGuests: number | null;
  guests: { rsvpStatus: string }[];
  vendors: { status: string }[];
  budgetItems: { actualCost: number | null }[];
  weddingDate: string | null;
  venue: string | null;
}

interface ScoreItem {
  label: string;
  done: boolean;
  value: string;
  weight: number;
}

function computeScore(data: EngagementData): { items: ScoreItem[]; score: number } {
  const totalGuests = data.guests.length;
  const confirmedGuests = data.guests.filter((g) => g.rsvpStatus === "confirmado").length;
  const rsvpRate = totalGuests > 0 ? confirmedGuests / totalGuests : 0;

  const totalVendors = data.vendors.length;
  const contractedVendors = data.vendors.filter((v) => v.status === "contratado").length;
  const vendorRate = totalVendors > 0 ? contractedVendors / totalVendors : 0;

  const totalBudgetItems = data.budgetItems.length;
  const filledBudgetItems = data.budgetItems.filter((b) => b.actualCost != null).length;
  const budgetRate = totalBudgetItems > 0 ? filledBudgetItems / totalBudgetItems : 0;

  const hasDate = !!data.weddingDate;
  const hasVenue = !!data.venue;
  const hasGuests = totalGuests > 0;

  const items: ScoreItem[] = [
    {
      label: "Data definida",
      done: hasDate,
      value: hasDate ? "Sim" : "Não",
      weight: 15,
    },
    {
      label: "Local definido",
      done: hasVenue,
      value: hasVenue ? "Sim" : "Não",
      weight: 15,
    },
    {
      label: "Lista de convidados",
      done: hasGuests,
      value: totalGuests > 0 ? `${totalGuests} convidados` : "Vazia",
      weight: 20,
    },
    {
      label: "RSVPs respondidos",
      done: rsvpRate >= 0.5,
      value: totalGuests > 0 ? `${confirmedGuests}/${totalGuests}` : "—",
      weight: 20,
    },
    {
      label: "Fornecedores contratados",
      done: vendorRate >= 0.5,
      value: totalVendors > 0 ? `${contractedVendors}/${totalVendors}` : "—",
      weight: 15,
    },
    {
      label: "Orçamento preenchido",
      done: budgetRate >= 0.5,
      value: totalBudgetItems > 0 ? `${filledBudgetItems}/${totalBudgetItems} itens` : "—",
      weight: 15,
    },
  ];

  const score = items.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0);

  return { items, score };
}

function scoreColor(score: number) {
  if (score >= 80) return { bar: "bg-green-500", text: "text-green-600", label: "Excelente" };
  if (score >= 60) return { bar: "bg-midnight", text: "text-midnight", label: "Bom progresso" };
  if (score >= 40) return { bar: "bg-gold", text: "text-gold", label: "Em andamento" };
  return { bar: "bg-red-400", text: "text-red-500", label: "Precisa de atenção" };
}

export function CoupleEngagementScore({ data }: { data: EngagementData }) {
  const { items, score } = computeScore(data);
  const colors = scoreColor(score);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg text-midnight">Engajamento do Casal</h3>
          <p className="font-body text-xs text-midnight/40 mt-0.5">Progresso do planejamento</p>
        </div>
        <div className="text-right">
          <p className={`font-heading text-3xl ${colors.text}`}>{score}%</p>
          <p className={`font-body text-xs ${colors.text}`}>{colors.label}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                item.done ? "bg-green-100" : "bg-gray-100"
              }`}>
                {item.done ? (
                  <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={`font-body text-sm ${item.done ? "text-midnight" : "text-midnight/40"}`}>
                {item.label}
              </span>
            </div>
            <span className={`font-body text-xs ${item.done ? "text-midnight/60" : "text-midnight/30"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
