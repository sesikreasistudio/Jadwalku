/**
 * Web Crypto API End-to-End Encryption (AES-GCM 256-bit)
 * Implements PBKDF2 key derivation from user passphrase.
 */

const PBKDF2_ITERATIONS = 100000;

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function computePassphraseFingerprint(passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(passphrase));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export interface EncryptedBundle {
  ciphertext: string;
  iv: string;
  salt: string;
}

export async function encryptData(data: unknown, passphrase: string): Promise<EncryptedBundle> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const jsonString = JSON.stringify(data);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonString);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt)
  };
}

export async function decryptData<T>(bundle: EncryptedBundle, passphrase: string): Promise<T> {
  const salt = base64ToBuffer(bundle.salt);
  const iv = base64ToBuffer(bundle.iv);
  const ciphertext = base64ToBuffer(bundle.ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    ciphertext as unknown as BufferSource
  );

  const dec = new TextDecoder();
  const decodedText = dec.decode(decryptedBuffer);
  return JSON.parse(decodedText) as T;
}
