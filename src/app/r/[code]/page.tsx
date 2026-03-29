/**
 * Página de aterrissagem do referral.
 *
 * Fluxo:
 * 1. Busca o usuário dono do código para validar que ele existe.
 * 2. Redireciona para /login com ?ref=[code] para que o cadastro possa
 *    capturar o referralCode e salvar no campo referredBy do novo usuário.
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ReferralLandingPage({ params }: PageProps) {
  const { code } = await params;

  // Valida que o código existe
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, name: true },
  });

  // Código inválido → redireciona para login sem parâmetro
  if (!referrer) {
    redirect("/login");
  }

  // Código válido → redireciona para login com ref para captura no registro
  redirect(`/login?ref=${encodeURIComponent(code)}`);
}
