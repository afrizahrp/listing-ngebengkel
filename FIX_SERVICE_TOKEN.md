# Fix: Service Token Auto-Refresh Disabled

## Masalah

Log menunjukkan:
```
[ServiceToken] ⚠️ Using static token from env (auto-refresh DISABLED)
```

Ini berarti auto-refresh token **tidak berjalan** karena ada static token di environment.

## Penyebab

Di `service-token-manager.ts`, ada check untuk static token:

```typescript
// 1. Check static token dari env (highest priority)
const staticToken = process.env.LISTING_SERVICE_TOKEN?.trim();
if (staticToken) {
  console.log('[ServiceToken] ⚠️ Using static token from env (auto-refresh DISABLED)');
  return staticToken;
}
```

Jika `LISTING_SERVICE_TOKEN` di-set di `.env`, maka:
- ❌ Auto-refresh **tidak akan berjalan**
- ❌ Refresh token flow **tidak akan di-test**
- ✅ Hanya menggunakan static token dari env

## Solusi

### Option 1: Hapus/Unset LISTING_SERVICE_TOKEN (Recommended untuk Testing)

**Di file `.env` listing-ngebengkel:**

```env
# HAPUS atau COMMENT baris ini untuk enable auto-refresh:
# LISTING_SERVICE_TOKEN=your-static-token-here

# Pastikan ini ada untuk auto-refresh:
SERVICE_EMAIL=your-service-email@example.com
# atau
SERVICE_USERNAME=your-service-username
SERVICE_PASSWORD=your-service-password
BACKEND_URL=http://localhost:4000
# atau
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Setelah itu:**
1. Restart Next.js dev server
2. Check logs - harus ada:
   ```
   [ServiceToken] 🔐 Logging in service account...
   [ServiceToken] ✅ Login successful!
   ```

### Option 2: Gunakan Static Token (Production)

Jika ingin menggunakan static token (tidak perlu auto-refresh):

```env
LISTING_SERVICE_TOKEN=your-static-token-here
```

**Note:** 
- Static token tidak akan auto-refresh
- Token harus di-update manual jika expired
- Cocok untuk production jika token tidak expire

## Checklist untuk Test Refresh Token

Untuk test refresh token di listing-ngebengkel, pastikan:

- [ ] `LISTING_SERVICE_TOKEN` **TIDAK** di-set (atau di-comment)
- [ ] `SERVICE_EMAIL` atau `SERVICE_USERNAME` **sudah di-set**
- [ ] `SERVICE_PASSWORD` **sudah di-set**
- [ ] `BACKEND_URL` atau `NEXT_PUBLIC_API_URL` **sudah di-set**
- [ ] Server backend sudah running
- [ ] Next.js dev server sudah restart setelah update .env

## Expected Logs Setelah Fix

Setelah unset `LISTING_SERVICE_TOKEN`, logs harus seperti ini:

### Initial Login:
```
[ServiceToken] 🔐 Logging in service account...
[ServiceToken] ✅ Login successful!
[ServiceToken]    - Access token expires in X minutes
[ServiceToken]    - Refresh token expires in X minutes
```

### Cached Token:
```
[ServiceToken] ✅ Using cached token (expires in X minutes)
```

### Auto-Refresh:
```
[ServiceToken] ⏰ Cached token expired, will refresh...
[ServiceToken] 🔄 Access token expired, refreshing...
[ServiceToken] ✅ Token refreshed successfully!
[ServiceToken]    - New access token expires in X minutes
[ServiceToken]    - New refresh token expires in X minutes
```

### Re-login (jika refresh token expired):
```
[ServiceToken] ⚠️ Refresh token also expired, will re-login
[ServiceToken] 🔐 Logging in service account...
[ServiceToken] ✅ Login successful!
```

## Test Steps

1. **Update .env:**
   ```env
   # Comment atau hapus ini:
   # LISTING_SERVICE_TOKEN=...
   
   # Pastikan ini ada:
   SERVICE_EMAIL=your-email@example.com
   SERVICE_PASSWORD=your-password
   BACKEND_URL=http://localhost:4000
   ```

2. **Restart Next.js:**
   ```bash
   # Stop server (Ctrl+C)
   # Start lagi
   npm run dev
   ```

3. **Check logs:**
   - Harus ada `[ServiceToken] 🔐 Logging in...`
   - Tidak ada `[ServiceToken] ⚠️ Using static token...`

4. **Test auto-refresh:**
   - Tunggu access token expired (atau set expired manual)
   - Panggil API yang menggunakan service token
   - Check logs untuk auto-refresh

## Troubleshooting

### Masih muncul "Using static token"
- Check `.env` file - pastikan `LISTING_SERVICE_TOKEN` tidak ada atau di-comment
- Restart Next.js dev server
- Check apakah ada `.env.local` atau `.env.production` yang override

### "Missing SERVICE_EMAIL/SERVICE_USERNAME or SERVICE_PASSWORD"
- Pastikan salah satu sudah di-set di `.env`
- Restart server setelah update

### "Service login failed"
- Check `BACKEND_URL` atau `NEXT_PUBLIC_API_URL` benar
- Check server backend sudah running
- Check service account credentials benar

## Kesimpulan

**Untuk test refresh token, hapus/comment `LISTING_SERVICE_TOKEN` di .env listing-ngebengkel.**

Setelah itu, auto-refresh akan berjalan dan bisa di-test dengan benar.

