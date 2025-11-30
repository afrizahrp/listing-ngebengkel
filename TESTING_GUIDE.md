# Panduan Testing Pain Point Search & UI Enhancements

## 🎯 Cara Menguji Implementasi

### 1. **Setup & Prerequisites**

Pastikan:
- ✅ Server backend berjalan di `http://127.0.0.1:4000` (atau sesuai `.env`)
- ✅ Database sudah ter-seed dengan pain points (64 pain points)
- ✅ Frontend Next.js berjalan (`npm run dev`)

### 2. **Akses Halaman untuk Testing**

#### **A. Home Page (Pain Point Messaging)**
```
URL: http://localhost:3000/
```
- Halaman ini menampilkan `PainPointMessaging` component
- Terdapat search bar dengan autocomplete
- Menampilkan popular pain points sebagai cards

#### **B. Workshop Listing Page**
```
URL: http://localhost:3000/bengkel/[city]
Contoh: http://localhost:3000/bengkel/jakarta
```
- Halaman listing bengkel dengan search functionality
- Filter berdasarkan kota, tipe, dll

#### **C. Pain Point Detail Page**
```
URL: http://localhost:3000/masalah/[slug]
Contoh: http://localhost:3000/masalah/ac-tidak-dingin
```

---

## 🔍 **Test Cases: Search Functionality**

### **Test 1: Basic Search dengan Keyboard**

**Steps:**
1. Buka halaman home (`http://localhost:3000/`)
2. Klik pada search bar
3. Ketik: `AC tidak dingin`
4. **Expected:**
   - ✅ Suggestions muncul setelah 2+ karakter
   - ✅ Loading indicator muncul saat fetching
   - ✅ List suggestions dengan pain points yang match

**Keyboard Navigation:**
- Tekan `Arrow Down` → Item pertama ter-highlight
- Tekan `Arrow Down` lagi → Item kedua ter-highlight
- Tekan `Arrow Up` → Kembali ke item sebelumnya
- Tekan `Enter` → Select item dan redirect ke `/bengkel?painPoint=[slug]`
- Tekan `Escape` → Close suggestions

---

### **Test 2: Pain Point Matching**

**Search Terms untuk Testing:**

#### **Kategori: AC & Pendingin**
```
- "AC tidak dingin"
- "AC mobil tidak dingin"
- "pendingin rusak"
- "AC bocor"
- "freon habis"
```

#### **Kategori: Rem & Pengereman**
```
- "rem blong"
- "rem tidak berfungsi"
- "rem bunyi"
- "rem mobil tidak pakem"
- "brake problem"
```

#### **Kategori: Mesin & Performa**
```
- "mesin mati"
- "mesin tidak bisa nyala"
- "mesin bunyi aneh"
- "mesin mobil bergetar"
- "engine problem"
```

#### **Kategori: Service & Maintenance**
```
- "service berkala"
- "tune up mobil"
- "ganti oli"
- "perawatan rutin"
- "maintenance"
```

#### **Kategori: Body & Cat**
```
- "cat mengelupas"
- "body penyok"
- "cat mobil rusak"
- "body work"
```

#### **Kategori: Kelistrikan**
```
- "lampu tidak menyala"
- "aki soak"
- "kelistrikan bermasalah"
- "battery problem"
```

**Expected Results:**
- ✅ Pain point badge muncul jika match ditemukan (confidence > threshold)
- ✅ Badge menampilkan title, confidence score, dan matched keywords
- ✅ Click badge → redirect ke `/bengkel?painPoint=[slug]`

---

### **Test 3: Search Suggestions**

**Steps:**
1. Ketik minimal 2 karakter di search bar
2. **Expected:**
   - ✅ Suggestions muncul dalam dropdown
   - ✅ Setiap suggestion menampilkan:
     - Icon (Wrench)
     - Title pain point
     - Matched keywords (jika ada)
     - Confidence score (jika > 70%)

**Test dengan berbagai query:**
```
"AC" → Should show AC-related pain points
"rem" → Should show brake-related pain points
"mesin" → Should show engine-related pain points
"servis" → Should show service/maintenance pain points
```

---

### **Test 4: Empty State**

**Steps:**
1. Buka halaman listing bengkel dengan filter yang tidak menghasilkan hasil
2. **Expected:**
   - ✅ Empty state component muncul
   - ✅ Menampilkan popular pain points sebagai suggestions
   - ✅ Link ke `/masalah` untuk melihat semua masalah

**Cara trigger empty state:**
- Filter dengan kota yang tidak ada bengkel
- Search dengan query yang tidak match bengkel apapun

---

### **Test 5: Pain Point Detail Page**

**Steps:**
1. Buka URL: `http://localhost:3000/masalah/[slug]`
   Contoh: `http://localhost:3000/masalah/ac-tidak-dingin`
2. **Expected:**
   - ✅ Halaman detail pain point muncul
   - ✅ Menampilkan:
     - Title & description
     - Category badge
     - Keywords terkait
     - Service types yang tersedia
     - Related pain points di sidebar
   - ✅ SEO metadata ter-generate dengan benar

**Test beberapa slug:**
- `/masalah/ac-tidak-dingin`
- `/masalah/rem-blong`
- `/masalah/mesin-mati`
- `/masalah/service-berkala`

---

### **Test 6: Accessibility (Keyboard Navigation)**

**Test Keyboard Navigation:**

1. **Tab Navigation:**
   - Tekan `Tab` → Focus ke search bar
   - Tekan `Tab` lagi → Focus ke button "Cari"
   - Tekan `Tab` lagi → Focus ke pain point cards

2. **Search Bar:**
   - Focus pada search bar
   - Ketik query
   - Tekan `Arrow Down` → Navigate suggestions
   - Tekan `Enter` → Select suggestion
   - Tekan `Escape` → Close suggestions

3. **Pain Point Cards:**
   - Focus pada card
   - Tekan `Enter` atau `Space` → Navigate ke detail

4. **Screen Reader:**
   - Gunakan screen reader (NVDA/JAWS/VoiceOver)
   - Verify semua elements memiliki proper ARIA labels
   - Verify announcements untuk dynamic content

---

### **Test 7: Integration dengan Workshop Listing**

**Steps:**
1. Search dengan pain point: `AC tidak dingin`
2. Click suggestion atau tekan Enter
3. **Expected:**
   - ✅ Redirect ke `/bengkel?painPoint=ac-tidak-dingin`
   - ✅ List bengkel yang relevan dengan pain point tersebut
   - ✅ (Jika diimplementasikan) Bengkel di-sort berdasarkan relevance

---

## 🐛 **Debugging Tips**

### **Check API Responses:**

1. **Pain Points List:**
   ```bash
   curl http://localhost:4000/api/pain-points?isPopular=true&limit=10
   ```

2. **Search Pain Points:**
   ```bash
   curl "http://localhost:4000/api/pain-points/search?q=AC%20tidak%20dingin"
   ```

3. **Pain Point Detail:**
   ```bash
   curl http://localhost:4000/api/pain-points/ac-tidak-dingin
   ```

### **Check Browser Console:**
- Open DevTools → Console
- Check untuk error messages
- Check network requests ke `/api/pain-points/*`

### **Check React Query DevTools:**
- Install React Query DevTools
- Check query states dan cache

---

## 📝 **Checklist Testing**

- [ ] Search bar muncul di home page
- [ ] Suggestions muncul setelah 2+ karakter
- [ ] Keyboard navigation bekerja (Arrow Up/Down, Enter, Escape)
- [ ] Pain point matching bekerja dengan berbagai search terms
- [ ] Pain point badge muncul saat match ditemukan
- [ ] Click suggestion → redirect ke listing page
- [ ] Empty state muncul saat tidak ada hasil
- [ ] Pain point detail page accessible via `/masalah/[slug]`
- [ ] SEO metadata ter-generate dengan benar
- [ ] ARIA labels dan accessibility bekerja
- [ ] Mobile responsive
- [ ] Loading states ter-handle dengan baik
- [ ] Error states ter-handle dengan baik

---

## 🎨 **Visual Testing**

### **Check UI Elements:**
- [ ] Search bar styling konsisten
- [ ] Suggestions dropdown styling
- [ ] Pain point badge styling
- [ ] Empty state styling
- [ ] Loading indicators
- [ ] Hover states
- [ ] Focus states (keyboard navigation)

---

## 🔗 **URLs untuk Quick Testing**

```
# Home Page
http://localhost:3000/

# Pain Point Detail (contoh)
http://localhost:3000/masalah/ac-tidak-dingin
http://localhost:3000/masalah/rem-blong
http://localhost:3000/masalah/mesin-mati

# Workshop Listing (dengan pain point filter)
http://localhost:3000/bengkel?painPoint=ac-tidak-dingin

# Workshop Listing (dengan search query)
http://localhost:3000/bengkel?q=AC%20tidak%20dingin
```

---

## 💡 **Tips Testing**

1. **Gunakan berbagai browser:**
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (jika tersedia)

2. **Test di berbagai device sizes:**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

3. **Test dengan slow network:**
   - Throttle network di DevTools
   - Verify loading states

4. **Test edge cases:**
   - Empty query
   - Very long query
   - Special characters
   - Non-existent pain point slug

---

## 🚀 **Quick Start Testing**

1. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd server-ngebengkel
   npm run start:dev

   # Terminal 2: Frontend
   cd listing-ngebengkel
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Test search:**
   - Ketik: `AC tidak dingin`
   - Lihat suggestions muncul
   - Test keyboard navigation
   - Click suggestion atau tekan Enter

4. **Verify results:**
   - Pain point badge muncul
   - Redirect ke listing page
   - List bengkel relevan muncul

---

**Selamat Testing! 🎉**


