/**
 * Audit log helper — registra ações sensíveis no banco.
 * Copiado do Colo. Essencial para o painel cerimonialista.
 * Fire-and-forget: erros não propagam para o caller.
 */
import { prisma } from "./prisma";

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  details?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        details: params.details ? (params.details as object) : undefined,
        ip: params.ip ?? null,
      },
    });
  } catch (err) {
    // Audit log nunca deve quebrar a feature principal
    console.error("[auditLog] Erro ao registrar:", err);
  }
}
