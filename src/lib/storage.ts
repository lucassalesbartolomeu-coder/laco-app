/**
 * Upload de arquivos para Supabase Storage.
 * Copiado do Colo — usado para fotos de casamento, álbum, cover image.
 *
 * Requer env vars:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = "wedding-photos"; // bucket público no Supabase Storage

/**
 * Faz upload de um arquivo para o Supabase Storage.
 * Retorna a URL pública do arquivo.
 */
export async function uploadFile(
  file: Buffer | Blob,
  path: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase Storage não configurado (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente)");
  }

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: (file instanceof Buffer ? new Uint8Array(file) : file) as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload falhou: ${res.status} ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Deleta um arquivo do Supabase Storage pelo path.
 */
export async function deleteFile(path: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
  });
}
