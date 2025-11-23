# Anonymous Login vs LISTING_SERVICE_TOKEN

## Jawaban Singkat

**Anonymous login TIDAK memerlukan `LISTING_SERVICE_TOKEN`.**

`LISTING_SERVICE_TOKEN` hanya digunakan sebagai **fallback** jika `anonymous_id` tidak tersedia.

## Cara Kerja

### Priority System di `get-api-headers.ts`:

```typescript
Priority:
1. anonymous_id dari request (jika ada) ← ANONYMOUS LOGIN
2. Service token dengan auto-refresh (fallback) ← LISTING_SERVICE_TOKEN
```

### Flow Anonymous Login:

1. **Client-side:**
   - Generate `anonymous_id` (UUID v4) di browser
   - Simpan di `localStorage`
   - Kirim sebagai header `X-Anonymous-Id` ke server

2. **Server-side:**
   - `AnonymousIdInterceptor` extract `anonymous_id` dari header
   - Validasi anonymous session (optional)
   - Attach `anonymous_id` ke request untuk tracking

3. **Tidak perlu authentication:**
   - Anonymous login tidak memerlukan JWT token
   - Tidak memerlukan `LISTING_SERVICE_TOKEN`
   - Hanya perlu `anonymous_id` (UUID)

### Flow Service Token (Fallback):

1. **Jika `anonymous_id` tidak ada:**
   - Fallback ke service token
   - Gunakan `LISTING_SERVICE_TOKEN` (static) atau auto-login
   - Kirim sebagai `Authorization: Bearer <token>`

2. **Digunakan untuk:**
   - Server-side API calls (tanpa request dari client)
   - Fallback jika anonymous_id tidak tersedia
   - Service account operations

## Perbandingan

| Feature | Anonymous Login | Service Token |
|---------|----------------|---------------|
| **Required** | ❌ TIDAK perlu `LISTING_SERVICE_TOKEN` | ✅ Perlu `LISTING_SERVICE_TOKEN` atau auto-login |
| **Authentication** | ❌ Tidak perlu (public) | ✅ Perlu JWT token |
| **Identifier** | `anonymous_id` (UUID v4) | JWT access token |
| **Storage** | localStorage (client) | Env variable atau cache (server) |
| **Header** | `X-Anonymous-Id: <uuid>` | `Authorization: Bearer <token>` |
| **Use Case** | User tracking sebelum login | Service account operations |
| **Priority** | 1 (highest) | 2 (fallback) |

## Kapan Perlu LISTING_SERVICE_TOKEN?

### ✅ Perlu LISTING_SERVICE_TOKEN jika:

1. **Server-side API calls tanpa request dari client:**
   ```typescript
   // Di server component atau API route tanpa request
   const token = await getServiceTokenWithRefresh();
   ```

2. **Fallback jika anonymous_id tidak tersedia:**
   ```typescript
   // Jika anonymous_id tidak ada, fallback ke service token
   const headers = await getApiHeaders(null); // No request
   ```

3. **Production dengan static token:**
   ```env
   LISTING_SERVICE_TOKEN=your-static-jwt-token
   ```

### ❌ TIDAK Perlu LISTING_SERVICE_TOKEN jika:

1. **Hanya menggunakan anonymous login:**
   - Client-side calls dengan `anonymous_id`
   - Public endpoints yang support anonymous

2. **Auto-login enabled:**
   - `SERVICE_EMAIL` dan `SERVICE_PASSWORD` sudah di-set
   - Auto-login akan generate token otomatis

## Contoh Use Cases

### Use Case 1: Anonymous User Browsing (TIDAK perlu LISTING_SERVICE_TOKEN)

```typescript
// Client-side: User browsing workshop list
// 1. Generate anonymous_id di browser
const anonymousId = getOrCreateAnonymousId(); // UUID v4

// 2. Kirim ke server sebagai header
fetch('/api/workshop', {
  headers: {
    'X-Anonymous-Id': anonymousId
  }
});

// Server: Extract anonymous_id
// Tidak perlu LISTING_SERVICE_TOKEN
```

### Use Case 2: Server-Side API Call (Perlu LISTING_SERVICE_TOKEN atau auto-login)

```typescript
// Server-side: Generate sitemap
// Tidak ada request dari client, jadi tidak ada anonymous_id

// Option 1: Static token
const token = process.env.LISTING_SERVICE_TOKEN;

// Option 2: Auto-login
const token = await getServiceTokenWithRefresh(); // Auto-login jika tidak ada static token
```

### Use Case 3: API Route dengan Request (Priority: anonymous_id > service token)

```typescript
// app/api/workshop/route.ts
export async function GET(request: Request) {
  // Priority 1: anonymous_id dari request (jika ada)
  // Priority 2: Service token (fallback)
  const headers = await getApiHeaders(request);
  
  // Jika request punya anonymous_id, pakai itu
  // Jika tidak, fallback ke service token
}
```

## Konfigurasi untuk Anonymous Login

### Minimal (Hanya Anonymous Login):

```env
# Tidak perlu LISTING_SERVICE_TOKEN
# Hanya perlu backend URL untuk initialize anonymous session
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Recommended (Anonymous + Fallback):

```env
# Anonymous login (priority 1)
NEXT_PUBLIC_API_URL=http://localhost:4000

# Service token fallback (priority 2)
# Option A: Static token (production)
# LISTING_SERVICE_TOKEN=your-static-token

# Option B: Auto-login (development/testing)
SERVICE_EMAIL=service@example.com
SERVICE_PASSWORD=password
# Jangan set LISTING_SERVICE_TOKEN untuk enable auto-login
```

## Kesimpulan

### Untuk Anonymous Login:
- ✅ **TIDAK perlu** `LISTING_SERVICE_TOKEN`
- ✅ Cukup generate `anonymous_id` di client
- ✅ Kirim sebagai header `X-Anonymous-Id`

### Untuk Service Token (Fallback):
- ✅ **Perlu** `LISTING_SERVICE_TOKEN` (static) atau auto-login
- ✅ Digunakan jika `anonymous_id` tidak tersedia
- ✅ Untuk server-side operations

### Best Practice:
1. **Development/Testing:**
   - Unset `LISTING_SERVICE_TOKEN` untuk enable auto-login
   - Set `SERVICE_EMAIL` dan `SERVICE_PASSWORD`
   - Anonymous login tetap bekerja tanpa service token

2. **Production:**
   - Set `LISTING_SERVICE_TOKEN` untuk static token (optional)
   - Atau tetap gunakan auto-login dengan credentials
   - Anonymous login tetap bekerja sebagai priority 1

## Summary

**Anonymous login bekerja independen dari `LISTING_SERVICE_TOKEN`.**

`LISTING_SERVICE_TOKEN` hanya diperlukan sebagai fallback untuk:
- Server-side API calls tanpa request
- Fallback jika anonymous_id tidak tersedia
- Service account operations

Untuk anonymous login, cukup:
- Generate `anonymous_id` di client
- Kirim sebagai header
- Tidak perlu authentication token

