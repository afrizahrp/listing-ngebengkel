# Troubleshooting: Refresh Token Log Tidak Muncul

## ⚠️ Masalah: Log Refresh Token Tidak Terlihat

### Kemungkinan Penyebab:

#### 1. **LISTING_SERVICE_TOKEN Masih Ada di `.env.local`**

**Gejala:**
- Log hanya muncul: `[ServiceToken] ⚠️ Using static token from env (auto-refresh DISABLED)`
- Tidak ada log login atau refresh

**Solusi:**
```env
# ❌ COMMENT atau HAPUS baris ini:
# LISTING_SERVICE_TOKEN=eyJhbGciOiJI...

# ✅ PASTIKAN ini ada:
SERVICE_USERNAME=listing-user
SERVICE_EMAIL=info@ngebengkel.com
SERVICE_PASSWORD=Lisin@
```

**Restart Next.js server setelah edit `.env.local`!**

---

#### 2. **Token Belum Expired**

**Gejala:**
- Log muncul: `[ServiceToken] ✅ Using cached token (expires in X minutes)`
- Tidak ada log refresh karena token masih valid

**Penjelasan:**
- Dengan `JWT_EXPIRES=5m`, token valid selama 5 menit
- Refresh hanya terjadi **setelah** token expired
- Buffer 1 menit: refresh terjadi saat token tersisa < 1 menit

**Solusi:**
- **Tunggu 5 menit** setelah login pertama
- Atau **clear cache** untuk force refresh:
  ```typescript
  // Di browser console atau test endpoint
  fetch('/api/waiting-list') // Request akan trigger refresh jika token expired
  ```

---

#### 3. **Refresh Token Juga Expired (Keduanya 5m)**

**Gejala:**
- Log muncul: `[ServiceToken] ⚠️ Refresh token also expired, will re-login`
- Tidak ada log refresh, langsung re-login

**Penjelasan:**
- Jika `JWT_EXPIRES=5m` dan `REFRESH_JWT_EXPIRES=5m`, keduanya expired bersamaan
- Sistem akan **langsung re-login** tanpa refresh

**Solusi untuk Testing Refresh:**
```env
# Backend .env
JWT_EXPIRES=5m          # Access token: 5 menit
REFRESH_JWT_EXPIRES=10m # Refresh token: 10 menit (lebih lama)
```

Dengan konfigurasi ini:
- Access token expired setelah 5 menit → **refresh terjadi**
- Refresh token expired setelah 10 menit → **re-login terjadi**

---

#### 4. **Log Muncul di Terminal yang Salah**

**Gejala:**
- Tidak melihat log sama sekali

**Penjelasan:**
- Log muncul di **terminal Next.js server** (`npm run dev`)
- **BUKAN** di browser console
- **BUKAN** di terminal backend

**Cara Cek:**
1. Buka terminal yang menjalankan `npm run dev` (listing-ngebengkel)
2. Request ke endpoint: `http://localhost:3200/api/waiting-list`
3. Cek log di terminal tersebut

---

#### 5. **Endpoint Tidak Dipanggil**

**Gejala:**
- Tidak ada log sama sekali

**Cara Test:**
1. Buka browser: `http://localhost:3200/api/waiting-list`
2. Atau: `http://localhost:3200/api/sys_province`
3. Cek terminal Next.js server

**Endpoint yang Menggunakan Auto-Refresh:**
- ✅ `/api/waiting-list`
- ✅ `/api/waiting-list/:id/promo`
- ✅ `/api/sys_province`
- ✅ `/api/sys_city`
- ✅ `/api/sys_district`
- ✅ `/api/sys_subdistrict`

---

## 📋 Checklist Troubleshooting

- [ ] `LISTING_SERVICE_TOKEN` sudah di-comment/hapus dari `.env.local`
- [ ] `SERVICE_USERNAME`, `SERVICE_EMAIL`, `SERVICE_PASSWORD` ada di `.env.local`
- [ ] Next.js server sudah di-restart setelah edit `.env.local`
- [ ] Backend server sudah di-restart setelah edit `.env` (JWT_EXPIRES, dll)
- [ ] Cek log di **terminal Next.js server** (bukan browser console)
- [ ] Sudah request ke endpoint yang menggunakan `getApiHeaders()`
- [ ] Token sudah expired (tunggu 5 menit atau clear cache)

---

## 🧪 Test Scenario untuk Refresh Token

### Setup:
```env
# Backend .env
JWT_EXPIRES=5m
REFRESH_JWT_EXPIRES=10m  # Lebih lama dari access token
```

### Expected Logs:

#### **1. First Request (Login):**
```
[ServiceToken] 🔐 Logging in service account...
[ServiceToken] ✅ Login successful!
[ServiceToken]    - Access token expires in 5 minutes (300 seconds)
[ServiceToken]    - Refresh token expires in 10 minutes (600 seconds)
```

#### **2. Subsequent Requests (Token Masih Valid):**
```
[ServiceToken] ✅ Using cached token (expires in 4 minutes / 240 seconds)
[ServiceToken] ✅ Using cached token (expires in 3 minutes / 180 seconds)
...
```

#### **3. Token Expired (Setelah 5 Menit) - REFRESH:**
```
[ServiceToken] ⏰ Cached token expired 30 seconds (0 minutes) ago, will refresh...
[ServiceToken] 📋 Refresh token still valid (expires in 9 minutes / 540 seconds)
[ServiceToken] 🔄 Access token expired, refreshing... (refresh token expires in 9 minutes / 540 seconds)
[ServiceToken] 🔄 Calling refresh endpoint: http://localhost:4000/api/auth/refresh
[ServiceToken] ✅ Refresh endpoint responded with status 200
[ServiceToken] ✅ Token refreshed successfully!
[ServiceToken]    - New access token expires in 5 minutes (300 seconds)
[ServiceToken]    - New refresh token expires in 10 minutes (600 seconds)
```

#### **4. Refresh Token Expired (Setelah 10 Menit) - RE-LOGIN:**
```
[ServiceToken] ⏰ Cached token expired 300 seconds (5 minutes) ago, will refresh...
[ServiceToken] ⚠️ Refresh token also expired (60 seconds ago), will re-login
[ServiceToken] 🔐 Logging in service account...
[ServiceToken] ✅ Login successful!
[ServiceToken]    - Access token expires in 5 minutes (300 seconds)
[ServiceToken]    - Refresh token expires in 10 minutes (600 seconds)
```

---

## 🔍 Debug: Tambahkan Log Manual

Jika masih tidak muncul, tambahkan log di `service-token-manager.ts`:

```typescript
export async function getServiceTokenWithRefresh(): Promise<string> {
  console.log('[ServiceToken] 🔍 DEBUG: getServiceTokenWithRefresh called');
  console.log('[ServiceToken] 🔍 DEBUG: LISTING_SERVICE_TOKEN =', process.env.LISTING_SERVICE_TOKEN ? 'EXISTS' : 'NOT SET');
  console.log('[ServiceToken] 🔍 DEBUG: tokenCache =', tokenCache ? 'EXISTS' : 'NULL');
  
  // ... rest of code
}
```

---

## 💡 Tips

1. **Untuk Testing Cepat:**
   - Set `JWT_EXPIRES=30s` (30 detik) untuk test refresh cepat
   - Set `REFRESH_JWT_EXPIRES=2m` (2 menit) untuk test refresh

2. **Clear Cache Manual:**
   - Restart Next.js server = clear cache
   - Atau tambahkan endpoint untuk clear cache (untuk testing)

3. **Monitor Logs:**
   - Gunakan `tail -f` atau log viewer untuk monitor terus-menerus
   - Filter log dengan `[ServiceToken]` untuk mudah dibaca

---

## ❓ Masih Tidak Muncul?

1. **Cek Backend Logs:**
   - Apakah endpoint `/api/auth/refresh` dipanggil?
   - Apakah ada error di backend?

2. **Cek Network Tab:**
   - Apakah request ke `/api/auth/refresh` terkirim?
   - Apa status code-nya?

3. **Cek Environment Variables:**
   ```bash
   # Di terminal Next.js server, test:
   node -e "console.log(process.env.SERVICE_USERNAME)"
   ```

4. **Test Manual Refresh:**
   ```bash
   # Test refresh endpoint langsung
   curl -X POST http://localhost:4000/api/auth/refresh \
     -H "X-Refresh-Token: YOUR_REFRESH_TOKEN"
   ```

