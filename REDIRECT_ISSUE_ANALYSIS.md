# Analisis Masalah Redirect: ngebengkel.com → ngebengkel.com:3200

## Masalah
Ketika user mengetik `https://ngebengkel.com` di browser, otomatis menampilkan/meredirect ke `https://ngebengkel.com:3200`.

**⚠️ Port 3200 seharusnya TIDAK muncul di URL publik!** Ini adalah port internal aplikasi Next.js.

## Hasil Scan Kode Next.js
✅ **Tidak ditemukan konfigurasi yang menyebabkan port 3200 muncul di URL**

### Temuan:
1. **Port yang digunakan aplikasi**: Port `3200` (berdasarkan `package.json`)
   - Dev: `next dev -p 3200`
   - Start: `next start -p 3200`
   - ⚠️ Ini adalah port **internal** yang seharusnya tidak diakses langsung dari internet

2. **Middleware (`middleware.ts`)**:
   - Hanya menangani redirect www → non-www
   - Redirect artikel → masalah (jika pain point ada)
   - Redirect workshop ID → slug
   - **TIDAK ada redirect berdasarkan domain typo**

3. **Konfigurasi domain hardcoded**:
   - `app/layout.tsx`: `metadataBase: new URL('https://ngebengkel.com')`
   - `middleware.ts`: Default host `'ngebengkel.com'`
   - Semua URL canonical menggunakan `https://ngebengkel.com` (tanpa port)

## Kemungkinan Penyebab

### 1. **Konfigurasi Reverse Proxy (Nginx/Apache) di Server** ⚠️ Paling Mungkin - URGENT!
**Ini adalah masalah utama!** Reverse proxy (Nginx/Apache) kemungkinan tidak dikonfigurasi dengan benar.

**Kemungkinan masalah konfigurasi:**

**Skenario A: Server block listen di port 3200 (SALAH)**
```nginx
# ❌ KONFIGURASI SALAH - Jangan gunakan ini!
server {
    listen 3200 ssl;  # ❌ Port 3200 ter-expose ke publik
    server_name ngebengkel.com;
    
    location / {
        proxy_pass http://localhost:3200;
    }
}
```

**Skenario B: Redirect yang menambahkan port 3200 (SALAH)**
```nginx
# ❌ KONFIGURASI SALAH
server {
    listen 443 ssl;
    server_name ngebengkel.com;
    
    # ❌ Redirect yang salah - menambahkan port di URL
    return 301 https://ngebengkel.com:3200$request_uri;
}
```

**Action yang diperlukan:**
- Periksa file konfigurasi Nginx di server (biasanya di `/etc/nginx/sites-available/` atau `/etc/nginx/conf.d/`)
- Pastikan server block **TIDAK** listen di port 3200
- Pastikan **TIDAK ada redirect** yang menambahkan port 3200 di URL
- Gunakan konfigurasi yang benar (lihat Solusi di bawah)

### 2. **Konfigurasi DNS atau Hosting**
DNS provider atau hosting panel mungkin memiliki redirect rule yang mengarahkan domain ke port 3200.

**Action yang diperlukan:**
- Login ke DNS/hosting control panel
- Periksa redirect rules atau URL forwarding settings
- Pastikan DNS mengarahkan ke server dengan port standar (80/443), **BUKAN** port 3200
- Periksa A record atau CNAME record - harus mengarah ke IP server tanpa port

### 3. **Browser Autocomplete/History**
Browser mungkin menyimpan history dan melakukan autocomplete yang salah.

**Action yang diperlukan:**
- Clear browser history dan autocomplete data
- Test di browser incognito/private mode
- Test di browser lain untuk verifikasi

### 4. **SSL Certificate atau Cloudflare**
Jika menggunakan Cloudflare atau SSL certificate yang meng-handle multiple domain, mungkin ada redirect rule di sana.

**Action yang diperlukan:**
- Periksa Cloudflare dashboard → Rules → Redirect Rules
- Periksa SSL/TLS settings

## Solusi yang Direkomendasikan

### Solusi 1: Tambahkan Redirect di Middleware (Untuk Handle Port di URL)
Tambahkan logic di `middleware.ts` untuk handle URL yang mengandung port dan redirect ke URL tanpa port:

```typescript
// Di middleware.ts, tambahkan setelah baris 86
const host = requestHeaders.get('host') || 'ngebengkel.com';

// ===== Redirect URL dengan port → URL tanpa port =====
// Handle jika host mengandung port (mis: ngebengkel.com:3200)
if (host.includes(':3200') || host.includes(':3220') || host.match(/:\d+$/)) {
  const cleanHost = host.split(':')[0]; // Hapus port dari host
  const redirectUrl = `${proto}://${cleanHost}${pathname}${search}`;
  return NextResponse.redirect(redirectUrl, 301);
}

// Handle typo domain (hgebengkel.com → ngebengkel.com)
if (host.includes('hgebengkel.com')) {
  const redirectUrl = `${proto}://ngebengkel.com${pathname}${search}`;
  return NextResponse.redirect(redirectUrl, 301);
}
```

**⚠️ Catatan:** Ini adalah defense in depth. Masalah utamanya HARUS diperbaiki di level server (Nginx/Apache).

### Solusi 2: Konfigurasi Nginx yang Benar ⚠️ PENTING!
**Ini adalah solusi utama yang HARUS dilakukan di server!**

```nginx
# ===== Redirect HTTP ke HTTPS =====
server {
    listen 80;
    server_name ngebengkel.com www.ngebengkel.com;
    
    # Redirect semua HTTP ke HTTPS (tanpa port)
    return 301 https://ngebengkel.com$request_uri;
}

# ===== Redirect www ke non-www dan HTTPS =====
server {
    listen 443 ssl;
    server_name www.ngebengkel.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Redirect www ke non-www (tanpa port)
    return 301 https://ngebengkel.com$request_uri;
}

# ===== Server block utama - TIDAK ada port di URL =====
server {
    listen 443 ssl;  # ✅ Listen di port 443 (HTTPS standar)
    server_name ngebengkel.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # ✅ Forward ke Next.js secara internal (localhost:3200)
    # ✅ Port 3200 TIDAK terlihat oleh user
    location / {
        proxy_pass http://localhost:3200;  # Internal only!
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;  # ✅ Kirim host tanpa port
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
}

# ===== OPTIONAL: Redirect typo domain =====
server {
    listen 443 ssl;
    server_name hgebengkel.com *.hgebengkel.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Redirect typo domain ke domain yang benar (tanpa port)
    return 301 https://ngebengkel.com$request_uri;
}

# ===== CRITICAL: Block direct access ke port 3200 dari internet =====
# Pastikan firewall/iptables memblokir akses langsung ke port 3200 dari luar
# Hanya localhost yang bisa akses port 3200
```

**Poin Penting:**
- ✅ Server harus listen di port **443** (HTTPS) atau **80** (HTTP), **BUKAN** port 3200
- ✅ `proxy_pass http://localhost:3200` hanya untuk komunikasi internal
- ✅ Port 3200 **TIDAK boleh diakses langsung dari internet**
- ✅ Pastikan firewall memblokir port 3200 dari akses eksternal

### Solusi 3: Tambahkan Wildcard Domain Handling
Jika ingin handle semua typo domain yang mirip, tambahkan di middleware:

```typescript
// Handle berbagai typo domain
const typoDomains = ['hgebengkel.com', 'ngeengkel.com', 'ngenbengkel.com'];
if (typoDomains.some(typo => host.includes(typo))) {
  const redirectUrl = `${proto}://ngebengkel.com${pathname}${search}`;
  return NextResponse.redirect(redirectUrl, 301);
}
```

## Testing

Setelah implementasi, test:
1. ✅ Akses `https://ngebengkel.com` → harus menampilkan halaman **TANPA port** di URL
2. ✅ Akses `https://ngebengkel.com:3200` → harus redirect ke `https://ngebengkel.com` (tanpa port)
3. ✅ Akses `http://ngebengkel.com` → harus redirect ke `https://ngebengkel.com` (tanpa port)
4. ✅ Akses `https://www.ngebengkel.com` → harus redirect ke `https://ngebengkel.com` (tanpa port)
5. ✅ Akses `https://hgebengkel.com` → harus redirect ke `https://ngebengkel.com` (tanpa port)

**Test dari command line:**
```bash
# Test redirect HTTP ke HTTPS
curl -I http://ngebengkel.com

# Test HTTPS (tidak boleh ada port di Location header)
curl -I https://ngebengkel.com

# Test dengan port (harus redirect)
curl -I https://ngebengkel.com:3200
```

## Catatan Penting
- ⚠️ **Port 3200 seharusnya TIDAK muncul di URL publik** - ini adalah port internal untuk aplikasi Next.js
- ✅ **Port 443** (HTTPS) atau **80** (HTTP) adalah port standar yang digunakan di URL publik
- ✅ Reverse proxy (Nginx/Apache) harus menangani request dari port 443/80 dan forward secara internal ke port 3200
- ✅ Port 3200 harus **diblokir dari akses eksternal** oleh firewall
- ✅ Redirect harus menggunakan HTTPS dan domain yang benar **tanpa port**
- ✅ Gunakan status code 301 (Permanent Redirect) untuk SEO

## Next Steps
1. ✅ Identifikasi lokasi konfigurasi server (Nginx/Apache)
2. ⏳ Perbaiki redirect rules di server
3. ⏳ Tambahkan handling typo domain di middleware (optional, defense in depth)
4. ⏳ Test redirect setelah perbaikan

