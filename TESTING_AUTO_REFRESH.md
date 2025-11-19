# Testing Auto-Refresh Token dengan Log

## ⚠️ Penting: Log Muncul di Terminal Next.js Server, BUKAN Browser Console!

## Setup untuk Testing

### 1. Backend `.env` (sudah di-set):
```env
JWT_SECRET=c8FZzkImTp4JZlC01jvBda2sG
JWT_EXPIRES=15m
REFRESH_JWT_SECRET=oa2CrumCxVIj2ShufvSq
REFRESH_JWT_EXPIRES=1h
```

### 2. Frontend `.env.local` (listing-ngebengkel):

**⚠️ PENTING: Comment atau HAPUS `LISTING_SERVICE_TOKEN` agar auto-login & refresh berjalan!**

```env
# ❌ COMMENT atau HAPUS baris ini untuk testing auto-refresh:
# LISTING_SERVICE_TOKEN=eyJhbGciOiJI...

# ✅ PASTIKAN ini ada (untuk auto-login):
SERVICE_USERNAME=listing-user
SERVICE_EMAIL=info@ngebengkel.com
SERVICE_PASSWORD=Lisin@

BACKEND_URL=http://localhost:4000
```

**Kenapa harus di-comment?**
- Jika `LISTING_SERVICE_TOKEN` masih ada, sistem akan langsung pakai static token
- Log hanya akan muncul: `[ServiceToken] Using static token from env`
- Auto-refresh tidak akan berjalan karena tidak ada expiry tracking

### 3. Restart Servers:

```bash
# Backend
cd J:/saas/server-ngebengkel
npm run start:dev

# Frontend (di terminal terpisah)
cd J:/saas/listing-ngebengkel
npm run dev
```

---

## Expected Logs di Terminal Next.js Server

### **First Request (Login):**
```
[ServiceToken] Logging in service account...
[ServiceToken] ✅ Login successful! Access token expires in 15 minutes, refresh token expires in 60 minutes
```

### **Subsequent Requests (Token Masih Valid):**
```
[ServiceToken] ✅ Using cached token (expires in 14 minutes)
[ServiceToken] ✅ Using cached token (expires in 13 minutes)
[ServiceToken] ✅ Using cached token (expires in 12 minutes)
...
```

### **Token Expired (Auto-Refresh):**
```
[ServiceToken] ⏰ Cached token expired 1 minutes ago, will refresh...
[ServiceToken] Access token expired, refreshing... (refresh token expires in 59 minutes)
[ServiceToken] ✅ Token refreshed successfully (new token expires in 15 minutes)
```

### **Refresh Token Expired (Re-Login):**
```
[ServiceToken] ⚠️ Failed to refresh service token, will re-login: ...
[ServiceToken] Logging in service account...
[ServiceToken] ✅ Login successful! Access token expires in 15 minutes, refresh token expires in 60 minutes
```

---

## Cara Test Auto-Refresh

### Test 1: First Login
1. Pastikan `LISTING_SERVICE_TOKEN` di-comment
2. Restart Next.js server
3. Buka browser: `http://localhost:3200/api/waiting-list`
4. **Cek terminal Next.js server** - harus muncul log login

### Test 2: Cached Token
1. Request yang sama beberapa kali (dalam 15 menit)
2. **Cek terminal** - harus muncul log "Using cached token"

### Test 3: Auto-Refresh (Tunggu 15 menit)
1. Setelah 15 menit, request lagi
2. **Cek terminal** - harus muncul log "Token refreshed successfully"

### Test 4: Re-Login (Tunggu 1 jam)
1. Setelah 1 jam (refresh token expired), request lagi
2. **Cek terminal** - harus muncul log "Logging in service account"

---

## Troubleshooting

### ❌ Log Tidak Muncul?

**1. Cek `LISTING_SERVICE_TOKEN` masih ada?**
```bash
# Di .env.local, pastikan di-comment:
# LISTING_SERVICE_TOKEN=...
```

**2. Cek Service Credentials ada?**
```env
SERVICE_USERNAME=listing-user
SERVICE_EMAIL=info@ngebengkel.com
SERVICE_PASSWORD=Lisin@
```

**3. Cek Terminal yang Benar**
- Log muncul di **terminal Next.js server** (`npm run dev`)
- BUKAN di browser console
- BUKAN di terminal backend

**4. Cek Endpoint yang Dipanggil**
- Endpoint yang menggunakan `getApiHeaders()` akan trigger log
- Contoh: `/api/waiting-list`, `/api/sys_province`, `/api/sys_city`, dll

**5. Restart Next.js Server**
```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### ❌ Masih Pakai Static Token?

Jika log hanya muncul:
```
[ServiceToken] Using static token from env
```

**Solusi:**
1. Comment atau hapus `LISTING_SERVICE_TOKEN` dari `.env.local`
2. Restart Next.js server
3. Request lagi

---

## Endpoint yang Menggunakan Auto-Refresh

Semua endpoint yang menggunakan `getApiHeaders()` akan trigger auto-refresh:

- ✅ `/api/waiting-list`
- ✅ `/api/waiting-list/:id/promo`
- ✅ `/api/sys_province`
- ✅ `/api/sys_city`
- ✅ `/api/sys_city/batch`
- ✅ `/api/sys_district`
- ✅ `/api/sys_subdistrict`

---

## Catatan

- **Log hanya muncul jika `LISTING_SERVICE_TOKEN` TIDAK ada**
- **Log muncul di terminal Next.js server, bukan browser**
- **Auto-refresh hanya berjalan jika ada `SERVICE_USERNAME`, `SERVICE_EMAIL`, dan `SERVICE_PASSWORD`**

