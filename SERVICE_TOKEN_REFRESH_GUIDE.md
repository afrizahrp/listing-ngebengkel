# Service Token dengan Auto-Refresh Mechanism

## Overview

Service token manager dengan mekanisme auto-refresh untuk handle JWT yang expires dalam 1 hari.

## Cara Kerja

### 1. **Token Caching**
- Cache access token + refresh token di memory (global)
- Track expiry time untuk access token dan refresh token
- Reuse cached token jika masih valid

### 2. **Auto-Refresh Flow**
```
Request Token
  ↓
Check Static Token (env) → Return jika ada
  ↓
Check Cached Token → Return jika masih valid
  ↓
Check Refresh Token → Refresh jika masih valid
  ↓
Login Baru → Dapat token baru
```

### 3. **Token Expiry Handling**
- **Access Token**: Expires dalam 1 hari (24 jam)
- **Refresh Token**: Expires dalam 7 hari (default)
- **Buffer**: 1 menit sebelum expiry untuk prevent race condition

## Implementasi

### File: `lib/utils/service-token-manager.ts`

**Fungsi Utama:**
- `getServiceTokenWithRefresh()`: Get token dengan auto-refresh
- `loginServiceAccount()`: Login untuk dapat token baru
- `refreshServiceToken()`: Refresh access token menggunakan refresh token
- `clearServiceTokenCache()`: Clear cache (untuk testing)

### Usage di API Route

```typescript
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';

export async function GET(request: Request) {
  // Get token dengan auto-refresh
  const token = await getServiceTokenWithRefresh();
  
  // Use token untuk API call
  const res = await fetch(target, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## Token Flow

### 1. **First Request (No Cache)**
```
1. Check static token → Tidak ada
2. Check cached token → Tidak ada
3. Login dengan SERVICE_USERNAME/PASSWORD
4. Dapat accessToken + refreshToken
5. Cache tokens dengan expiry
6. Return accessToken
```

### 2. **Subsequent Requests (Token Valid)**
```
1. Check static token → Tidak ada
2. Check cached token → Masih valid (expiresAt > now)
3. Return cached accessToken
```

### 3. **Token Expired (Auto-Refresh)**
```
1. Check static token → Tidak ada
2. Check cached token → Expired
3. Check refresh token → Masih valid
4. Call /api/auth/refresh dengan refreshToken
5. Dapat accessToken baru + refreshToken baru
6. Update cache
7. Return new accessToken
```

### 4. **Refresh Token Expired (Re-Login)**
```
1. Check static token → Tidak ada
2. Check cached token → Expired
3. Check refresh token → Expired
4. Login baru dengan SERVICE_USERNAME/PASSWORD
5. Dapat token baru
6. Update cache
7. Return new accessToken
```

## Environment Variables

```env
# Option 1: Static Token (highest priority, no refresh needed)
LISTING_SERVICE_TOKEN=eyJhbGciOiJI...

# Option 2: Auto-login dengan credentials (auto-refresh)
SERVICE_USERNAME=listing-user
SERVICE_EMAIL=info@ngebengkel.com
SERVICE_PASSWORD=Lisin@
```

## Keuntungan

1. **Auto-Refresh**: Token otomatis di-refresh saat expired
2. **Efficient**: Cache token untuk reuse
3. **Resilient**: Auto re-login jika refresh token expired
4. **Flexible**: Support static token atau auto-login

## Testing

### Test Auto-Refresh:
1. Uncomment service credentials di `.env`
2. Call endpoint yang require auth
3. Wait 24 jam (atau manually expire token)
4. Call lagi → Should auto-refresh

### Test Re-Login:
1. Clear cache: `clearServiceTokenCache()`
2. Call endpoint → Should re-login

## Notes

- Token cache di memory (tidak persist di disk)
- Cache shared across semua requests di server
- Refresh token expires dalam 7 hari (default)
- Access token expires dalam 1 hari (sesuai JWT config)

