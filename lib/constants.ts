// export const BACKEND_URL = 'http://127.0.0.1:8000';

// Use BACKEND_URL only (not NEXT_PUBLIC_API_URL) for server-side operations
// NEXT_PUBLIC_API_URL should not be used to avoid direct client-side calls to backend
export const BACKEND_URL = (
  process.env.BACKEND_URL ?? 'http://127.0.0.1:4000'
).trim();

// Nomor WhatsApp untuk klaim manual bengkel
export const CLAIM_MANUAL_WHATSAPP_NUMBER = '082125411773';

