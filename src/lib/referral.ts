import { prisma } from "@/lib/prisma";

export function generateReferralCode(name: string): string {
  const base = name
    .split(" ")[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8);
  const year = new Date().getFullYear();
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${year}${suffix}`;
}

export async function assignReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, name: true },
  });

  if (existing?.referralCode) return existing.referralCode;

  const name = existing?.name ?? "USER";
  let code = generateReferralCode(name);

  // Ensure uniqueness
  let attempts = 0;
  while (attempts < 10) {
    const clash = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!clash) break;
    code = generateReferralCode(name);
    attempts++;
  }

  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}
