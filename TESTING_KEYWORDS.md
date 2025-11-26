# Panduan Testing Keyword SEO - Type + City

## 🎯 Tujuan Testing

Memastikan keyword seperti "cari bengkel spooring jakarta timur" atau "cari bengkel spooring cakung" sudah bekerja dengan baik dan ter-index oleh Google.

---

## 📋 Metode Testing

### 1. **Test URL Langsung di Browser**

#### A. Test URL Structure
Buka browser dan akses URL berikut (sesuaikan dengan data yang ada):

**Format URL:**
```
https://ngebengkel.com/cari-bengkel/[type-slug]/[city-slug]
https://ngebengkel.com/cari-bengkel/[type-slug]/[city-slug]/[district-slug]
```

**Contoh:**
```
https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur
https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur/cakung
https://ngebengkel.com/cari-bengkel/ac/jakarta-selatan
```

**Yang Harus Dicek:**
- ✅ Halaman bisa diakses (tidak 404)
- ✅ Title page sesuai (contoh: "Cari Bengkel Spooring di Jakarta Timur")
- ✅ Content menampilkan bengkel yang sesuai dengan type dan city
- ✅ URL menggunakan slug yang SEO-friendly

---

### 2. **Test Metadata SEO (View Page Source)**

#### A. Buka Page Source
1. Buka halaman di browser
2. Klik kanan → "View Page Source" (atau tekan `Ctrl+U` / `Cmd+U`)

#### B. Cek Metadata di `<head>`

**Cari dan verifikasi:**
```html
<!-- Title -->
<title>Cari Bengkel Spooring di Jakarta Timur - X Bengkel Terdekat</title>

<!-- Meta Description -->
<meta name="description" content="Cari bengkel Spooring terdekat di Jakarta Timur. Temukan X bengkel Spooring berkualitas...">

<!-- Keywords -->
<meta name="keywords" content="cari bengkel Spooring Jakarta Timur, bengkel Spooring Jakarta Timur, ...">

<!-- Open Graph -->
<meta property="og:title" content="Cari Bengkel Spooring di Jakarta Timur - X Bengkel Terdekat">
<meta property="og:description" content="Cari bengkel Spooring terdekat di Jakarta Timur...">
<meta property="og:url" content="https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur">

<!-- Canonical -->
<link rel="canonical" href="https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur">
```

**Tools Online untuk Test:**
- **Meta Tags Checker:** https://metatags.io/
- **Open Graph Preview:** https://www.opengraph.xyz/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator

---

### 3. **Test Structured Data (JSON-LD)**

#### A. Cari Structured Data di Page Source
Di page source, cari tag `<script type="application/ld+json">`

**Contoh yang harus ada:**
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Cari Bengkel Spooring di Jakarta Timur",
  "description": "Koleksi bengkel Spooring terpercaya di Jakarta Timur...",
  "url": "https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": 10,
    "itemListElement": [...]
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  }
}
```

#### B. Test dengan Google Rich Results Test
1. Buka: https://search.google.com/test/rich-results
2. Masukkan URL yang ingin di-test
3. Klik "Test URL"
4. Verifikasi:
   - ✅ Tidak ada error
   - ✅ Structured data terdeteksi
   - ✅ Preview terlihat benar

---

### 4. **Test di Google Search Console**

#### A. URL Inspection Tool
1. Buka: https://search.google.com/search-console
2. Pilih property: `ngebengkel.com`
3. Klik "URL Inspection" di sidebar
4. Masukkan URL: `https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur`
5. Klik "Test Live URL"

**Yang Dicek:**
- ✅ URL bisa diakses
- ✅ Page is indexed (atau bisa request indexing)
- ✅ Mobile-friendly
- ✅ Structured data terdeteksi

#### B. Request Indexing
1. Setelah test URL, klik "Request Indexing"
2. Google akan crawl dan index halaman tersebut
3. Monitor status di "Coverage" report

---

### 5. **Test dengan Google Search (Setelah Ter-Index)**

#### A. Site Search
Setelah halaman ter-index (biasanya 1-7 hari), test dengan:

**Format:**
```
site:ngebengkel.com "cari bengkel spooring jakarta timur"
site:ngebengkel.com "bengkel spooring jakarta timur"
site:ngebengkel.com inurl:cari-bengkel/spooring/jakarta-timur
```

**Contoh Query:**
```
site:ngebengkel.com cari bengkel spooring jakarta timur
site:ngebengkel.com bengkel spooring cakung
```

#### B. Keyword Search
Setelah beberapa hari/minggu, test dengan keyword langsung:

```
cari bengkel spooring jakarta timur
bengkel spooring jakarta timur
cari bengkel spooring cakung
```

**Yang Dicek:**
- ✅ Halaman muncul di hasil pencarian
- ✅ Title dan description sesuai
- ✅ URL terlihat di hasil pencarian

---

### 6. **Test dengan Tools SEO**

#### A. Ahrefs / SEMrush (jika punya akses)
1. Masukkan URL: `https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur`
2. Cek:
   - Backlinks
   - Keyword rankings
   - Organic traffic

#### B. Google Search Console - Performance Report
1. Buka GSC → Performance
2. Filter by query
3. Cari keyword: "cari bengkel spooring jakarta timur"
4. Monitor:
   - Impressions
   - Clicks
   - CTR
   - Average position

---

### 7. **Test Lokal (Development)**

#### A. Test di Localhost
```bash
# Jalankan development server
npm run dev

# Buka browser
http://localhost:3000/cari-bengkel/spooring/jakarta-timur
```

**Yang Dicek:**
- ✅ Halaman render dengan benar
- ✅ Metadata ter-generate dengan benar
- ✅ Structured data ada
- ✅ Tidak ada error di console

#### B. Test Sitemap Lokal
```bash
# Akses sitemap
http://localhost:3000/sitemap.xml
```

**Cari URL baru:**
- `/cari-bengkel/spooring/jakarta-timur`
- `/cari-bengkel/spooring/jakarta-timur/cakung`

---

## 🔍 Checklist Testing

### Pre-Deployment (Lokal)
- [ ] URL bisa diakses
- [ ] Title page sesuai
- [ ] Meta description ada dan relevan
- [ ] Keywords include keyword target
- [ ] Structured data valid (test dengan Rich Results Test)
- [ ] Open Graph tags lengkap
- [ ] Canonical URL benar
- [ ] Tidak ada error di console browser
- [ ] Mobile-friendly

### Post-Deployment (Production)
- [ ] URL bisa diakses di production
- [ ] Sitemap include URL baru (cek `/sitemap.xml`)
- [ ] Robots.txt tidak block
- [ ] Request indexing via GSC URL Inspection
- [ ] Monitor di GSC Coverage report

### Post-Indexing (Setelah 1-7 Hari)
- [ ] Halaman ter-index (cek dengan `site:ngebengkel.com`)
- [ ] Keyword muncul di GSC Performance report
- [ ] Halaman muncul di Google Search untuk keyword target
- [ ] Rich snippets terlihat (jika ada)

---

## 🛠️ Tools yang Direkomendasikan

### Free Tools:
1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test structured data

2. **Google Search Console**
   - https://search.google.com/search-console
   - URL Inspection, Performance, Coverage

3. **Meta Tags Checker**
   - https://metatags.io/
   - Preview meta tags

4. **Open Graph Preview**
   - https://www.opengraph.xyz/
   - Preview OG tags

5. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Test Twitter cards

6. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Test performance

### Paid Tools (Opsional):
- Ahrefs - Keyword tracking
- SEMrush - SEO analysis
- Screaming Frog - Technical SEO audit

---

## 📝 Contoh Testing Step-by-Step

### Test Keyword: "cari bengkel spooring jakarta timur"

#### Step 1: Test URL Structure
```
URL: https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur
Expected: Halaman bisa diakses, menampilkan bengkel spooring di Jakarta Timur
```

#### Step 2: Test Metadata
```bash
# View page source, cek:
- Title: "Cari Bengkel Spooring di Jakarta Timur - X Bengkel Terdekat"
- Description: mengandung "cari bengkel Spooring terdekat di Jakarta Timur"
- Keywords: mengandung "cari bengkel Spooring Jakarta Timur"
```

#### Step 3: Test Structured Data
```bash
# Test dengan Rich Results Test
URL: https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur
Expected: CollectionPage schema terdeteksi, tidak ada error
```

#### Step 4: Test di GSC
```bash
# URL Inspection
URL: https://ngebengkel.com/cari-bengkel/spooring/jakarta-timur
Action: Request Indexing
```

#### Step 5: Test di Google Search (Setelah 1-7 Hari)
```bash
# Search query
"cari bengkel spooring jakarta timur"
Expected: Halaman muncul di hasil pencarian
```

---

## 🚨 Troubleshooting

### Problem: Halaman 404
**Solusi:**
- Cek apakah type dan city slug benar
- Cek apakah data ada di database
- Cek console untuk error

### Problem: Metadata Tidak Muncul
**Solusi:**
- Cek apakah `generateMetadata` dipanggil dengan benar
- Cek apakah data type dan city berhasil di-fetch
- Cek console untuk error

### Problem: Structured Data Error
**Solusi:**
- Test dengan Rich Results Test
- Cek JSON-LD syntax
- Pastikan semua required fields ada

### Problem: Tidak Ter-Index
**Solusi:**
- Request indexing via GSC
- Cek robots.txt tidak block
- Cek apakah sitemap include URL
- Tunggu beberapa hari (Google butuh waktu)

---

## 📊 Monitoring & Tracking

### Metrics yang Harus Di-Track:
1. **Indexing Status**
   - GSC → Coverage → Valid pages
   - Monitor URL baru ter-index

2. **Keyword Rankings**
   - GSC → Performance → Queries
   - Track keyword: "cari bengkel spooring jakarta timur"

3. **Click-Through Rate (CTR)**
   - GSC → Performance
   - Monitor CTR untuk keyword target

4. **Organic Traffic**
   - GSC → Performance
   - Monitor traffic dari keyword target

---

## ✅ Quick Test Checklist

**5 Menit Quick Test:**
- [ ] Buka URL di browser → Cek bisa diakses
- [ ] View page source → Cek title & description
- [ ] Test dengan Rich Results Test → Cek structured data
- [ ] Cek sitemap.xml → URL ada di sitemap
- [ ] Request indexing via GSC → Submit untuk indexing

**Full Test (30 Menit):**
- [ ] Semua quick test
- [ ] Test semua metadata tags
- [ ] Test structured data detail
- [ ] Test mobile-friendly
- [ ] Test performance
- [ ] Monitor di GSC

---

## 🎯 Expected Results

### Setelah 1 Hari:
- ✅ URL ter-crawl oleh Google
- ✅ Halaman ter-index (cek dengan `site:` search)
- ✅ Metadata terlihat di search results

### Setelah 1 Minggu:
- ✅ Keyword mulai ranking (jika relevan)
- ✅ Traffic mulai masuk dari organic search
- ✅ Data muncul di GSC Performance report

### Setelah 1 Bulan:
- ✅ Keyword ranking stabil
- ✅ Organic traffic meningkat
- ✅ CTR optimal

---

**Last Updated:** 2024
**Status:** Ready for Testing


