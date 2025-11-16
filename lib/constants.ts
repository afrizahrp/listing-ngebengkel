// export const BACKEND_URL = 'http://127.0.0.1:8000';

export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).trim();


