import axios from 'axios';

// Gunakan proxy Next.js (relative URL) agar token tetap di server.
// Jika butuh akses langsung ke backend (tanpa proxy), isi NEXT_PUBLIC_API_URL.
const baseURL =
  (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim()) ||
  '';

export const sysApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const Api = sysApi;

export const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string | string[] }
      | undefined;

    const message =
      (Array.isArray(data?.message) ? data?.message.join(', ') : data?.message) ??
      (Array.isArray(data?.error) ? data?.error.join(', ') : data?.error) ??
      error.message;

    return message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default sysApi;


