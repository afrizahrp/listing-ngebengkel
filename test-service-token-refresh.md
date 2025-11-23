# Test Service Token Refresh Flow

Dokumen ini menjelaskan cara memverifikasi bahwa refresh token untuk service account bekerja dengan benar di listing-ngebengkel.

## Prerequisites

1. Environment variables yang diperlukan:
   ```env
   SERVICE_EMAIL=your-service-email@example.com
   # atau
   SERVICE_USERNAME=your-service-username
   SERVICE_PASSWORD=your-service-password
   BACKEND_URL=http://localhost:4000
   # atau
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

2. **JANGAN** set `LISTING_SERVICE_TOKEN` (untuk test auto-refresh)

## Test Scenarios

### 1. Test Initial Login

1. Clear token cache (jika ada):
   ```typescript
   import { clearServiceTokenCache } from '@/lib/utils/service-token-manager';
   clearServiceTokenCache();
   ```

2. Panggil `getServiceTokenWithRefresh()` pertama kali
3. Check console logs:
   - ✅ Harus ada log: `[ServiceToken] 🔐 Logging in service account...`
   - ✅ Harus ada log: `[ServiceToken] ✅ Login successful!`
   - ✅ Harus ada log dengan expiry times untuk access token dan refresh token

### 2. Test Token Caching

1. Panggil `getServiceTokenWithRefresh()` beberapa kali berturut-turut
2. Check console logs:
   - ✅ Harus ada log: `[ServiceToken] ✅ Using cached token`
   - ✅ Token yang dikembalikan harus sama

### 3. Test Auto-Refresh (Access Token Expired)

**Cara 1: Manual expire token di cache**
```typescript
// Di service-token-manager.ts, tambahkan function untuk test:
export function expireAccessTokenForTesting() {
  if (tokenCache) {
    tokenCache.expiresAt = Date.now() - 1000; // Expire 1 detik yang lalu
  }
}
```

1. Set token cache dengan expired access token
2. Panggil `getServiceTokenWithRefresh()`
3. Check console logs:
   - ✅ Harus ada log: `[ServiceToken] 🔄 Access token expired, refreshing...`
   - ✅ Harus ada log: `[ServiceToken] ✅ Token refreshed successfully!`
   - ✅ Harus ada new access token dan refresh token

**Cara 2: Tunggu token expired (lebih realistis)**
- Set access token TTL ke nilai kecil (misalnya 1 menit) di server
- Tunggu sampai expired
- Panggil `getServiceTokenWithRefresh()`
- Verify auto-refresh bekerja

### 4. Test Refresh Token Expired

1. Set token cache dengan expired refresh token:
```typescript
if (tokenCache) {
  tokenCache.refreshExpiresAt = Date.now() - 1000; // Expire 1 detik yang lalu
}
```

2. Panggil `getServiceTokenWithRefresh()`
3. Check console logs:
   - ✅ Harus ada log: `[ServiceToken] ⚠️ Refresh token also expired, will re-login`
   - ✅ Harus ada log: `[ServiceToken] 🔐 Logging in service account...`
   - ✅ Harus re-login dan dapat token baru

### 5. Test Refresh Endpoint Integration

1. Test endpoint refresh langsung:
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "X-Refresh-Token: YOUR_REFRESH_TOKEN"
```

2. Expected response:
```json
{
  "accessToken": "new_access_token...",
  "refreshToken": "new_refresh_token...",
  "sessionId": "..."
}
```

### 6. Test Error Handling

1. **Invalid refresh token:**
   - Set refresh token yang invalid
   - Panggil refresh
   - ✅ Harus return null dan trigger re-login

2. **Network error:**
   - Matikan server atau set URL yang salah
   - Panggil refresh
   - ✅ Harus handle error gracefully dan trigger re-login

3. **Server error (500):**
   - Mock server untuk return 500
   - ✅ Harus handle error dan trigger re-login

## Verification Checklist

- [ ] Initial login berhasil dan dapat access token + refresh token
- [ ] Token di-cache dengan benar
- [ ] Auto-refresh bekerja saat access token expired
- [ ] Refresh token di-rotate (token baru setiap refresh)
- [ ] Re-login otomatis saat refresh token expired
- [ ] Error handling bekerja dengan benar
- [ ] Console logs informatif dan membantu debugging

## Debug Tips

1. **Enable verbose logging:**
   - Semua log sudah ada di `service-token-manager.ts`
   - Check console untuk melihat flow

2. **Check token expiry:**
   ```typescript
   // Decode JWT untuk check expiry
   const payload = JSON.parse(
     Buffer.from(token.split('.')[1], 'base64').toString()
   );
   console.log('Token expires at:', new Date(payload.exp * 1000));
   ```

3. **Monitor network requests:**
   - Check Network tab di browser DevTools
   - Verify request ke `/api/auth/refresh` terkirim dengan benar

4. **Check server logs:**
   - Verify endpoint `/api/auth/refresh` menerima request
   - Check apakah refresh token valid
   - Verify token rotation bekerja

## Common Issues

### Issue: Refresh token tidak di-rotate
**Solution:** Check apakah server mengembalikan `refreshToken` baru di response

### Issue: Auto-refresh tidak trigger
**Solution:** 
- Check apakah `expiresAt` di cache sudah benar
- Check apakah buffer time (60 detik) sudah cukup
- Verify token expiry calculation

### Issue: Re-login loop
**Solution:**
- Check apakah refresh token masih valid
- Verify service account credentials
- Check network connectivity

