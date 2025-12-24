# Troubleshooting: Connection Failed (Port 3200 → 4000)

## Masalah
Client di port 3200 tidak bisa connect ke backend di port 4000.

## Arsitektur Koneksi

```
Browser (Client) 
  → Next.js API Routes (/api/*) 
  → Backend Server (http://127.0.0.1:4000)
```

## Langkah Troubleshooting

### 1. Pastikan Backend Server Running

```powershell
# Test koneksi ke backend
Test-NetConnection -ComputerName 127.0.0.1 -Port 4000
```

Atau buka browser: `http://127.0.0.1:4000/api/pain-points`

### 2. Set Environment Variables

Buat atau update file `.env` di root project:

```env
# Backend URL untuk server-side API routes
BACKEND_URL=http://127.0.0.1:4000

# Service account untuk authentication (opsional jika pakai anonymous_id)
SERVICE_EMAIL=your-service-email@example.com
SERVICE_PASSWORD=your-password

# Atau gunakan username
SERVICE_USERNAME=your-username
SERVICE_PASSWORD=your-password

# Atau gunakan static token (jika ada)
LISTING_SERVICE_TOKEN=your-static-token
```

**PENTING**: 
- `BACKEND_URL` digunakan oleh Next.js API routes untuk memanggil backend
- Jangan set `NEXT_PUBLIC_API_URL` untuk development (hanya untuk production)

### 3. Restart Next.js Dev Server

Setelah update `.env`, restart server:

```powershell
# Stop server (Ctrl+C)
# Kemudian jalankan lagi
npm run dev
```

### 4. Check Console Errors

Buka browser console (F12) dan cek:
- Network tab: Lihat request ke `/api/*` routes
- Console tab: Lihat error messages

### 5. Test API Route Langsung

Test Next.js API route:

```powershell
# Test pain points API route
Invoke-WebRequest -Uri "http://localhost:3200/api/pain-points" -Method GET
```

### 6. Check Service Token

Jika menggunakan service token, pastikan:
- `SERVICE_EMAIL` atau `SERVICE_USERNAME` sudah di-set
- `SERVICE_PASSWORD` sudah di-set
- Backend bisa login dengan credentials tersebut

Test login manual:

```powershell
$body = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:4000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### 7. Check Backend CORS (Jika Direct Call)

Jika ada direct call dari client ke backend (tidak melalui Next.js API routes), pastikan backend mengizinkan CORS dari `http://localhost:3200`.

Tapi seharusnya tidak perlu karena semua request melalui Next.js API routes.

## Common Issues

### Issue 1: "ECONNREFUSED" atau "Connection refused"

**Penyebab**: Backend server tidak running di port 4000

**Solusi**: 
- Pastikan backend server running
- Check port yang digunakan backend
- Update `BACKEND_URL` jika port berbeda

### Issue 2: "401 Unauthorized"

**Penyebab**: Service token tidak valid atau tidak ada

**Solusi**:
- Set `SERVICE_EMAIL` dan `SERVICE_PASSWORD` di `.env`
- Atau set `LISTING_SERVICE_TOKEN` jika ada static token
- Check apakah credentials benar

### Issue 3: "Network Error" atau "Failed to fetch"

**Penyebab**: 
- Backend tidak accessible
- Firewall blocking
- Backend crash

**Solusi**:
- Test backend langsung: `http://127.0.0.1:4000/api/pain-points`
- Check backend logs
- Check firewall settings

### Issue 4: Timeout

**Penyebab**: Backend terlalu lama merespons

**Solusi**:
- Check backend performance
- Increase timeout di `config/api.ts` (default: 15000ms)

## Quick Fix

1. Pastikan backend running di port 4000
2. Buat/update `.env`:
   ```env
   BACKEND_URL=http://127.0.0.1:4000
   SERVICE_EMAIL=your-email@example.com
   SERVICE_PASSWORD=your-password
   ```
3. Restart Next.js dev server
4. Test: `http://localhost:3200/api/pain-points`

## Debug Mode

Untuk melihat request details, tambahkan logging di API routes:

```typescript
console.log('Backend URL:', base);
console.log('Target URL:', target);
console.log('Headers:', headers);
```

