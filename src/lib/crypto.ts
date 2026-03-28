/**
 * Criptografia AES-256-GCM para dados sensíveis (CPF, dados bancários).
 * Copiado do Colo — usado para criptografar CPF antes de salvar no banco.
 *
 * Requer env var ENCRYPTION_KEY = 64 caracteres hexadecimais (32 bytes).
 * Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;       // 96-bit IV recomendado para GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY não configurada");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY deve ter 64 chars hex (256 bits)");
  return buf;
}

/**
 * Criptografa uma string com AES-256-GCM.
 * Retorna string no formato: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptCPF(cpf: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(cpf, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Descriptografa uma string criptografada por encryptCPF.
 * Lança erro se o formato for inválido ou a autenticação falhar (dado adulterado).
 */
export function decryptCPF(encrypted: string): string {
  const key = getKey();
  const parts = encrypted.split(":");
  if (parts.length !== 3) throw new Error("Formato criptografado inválido");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Tenta descriptografar; se falhar (valor legado em plaintext), retorna o valor original.
 * Usado para migração gradual de registros existentes.
 */
export function safeDecryptCPF(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.includes(":")) return value; // plaintext legado
  try {
    return decryptCPF(value);
  } catch {
    return value; // fallback seguro
  }
}
