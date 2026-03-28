/**
 * Integração Pagar.me para Laço.
 * Adaptado do Colo — mesma lógica, branding Laço, fees ajustados.
 *
 * Requer env vars:
 * - PAGARME_SECRET_KEY   — chave secreta do Pagar.me (sk_live_... ou sk_test_...)
 * - PAGARME_WEBHOOK_SECRET — secret para verificar assinatura HMAC dos webhooks
 *
 * SEM as env vars, funciona em modo mock (útil para dev/staging).
 */

const PAGARME_API = "https://api.pagar.me/core/v5";
const SECRET_KEY = process.env.PAGARME_SECRET_KEY ?? "";

// Taxas de serviço do Laço (em %)
const SERVICE_FEE_RATES = {
  pix: 0.035,         // 3.5%
  boleto: 0.04,       // 4.0%
  credit_card: 0.05,  // 5.0%
};

function getAuthHeader() {
  const token = Buffer.from(`${SECRET_KEY}:`).toString("base64");
  return `Basic ${token}`;
}

function isMockMode() {
  return !SECRET_KEY || SECRET_KEY.startsWith("sk_test_mock");
}

/**
 * Calcula as taxas do serviço.
 * @param amount  Valor em centavos
 * @param method  Método de pagamento
 */
export function calculateFees(amount: number, method: "pix" | "boleto" | "credit_card") {
  const rate = SERVICE_FEE_RATES[method];
  const fee = Math.round(amount * rate);
  return {
    amount,
    serviceFee: fee,
    netAmount: amount - fee,
  };
}

export interface PagarmePixOrder {
  id: string;
  status: string;
  qr_code: string;
  qr_code_url: string;
  expires_at: string;
}

export interface PagarmeBoletoOrder {
  id: string;
  status: string;
  boleto_url: string;
  boleto_barcode: string;
  boleto_due_at: string;
}

/**
 * Cria um pedido Pix no Pagar.me.
 */
export async function createPixOrder(params: {
  amount: number; // em centavos
  guestName: string;
  guestEmail?: string;
  guestCpf?: string; // plaintext para enviar ao Pagar.me (não criptografado)
  guestPhone?: string;
  description: string;
  metadata?: Record<string, string>;
}): Promise<PagarmePixOrder> {
  if (isMockMode()) {
    console.log("[pagarme] MOCK MODE — criando pedido Pix simulado");
    return {
      id: `mock_${Date.now()}`,
      status: "pending",
      qr_code: "00020126580014br.gov.bcb.pix0136mock-pix-key-for-testing5204000053039865802BR5913Laco Presentes6008Sao Paulo62070503***6304MOCK",
      qr_code_url: "https://via.placeholder.com/200x200?text=PIX+MOCK",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const body = {
    amount: params.amount,
    payment_method: "pix",
    pix: {
      expires_in: 86400, // 24 horas
    },
    customer: {
      name: params.guestName,
      email: params.guestEmail ?? `${Date.now()}@guest.laco.app`,
      ...(params.guestCpf && {
        document_type: "cpf",
        document: params.guestCpf.replace(/\D/g, ""),
      }),
      ...(params.guestPhone && { phones: { mobile_phone: { country_code: "55", area_code: params.guestPhone.slice(0, 2), number: params.guestPhone.slice(2) } } }),
    },
    items: [
      {
        description: params.description,
        amount: params.amount,
        quantity: 1,
        code: "gift-01",
      },
    ],
    metadata: params.metadata ?? {},
    statement_descriptor: "LACO PRESENTE",
  };

  const res = await fetch(`${PAGARME_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pagar.me error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const charge = data.charges?.[0];
  const lastTx = charge?.last_transaction;

  return {
    id: data.id,
    status: data.status,
    qr_code: lastTx?.qr_code ?? "",
    qr_code_url: lastTx?.qr_code_url ?? "",
    expires_at: lastTx?.expires_at ?? "",
  };
}

/**
 * Busca um pedido por ID no Pagar.me.
 */
export async function getOrder(orderId: string): Promise<{ id: string; status: string }> {
  if (isMockMode()) {
    return { id: orderId, status: "paid" };
  }

  const res = await fetch(`${PAGARME_API}/orders/${orderId}`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) {
    throw new Error(`Pagar.me getOrder error ${res.status}`);
  }

  return res.json();
}
