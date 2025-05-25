
export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
  }
  

  export async function encryptFile(file: File, phrase: string): Promise<Blob> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(phrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const fileBuffer = await file.arrayBuffer();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  const blob = new Blob([salt, iv, new Uint8Array(encrypted)], { type: 'application/octet-stream' });
  return blob;
}

export async function decryptFile(encryptedBlob: Blob, phrase: string, fileType: string): Promise<Blob> {
  const buffer = await encryptedBlob.arrayBuffer();
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const encryptedData = buffer.slice(28);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(phrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  
  return new Blob([decrypted], { type: fileType });
}