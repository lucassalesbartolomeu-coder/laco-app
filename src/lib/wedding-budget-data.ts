// ─── Laço · Dados de Mercado de Casamentos Brasil 2024-2026 ──────────────────
// Fonte: casamentos.com.br, iCasei, Lápis de Noiva, Constance Zahn, Serasa, Joliz
// Atualizado: Março 2026

export type VendorClassification = "essencial" | "muito_recomendado" | "legal_ter" | "adicional";
export type BudgetTier = "economico" | "intermediario" | "premium" | "luxo";
export type Region = "sp" | "rj" | "mg" | "interior";

export interface VendorCategory {
  id: string;
  name: string;
  icon: string; // emoji
  classification: VendorClassification;
  budgetPercentage: number;
  description: string;
  quizQuestion: string;
  quizOptions: { label: string; tier: BudgetTier; emoji: string }[];
  tiers: Record<BudgetTier, { min: number; max: number; perPerson?: boolean; notes: string }>;
  regionalMultiplier: Record<Region, number>;
  proTips: string[];
  checklistItems: string[]; // what to ask/check for this vendor
}

export const REGIONS: { id: Region; name: string; emoji: string }[] = [
  { id: "sp", name: "São Paulo", emoji: "🏙️" },
  { id: "rj", name: "Rio de Janeiro", emoji: "🏖️" },
  { id: "mg", name: "Minas Gerais", emoji: "⛰️" },
  { id: "interior", name: "Interior / Outros", emoji: "🌿" },
];

export const TIER_LABELS: Record<BudgetTier, { name: string; emoji: string; color: string }> = {
  economico: { name: "Econômico", emoji: "💚", color: "green" },
  intermediario: { name: "Intermediário", emoji: "💛", color: "yellow" },
  premium: { name: "Premium", emoji: "🧡", color: "orange" },
  luxo: { name: "Luxo", emoji: "💎", color: "purple" },
};

export const CLASSIFICATION_LABELS: Record<VendorClassification, { name: string; emoji: string; description: string; color: string }> = {
  essencial: {
    name: "Essencial",
    emoji: "🔴",
    description: "Sem isso o casamento não acontece",
    color: "red",
  },
  muito_recomendado: {
    name: "Muito Recomendado",
    emoji: "🟠",
    description: "Faz uma diferença enorme na experiência",
    color: "orange",
  },
  legal_ter: {
    name: "Legal Ter",
    emoji: "🟡",
    description: "Eleva o casamento a outro nível",
    color: "yellow",
  },
  adicional: {
    name: "Adicional",
    emoji: "🟢",
    description: "Extra por preferência do casal",
    color: "green",
  },
};

export const VENDOR_CATEGORIES: VendorCategory[] = [
  // ────── ESSENCIAIS ──────
  {
    id: "local_espaco",
    name: "Local / Espaço",
    icon: "🏛️",
    classification: "essencial",
    budgetPercentage: 16,
    description: "O cenário do grande dia. Define o tom de tudo.",
    quizQuestion: "Como você sonha com o local do casamento?",
    quizOptions: [
      { label: "Algo simples e aconchegante, tipo sítio ou chácara", tier: "economico", emoji: "🌿" },
      { label: "Um lugar bonito, com boa estrutura e vista", tier: "intermediario", emoji: "✨" },
      { label: "Quero o lugar que as blogueiras casam!", tier: "premium", emoji: "📸" },
      { label: "Destination wedding ou espaço exclusivo", tier: "luxo", emoji: "🏰" },
    ],
    tiers: {
      economico: { min: 5000, max: 12000, notes: "Sítio, chácara, salão comunitário. 40-80 convidados." },
      intermediario: { min: 12000, max: 30000, notes: "Espaço com estrutura, jardim, 80-150 convidados." },
      premium: { min: 30000, max: 70000, notes: "Local premiado, vista, 150+ convidados. O 'instagramável'." },
      luxo: { min: 70000, max: 150000, notes: "Fazenda exclusiva, castelo, ilha. Destination wedding." },
    },
    regionalMultiplier: { sp: 1.2, rj: 1.15, mg: 0.85, interior: 0.7 },
    proTips: [
      "Visite o local no mesmo horário e dia da semana do casamento para ver iluminação real",
      "Pergunte sobre cláusula de chuva — muitos locais abertos não têm plano B incluso",
      "Verifique se som/música tem limite de horário (vizinhança)",
      "Espaço com buffet próprio ou permite externo? Muda tudo no orçamento",
    ],
    checklistItems: [
      "Capacidade máxima de convidados",
      "Plano B para chuva",
      "Estacionamento (vagas) ou vallet",
      "Limite de horário para som",
      "Gerador próprio",
      "Permite decoração externa",
      "Buffet próprio ou permite externo",
      "Suíte para noivos se arrumarem",
    ],
  },
  {
    id: "buffet_gastronomia",
    name: "Buffet / Gastronomia",
    icon: "🍽️",
    classification: "essencial",
    budgetPercentage: 30,
    description: "A maior fatia do orçamento. Define a experiência do convidado.",
    quizQuestion: "Qual o nível da gastronomia que você imagina?",
    quizOptions: [
      { label: "Comida boa e farta, sem frescura", tier: "economico", emoji: "🍲" },
      { label: "Cardápio variado, com boas opções de entrada e sobremesa", tier: "intermediario", emoji: "🥗" },
      { label: "Menu sofisticado com harmonização de drinks", tier: "premium", emoji: "🥂" },
      { label: "Chef exclusivo com menu degustação personalizado", tier: "luxo", emoji: "👨‍🍳" },
    ],
    tiers: {
      economico: { min: 65, max: 85, perPerson: true, notes: "Cardápio básico, 2-3 opções. Self-service." },
      intermediario: { min: 100, max: 150, perPerson: true, notes: "Cardápio variado, 3-5 opções. Serviço misto." },
      premium: { min: 150, max: 250, perPerson: true, notes: "Menu premium com harmonização. Garçom na mesa." },
      luxo: { min: 250, max: 400, perPerson: true, notes: "Chef exclusivo, menu degustação, experiências gastronômicas." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.8, interior: 0.75 },
    proTips: [
      "Negocie por pessoa, não por prato — fica mais claro comparar orçamentos",
      "Peça degustação ANTES de fechar. Todos os bons buffets oferecem",
      "Defina se vinho/bebida está incluso ou é conta separada",
      "Considere taxa de serviço (~15%) no cálculo final",
    ],
    checklistItems: [
      "Preço por pessoa (não por prato)",
      "O que está incluso (entrada, prato, sobremesa)",
      "Bebidas inclusas ou à parte",
      "Taxa de serviço (garçons)",
      "Menu para restrições alimentares",
      "Degustação prévia",
      "Montagem e desmontagem inclusa",
      "Horário de início e término",
    ],
  },
  {
    id: "decoracao",
    name: "Decoração",
    icon: "💐",
    classification: "essencial",
    budgetPercentage: 16,
    description: "Transforma o espaço na visão do casal. Flores, mobília, iluminação cênica.",
    quizQuestion: "Como você imagina a decoração?",
    quizOptions: [
      { label: "Flores simples e toques pessoais, nada exagerado", tier: "economico", emoji: "🌸" },
      { label: "Decoração bonita e harmônica, com identidade", tier: "intermediario", emoji: "🌺" },
      { label: "Cenografia completa — quero que pareça revista", tier: "premium", emoji: "📷" },
      { label: "Projeto assinado por decorador renomado", tier: "luxo", emoji: "🎨" },
    ],
    tiers: {
      economico: { min: 3000, max: 6000, notes: "Flores de época, poucos arranjos. DIY possível." },
      intermediario: { min: 6000, max: 15000, notes: "Projeto harmônico, arranjos em todas as mesas, arco." },
      premium: { min: 15000, max: 35000, notes: "Cenografia completa, mobiliário especial, lounge." },
      luxo: { min: 35000, max: 60000, notes: "Projeto autoral, construção cenográfica, materiais importados." },
    },
    regionalMultiplier: { sp: 1.2, rj: 1.15, mg: 0.85, interior: 0.7 },
    proTips: [
      "Flores de época custam até 40% menos — pergunte ao florista o que está em alta na data",
      "Reutilize arranjos da cerimônia na recepção para economizar",
      "Peça referências visuais (moodboard) antes de fechar preço final",
      "Iluminação cênica às vezes está no pacote da decoração, não do DJ",
    ],
    checklistItems: [
      "Flores incluídas (espécies e quantidade)",
      "Buquê da noiva incluso",
      "Lapelas dos padrinhos",
      "Arranjos de mesa (todas?)",
      "Arco/altar da cerimônia",
      "Lounge incluso",
      "Montagem e desmontagem",
      "Iluminação cênica inclusa ou à parte",
    ],
  },
  {
    id: "fotografia",
    name: "Fotógrafo",
    icon: "📸",
    classification: "essencial",
    budgetPercentage: 4,
    description: "As memórias que duram para sempre. Não é lugar para economizar sem pensar.",
    quizQuestion: "Qual a importância da fotografia pra você?",
    quizOptions: [
      { label: "Quero fotos bonitas, mas não preciso de mega produção", tier: "economico", emoji: "📱" },
      { label: "Fotos profissionais com boa edição e álbum", tier: "intermediario", emoji: "📷" },
      { label: "Fotógrafo conceituado com estilo editorial", tier: "premium", emoji: "🎞️" },
      { label: "Referência no mercado — quero o melhor portfólio possível", tier: "luxo", emoji: "🏆" },
    ],
    tiers: {
      economico: { min: 1100, max: 2500, notes: "4-6h, fotos digitais, edição básica." },
      intermediario: { min: 2500, max: 5000, notes: "8-10h, fotos + álbum, edição completa." },
      premium: { min: 5000, max: 15000, notes: "Cobertura completa, pré-wedding, álbum premium." },
      luxo: { min: 15000, max: 30000, notes: "Múltiplos fotógrafos, ensaio de casal, same-day edit." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.9, interior: 0.8 },
    proTips: [
      "Veja portfólios COMPLETOS (não só highlights) — consistência importa mais que foto viral",
      "Pergunte quantas fotos entrega e prazo de entrega",
      "Pré-wedding geralmente é cobrado à parte",
      "Direitos autorais: confirme se pode usar as fotos livremente",
    ],
    checklistItems: [
      "Horas de cobertura",
      "Quantidade de fotos editadas",
      "Álbum incluso (quantas páginas)",
      "Pré-wedding incluso",
      "Prazo de entrega",
      "Direitos de uso das imagens",
      "Segundo fotógrafo",
      "Making-of incluído",
    ],
  },
  {
    id: "filmagem",
    name: "Filmagem / Vídeo",
    icon: "🎬",
    classification: "essencial",
    budgetPercentage: 3,
    description: "O vídeo captura a emoção de um jeito que a foto não consegue.",
    quizQuestion: "E o filme do casamento?",
    quizOptions: [
      { label: "Só um vídeo básico pra ter de recordação", tier: "economico", emoji: "📹" },
      { label: "Um filme bonito, bem editado, que emocione", tier: "intermediario", emoji: "🎥" },
      { label: "Produção cinematográfica com drone e edição top", tier: "premium", emoji: "🎬" },
      { label: "Na real, não preciso de vídeo", tier: "economico", emoji: "❌" },
    ],
    tiers: {
      economico: { min: 800, max: 2000, notes: "Vídeo simples, 1 câmera, edição básica." },
      intermediario: { min: 2000, max: 5000, notes: "2 câmeras, trailer + filme longo, edição emocional." },
      premium: { min: 5000, max: 12000, notes: "Cinematic, drone, edição filme. Same-day edit." },
      luxo: { min: 12000, max: 25000, notes: "Equipe completa, documentário, aerial footage." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.9, interior: 0.8 },
    proTips: [
      "Same-day edit (exibir trailer na festa) é WOW — mas custa 30-50% a mais",
      "Drone em local fechado não funciona — confirme se o espaço permite",
      "Se tiver que escolher entre foto e vídeo, invista mais na foto",
    ],
    checklistItems: [
      "Horas de cobertura",
      "Trailer + filme completo",
      "Drone incluído",
      "Same-day edit",
      "Prazo de entrega",
      "Making-of",
    ],
  },
  {
    id: "vestido_noiva",
    name: "Vestido da Noiva",
    icon: "👰",
    classification: "essencial",
    budgetPercentage: 3,
    description: "O vestido dos sonhos. Comprar, alugar ou mandar fazer — cada opção tem seu orçamento.",
    quizQuestion: "Já tem ideia do vestido?",
    quizOptions: [
      { label: "Algo lindo mas sem gastar uma fortuna — aceito alugar", tier: "economico", emoji: "👗" },
      { label: "Quero comprar um vestido bonito de designer acessível", tier: "intermediario", emoji: "💃" },
      { label: "Vestido sob medida de ateliê renomado", tier: "premium", emoji: "✂️" },
      { label: "Haute couture ou grife internacional", tier: "luxo", emoji: "💎" },
    ],
    tiers: {
      economico: { min: 1500, max: 2500, notes: "Aluguel ou pronta-entrega. Bom custo-benefício." },
      intermediario: { min: 2500, max: 5000, notes: "Designer brasileiro, compra. Personalização básica." },
      premium: { min: 5000, max: 12000, notes: "Ateliê sob medida, tecidos importados." },
      luxo: { min: 12000, max: 25000, notes: "Grife, haute couture, peça exclusiva." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.05, mg: 0.9, interior: 0.85 },
    proTips: [
      "Comece a procurar 8-12 meses antes — sob medida leva 4-6 meses",
      "Aluguel é opção inteligente — vestidos lindos por 30-40% do preço de compra",
      "Acessórios (véu, sapato, tiara) são custos separados — inclua no orçamento",
    ],
    checklistItems: [
      "Compra, aluguel ou sob medida",
      "Provas incluídas (quantas)",
      "Ajustes inclusos",
      "Véu e acessórios inclusos",
      "Prazo de entrega",
    ],
  },
  {
    id: "traje_noivo",
    name: "Traje do Noivo",
    icon: "🤵",
    classification: "essencial",
    budgetPercentage: 1.5,
    description: "Do terno clássico ao linho praiano — combine com o estilo do casamento.",
    quizQuestion: "E o traje do noivo?",
    quizOptions: [
      { label: "Terno bonito, comprado ou alugado, nada demais", tier: "economico", emoji: "👔" },
      { label: "Terno de boa qualidade, bem ajustado", tier: "intermediario", emoji: "🕴️" },
      { label: "Sob medida, tecido premium", tier: "premium", emoji: "✂️" },
      { label: "Designer ou alfaiataria de luxo", tier: "luxo", emoji: "💎" },
    ],
    tiers: {
      economico: { min: 800, max: 1500, notes: "Aluguel ou compra em loja. Básico e funcional." },
      intermediario: { min: 1500, max: 3000, notes: "Terno de qualidade com ajuste. Gravata/sapato à parte." },
      premium: { min: 3000, max: 6000, notes: "Alfaiataria sob medida, tecido importado." },
      luxo: { min: 6000, max: 12000, notes: "Grife ou alfaiate renomado." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.05, mg: 0.9, interior: 0.85 },
    proTips: [
      "Linho para casamento de dia/praia — lã fria para noite. Combine com o estilo",
      "Padrinhos combinando? Negocie desconto para grupo",
    ],
    checklistItems: [
      "Compra ou aluguel",
      "Ajustes inclusos",
      "Sapato e acessórios inclusos",
      "Traje dos padrinhos (desconto grupo)",
    ],
  },
  {
    id: "beleza",
    name: "Beleza (Hair + Make)",
    icon: "💄",
    classification: "essencial",
    budgetPercentage: 2,
    description: "Cabelo, maquiagem e a prova que garante o look perfeito no grande dia.",
    quizQuestion: "Beleza da noiva — qual o plano?",
    quizOptions: [
      { label: "Maquiadora boa, sem grande produção", tier: "economico", emoji: "💅" },
      { label: "Profissional de confiança com prova antes do dia", tier: "intermediario", emoji: "💇‍♀️" },
      { label: "Beauty artist renomada, dia da noiva completo", tier: "premium", emoji: "👑" },
      { label: "Equipe completa: noiva + mães + madrinhas", tier: "luxo", emoji: "💎" },
    ],
    tiers: {
      economico: { min: 800, max: 1500, notes: "Hair + make no dia. Sem prova." },
      intermediario: { min: 1500, max: 2500, notes: "Hair + make com prova. Profissional experiente." },
      premium: { min: 2500, max: 4000, notes: "Day spa, prova completa, profissional top." },
      luxo: { min: 4000, max: 8000, notes: "Equipe pra noiva + mães + madrinhas. Penteadeira." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.85, interior: 0.75 },
    proTips: [
      "Faça a prova 1-2 meses antes — não deixe pra última hora",
      "Leve referências (Pinterest/Instagram) para a prova",
      "Se for destino, confirme deslocamento do profissional",
    ],
    checklistItems: [
      "Prova inclusa",
      "Retoque durante a festa",
      "Hair e make separados ou juntos",
      "Atende madrinhas/mães (custo extra)",
    ],
  },
  {
    id: "bolo",
    name: "Bolo",
    icon: "🎂",
    classification: "essencial",
    budgetPercentage: 1.5,
    description: "O centro da mesa de doces. Do naked cake ao bolo de andares.",
    quizQuestion: "E o bolo do casamento?",
    quizOptions: [
      { label: "Naked cake bonito ou bolo simples e gostoso", tier: "economico", emoji: "🍰" },
      { label: "Bolo decorado com design personalizado", tier: "intermediario", emoji: "🎂" },
      { label: "Confeitaria premium com detalhes artísticos", tier: "premium", emoji: "🎨" },
      { label: "Bolo artístico de confeiteiro renomado", tier: "luxo", emoji: "💎" },
    ],
    tiers: {
      economico: { min: 300, max: 800, notes: "Naked cake ou bolo simples. Sabores clássicos." },
      intermediario: { min: 800, max: 1500, notes: "Design personalizado, bons recheios." },
      premium: { min: 1500, max: 3000, notes: "Confeitaria premium, andares, detalhes artísticos." },
      luxo: { min: 3000, max: 6000, notes: "Sugar art, esculturas, confeiteiro renomado." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.05, mg: 0.9, interior: 0.85 },
    proTips: [
      "Bolo cenográfico + bolo real para corte é opção comum para economizar",
      "Negocie degustação gratuita antes de fechar",
    ],
    checklistItems: [
      "Andares",
      "Sabores de recheio",
      "Degustação inclusa",
      "Entrega e montagem no local",
      "Topo de bolo incluso",
    ],
  },

  // ────── MUITO RECOMENDADOS ──────
  {
    id: "dj_banda",
    name: "DJ / Banda",
    icon: "🎵",
    classification: "muito_recomendado",
    budgetPercentage: 8,
    description: "A energia da festa. DJ versátil ou banda ao vivo — depende do vibe.",
    quizQuestion: "Como é a pista de dança dos seus sonhos?",
    quizOptions: [
      { label: "Um bom DJ que toque de tudo e anime a festa", tier: "economico", emoji: "🎧" },
      { label: "DJ profissional com setlist personalizado e efeitos", tier: "intermediario", emoji: "🎹" },
      { label: "Banda ao vivo! Quero música de verdade", tier: "premium", emoji: "🎸" },
      { label: "Banda + DJ (os dois!), sertanejo na cerimônia, o pacote completo", tier: "luxo", emoji: "🎤" },
    ],
    tiers: {
      economico: { min: 1500, max: 3000, notes: "DJ profissional, equipamento básico, 4-6h." },
      intermediario: { min: 3000, max: 6000, notes: "DJ top, efeitos visuais, iluminação, 6-8h." },
      premium: { min: 6000, max: 15000, notes: "Banda ao vivo 3-5 integrantes, repertório variado." },
      luxo: { min: 15000, max: 30000, notes: "Banda premium + DJ, cerimônia + festa, 8h+." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.85, interior: 0.75 },
    proTips: [
      "Se a banda vem de fora, transporte e hospedagem ficam por sua conta",
      "Peça setlist de referência — DJ bom aceita personalizar",
      "Taxa noturna (após 2h da manhã) é comum — negocie antes",
      "Música da cerimônia é separada — confirme se está no pacote",
    ],
    checklistItems: [
      "Horas de cobertura",
      "Equipamento de som incluído",
      "Iluminação incluída",
      "Cerimônia incluída",
      "Taxa noturna / hora extra",
      "Deslocamento cobrado",
      "Repertório personalizável",
    ],
  },
  {
    id: "cerimonialista",
    name: "Cerimonialista / Assessoria",
    icon: "📋",
    classification: "muito_recomendado",
    budgetPercentage: 4,
    description: "Quem faz tudo acontecer nos bastidores. Desde o planejamento até o dia D.",
    quizQuestion: "Já tem cerimonialista ou quer fazer por conta?",
    quizOptions: [
      { label: "Vou me virar sozinho(a) — ou tenho alguém da família", tier: "economico", emoji: "💪" },
      { label: "Quero alguém pro dia D pelo menos — coordenação", tier: "intermediario", emoji: "📋" },
      { label: "Assessoria completa: planejamento + dia D", tier: "premium", emoji: "⭐" },
      { label: "Cerimonialista premium que cuide de absolutamente tudo", tier: "luxo", emoji: "👑" },
    ],
    tiers: {
      economico: { min: 0, max: 1500, notes: "Sem cerimonialista ou coordenação básica no dia." },
      intermediario: { min: 1500, max: 3500, notes: "Coordenação do dia D + acompanhamento de fornecedores." },
      premium: { min: 3500, max: 7000, notes: "Assessoria completa: planejamento, fornecedores, dia D." },
      luxo: { min: 7000, max: 15000, notes: "Destination, curadoria de experiências, concierge." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.85, interior: 0.75 },
    proTips: [
      "Cerimonialista boa se paga sozinha: negocia melhores preços com fornecedores",
      "Pergunte quantos casamentos ela faz por mês — mais de 4 é sinal de atenção dividida",
      "Peça referências de casais anteriores",
    ],
    checklistItems: [
      "O que está incluso (planejamento, dia D, ambos)",
      "Acompanha visitas a fornecedores",
      "Quantas reuniões presenciais",
      "Equipe no dia D (quantas pessoas)",
      "Cronograma do dia D",
    ],
  },
  {
    id: "bar_bebidas",
    name: "Bar / Bebidas",
    icon: "🍹",
    classification: "muito_recomendado",
    budgetPercentage: 8,
    description: "Open bar, coquetelaria, vinho. Pode estar no buffet ou ser serviço separado.",
    quizQuestion: "E as bebidas da festa?",
    quizOptions: [
      { label: "Cerveja, refrigerante e água tá ótimo", tier: "economico", emoji: "🍺" },
      { label: "Open bar básico com cerveja, drinks simples e vinho", tier: "intermediario", emoji: "🥤" },
      { label: "Bar completo com coquetelaria e drinks autorais", tier: "premium", emoji: "🍸" },
      { label: "Bartenders premium com espumante premium e carta de vinhos", tier: "luxo", emoji: "🥂" },
    ],
    tiers: {
      economico: { min: 20, max: 35, perPerson: true, notes: "Básico: cerveja, refri, água, suco." },
      intermediario: { min: 35, max: 60, perPerson: true, notes: "Open bar simples + vinho da casa." },
      premium: { min: 60, max: 100, perPerson: true, notes: "Coquetelaria + espumante + carta de vinhos." },
      luxo: { min: 100, max: 180, perPerson: true, notes: "Bar premium, drinks autorais, carta exclusiva." },
    },
    regionalMultiplier: { sp: 1.15, rj: 1.1, mg: 0.85, interior: 0.75 },
    proTips: [
      "Muitos buffets incluem bebida no pacote — confirme antes de contratar bar separado",
      "Open bar por pessoa é mais previsível que por consumo",
      "Espumante na entrada é impactante e não custa muito a mais",
    ],
    checklistItems: [
      "Incluso no buffet ou serviço separado",
      "Open bar ou por consumo",
      "Preço por pessoa ou por garrafa",
      "Bartender incluso",
      "Copos e taças inclusos",
      "Espumante para brinde incluso",
    ],
  },

  // ────── LEGAL TER ──────
  {
    id: "doces",
    name: "Doces / Mesa de Doces",
    icon: "🍬",
    classification: "legal_ter",
    budgetPercentage: 1.5,
    description: "Bem-casados, brigadeiros gourmet, mesa instagramável de doces.",
    quizQuestion: "E a mesa de doces?",
    quizOptions: [
      { label: "Brigadeiros e bem-casados tradicionais tá perfeito", tier: "economico", emoji: "🟤" },
      { label: "Mesa de doces variada e bonita", tier: "intermediario", emoji: "🍭" },
      { label: "Mesa gourmet instagramável com doces finos", tier: "premium", emoji: "📸" },
      { label: "Dispenso mesa de doces, o bolo é suficiente", tier: "economico", emoji: "❌" },
    ],
    tiers: {
      economico: { min: 500, max: 1000, notes: "Bem-casados + brigadeiros. Simples e clássico." },
      intermediario: { min: 1000, max: 2000, notes: "Mesa variada: brigadeiros, docinhos finos, cascata." },
      premium: { min: 2000, max: 4000, notes: "Mesa gourmet: doces finos, display instagramável." },
      luxo: { min: 4000, max: 8000, notes: "Mesa cenográfica com confeitaria autoral." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.05, mg: 0.85, interior: 0.8 },
    proTips: [
      "Calcule ~5 doces por pessoa para a mesa ficar farta",
      "Bem-casados como lembrancinha = 1 por convidado + 10% margem",
    ],
    checklistItems: [
      "Tipos de doces inclusos",
      "Quantidade por convidado",
      "Bem-casados inclusos",
      "Display/suportes inclusos",
      "Entrega e montagem",
    ],
  },
  {
    id: "convites_papelaria",
    name: "Convites / Papelaria",
    icon: "💌",
    classification: "legal_ter",
    budgetPercentage: 1,
    description: "Do digital ao artesanal — o convite é o primeiro contato do convidado com o casamento.",
    quizQuestion: "E os convites?",
    quizOptions: [
      { label: "Digital pelo WhatsApp — prático e moderno", tier: "economico", emoji: "📱" },
      { label: "Convite impresso simples mas bonito", tier: "intermediario", emoji: "✉️" },
      { label: "Papelaria completa: convite + menu + identidade visual", tier: "premium", emoji: "🎨" },
      { label: "Convite artesanal premium com caixa", tier: "luxo", emoji: "🎁" },
    ],
    tiers: {
      economico: { min: 0, max: 500, notes: "Digital + design via Canva/Laço Identity Kit." },
      intermediario: { min: 500, max: 2000, notes: "Impresso simples, R$5-15 por unidade." },
      premium: { min: 2000, max: 5000, notes: "Papelaria completa: convite + menu + save-the-date." },
      luxo: { min: 5000, max: 12000, notes: "Artesanal, caixa, lacre de cera, hot stamping." },
    },
    regionalMultiplier: { sp: 1.05, rj: 1.05, mg: 0.95, interior: 0.9 },
    proTips: [
      "O Laço gera convite digital pelo Identity Kit — gratuito e alinhado com a identidade visual",
      "Impresso só para padrinhos/VIPs, digital para o resto = economia inteligente",
    ],
    checklistItems: [
      "Digital, impresso ou ambos",
      "Quantidade",
      "Design personalizado",
      "Envelopes inclusos",
      "Save-the-date separado",
    ],
  },
  {
    id: "transporte",
    name: "Transporte",
    icon: "🚌",
    classification: "legal_ter",
    budgetPercentage: 2,
    description: "Van/ônibus para convidados, vallet, transfer aeroporto (destination wedding).",
    quizQuestion: "Vai precisar de transporte para convidados?",
    quizOptions: [
      { label: "Não — todo mundo chega por conta", tier: "economico", emoji: "🚗" },
      { label: "Van/ônibus do hotel para o local e volta", tier: "intermediario", emoji: "🚌" },
      { label: "Transfer organizado para vários pontos + vallet", tier: "premium", emoji: "🚐" },
      { label: "Logística completa: aeroporto, hotel, festa, volta", tier: "luxo", emoji: "✈️" },
    ],
    tiers: {
      economico: { min: 0, max: 500, notes: "Sem transporte ou vallet básico." },
      intermediario: { min: 1500, max: 4000, notes: "1-2 vans ida e volta hotel↔festa." },
      premium: { min: 4000, max: 10000, notes: "Múltiplos pontos, vallet, roteiro organizado." },
      luxo: { min: 10000, max: 25000, notes: "Logística completa: aeroporto, transfers, volta." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.1, mg: 0.9, interior: 1.0 },
    proTips: [
      "Para destination wedding, transporte é praticamente obrigatório",
      "Negocie ida E volta no mesmo pacote",
      "Vallet no local evita estacionamento caótico",
    ],
    checklistItems: [
      "Quantos veículos",
      "Capacidade por veículo",
      "Ida e volta inclusos",
      "Horários flexíveis",
      "Motorista profissional",
      "Ar condicionado",
    ],
  },
  {
    id: "iluminacao_som",
    name: "Iluminação / Som",
    icon: "💡",
    classification: "legal_ter",
    budgetPercentage: 2,
    description: "Iluminação cênica e sistema de som profissional. Pode estar no pacote do DJ.",
    quizQuestion: "Iluminação e som — como quer?",
    quizOptions: [
      { label: "O que vier no pacote do DJ/local tá bom", tier: "economico", emoji: "💡" },
      { label: "Iluminação bonita pra fotos ficarem lindas", tier: "intermediario", emoji: "✨" },
      { label: "Projeto de luz cênica completo — quero wow", tier: "premium", emoji: "🌟" },
      { label: "Som profissional + iluminação + projeção/telão", tier: "luxo", emoji: "🎪" },
    ],
    tiers: {
      economico: { min: 0, max: 1000, notes: "Incluso no DJ ou local. Básico." },
      intermediario: { min: 1500, max: 3000, notes: "Iluminação cênica + som reforçado." },
      premium: { min: 3000, max: 6000, notes: "Projeto de luz completo, spots, fairy lights." },
      luxo: { min: 6000, max: 12000, notes: "Iluminação + som + projeção + efeitos especiais." },
    },
    regionalMultiplier: { sp: 1.1, rj: 1.05, mg: 0.9, interior: 0.85 },
    proTips: [
      "Iluminação quente (2700K) = fotos mais bonitas. Fuja de luz branca fria",
      "Fairy lights são baratas e transformam qualquer espaço",
    ],
    checklistItems: [
      "Incluso no pacote do DJ ou separado",
      "Projeto de iluminação personalizado",
      "Sistema de som para cerimônia",
      "Microfone para votos",
      "Gerador incluso",
    ],
  },
  {
    id: "seguranca",
    name: "Segurança",
    icon: "🛡️",
    classification: "legal_ter",
    budgetPercentage: 1,
    description: "Seguranças para controle de acesso, estacionamento e tranquilidade geral.",
    quizQuestion: "Segurança no evento — precisa?",
    quizOptions: [
      { label: "O local já tem segurança ou é tranquilo", tier: "economico", emoji: "✅" },
      { label: "Quero 1-2 seguranças para entrada e estacionamento", tier: "intermediario", emoji: "🛡️" },
      { label: "Equipe de segurança completa", tier: "premium", emoji: "👮" },
    ],
    tiers: {
      economico: { min: 0, max: 300, notes: "Sem segurança extra ou 1 vigilante básico." },
      intermediario: { min: 500, max: 1500, notes: "1-2 seguranças, 6-8h." },
      premium: { min: 1500, max: 4000, notes: "Equipe 3-5 profissionais, controle de acesso." },
      luxo: { min: 4000, max: 8000, notes: "Segurança premium, equipe grande, VIP." },
    },
    regionalMultiplier: { sp: 1.2, rj: 1.3, mg: 0.85, interior: 0.7 },
    proTips: [
      "Para festas 200+ pessoas, segurança é essencial (mesmo que o local pareça tranquilo)",
      "Verifique se o local já inclui segurança no pacote",
    ],
    checklistItems: [
      "Local já tem segurança inclusa",
      "Quantidade de seguranças",
      "Horário de cobertura",
      "Controle de acesso (lista de convidados)",
    ],
  },

  // ────── ADICIONAIS ──────
  {
    id: "lembrancinhas",
    name: "Lembrancinhas",
    icon: "🎁",
    classification: "adicional",
    budgetPercentage: 0.5,
    description: "O mimo que o convidado leva pra casa. Do bem-casado ao kit personalizado.",
    quizQuestion: "Vai ter lembrancinha?",
    quizOptions: [
      { label: "Bem-casado clássico resolve", tier: "economico", emoji: "🤍" },
      { label: "Algo personalizado mas sem exagero", tier: "intermediario", emoji: "🎀" },
      { label: "Kit lembrancinha premium (mini garrafa, vela, etc)", tier: "premium", emoji: "🎁" },
      { label: "Não vou ter lembrancinha — tá ok!", tier: "economico", emoji: "❌" },
    ],
    tiers: {
      economico: { min: 0, max: 500, notes: "Sem lembrancinha ou bem-casados simples." },
      intermediario: { min: 500, max: 1500, notes: "Personalizado simples: tag + doce especial." },
      premium: { min: 1500, max: 4000, notes: "Kit temático: vela, mini espumante, tag artesanal." },
      luxo: { min: 4000, max: 10000, notes: "Presente premium personalizado por convidado." },
    },
    regionalMultiplier: { sp: 1.0, rj: 1.0, mg: 0.9, interior: 0.85 },
    proTips: [
      "Tendência: trocar lembrancinha por doação a uma ONG. Elegante e econômico",
    ],
    checklistItems: [
      "Tipo de lembrancinha",
      "Personalização com nome dos noivos",
      "Entrega no local ou na saída",
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────
export function calculateBudget(
  selections: Record<string, BudgetTier>,
  guests: number,
  region: Region,
): { total: number; breakdown: { categoryId: string; min: number; max: number; mid: number }[] } {
  const breakdown: { categoryId: string; min: number; max: number; mid: number }[] = [];
  let totalMin = 0;
  let totalMax = 0;

  for (const cat of VENDOR_CATEGORIES) {
    const tier = selections[cat.id] || "intermediario";
    const range = cat.tiers[tier];
    const multiplier = cat.regionalMultiplier[region];

    let min: number;
    let max: number;

    if (range.perPerson) {
      min = range.min * guests * multiplier;
      max = range.max * guests * multiplier;
    } else {
      min = range.min * multiplier;
      max = range.max * multiplier;
    }

    min = Math.round(min);
    max = Math.round(max);
    const mid = Math.round((min + max) / 2);

    breakdown.push({ categoryId: cat.id, min, max, mid });
    totalMin += min;
    totalMax += max;
  }

  return { total: Math.round((totalMin + totalMax) / 2), breakdown };
}

export function getClassificationGroups(): Record<VendorClassification, VendorCategory[]> {
  return {
    essencial: VENDOR_CATEGORIES.filter((c) => c.classification === "essencial"),
    muito_recomendado: VENDOR_CATEGORIES.filter((c) => c.classification === "muito_recomendado"),
    legal_ter: VENDOR_CATEGORIES.filter((c) => c.classification === "legal_ter"),
    adicional: VENDOR_CATEGORIES.filter((c) => c.classification === "adicional"),
  };
}
