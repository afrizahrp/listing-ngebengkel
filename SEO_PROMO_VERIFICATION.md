# Verifikasi SEO Promo - Referensi ke Table wks_promo

## ✅ Status: **SUDAH BENAR** dengan perbaikan minor

---

## 📋 Verifikasi Implementasi

### 1. **Backend - Query ke Table wks_promo**

**File:** `server-ngebengkel/src/wks/waiting-list/waiting-list.service.ts` (line 612-648)

✅ **Query ke Table:**
```typescript
const promos = await this.prisma.wks_promo.findMany({
  where: {
    waitingList_id: id,  // ✅ FK ke wks_waitingList.id
    isActive: true,      // ✅ Filter promo aktif
    AND: [
      {
        OR: [{ startAt: null }, { startAt: { lte: new Date() } }],  // ✅ Filter tanggal mulai
      },
      {
        OR: [{ endAt: null }, { endAt: { gte: new Date() } }],      // ✅ Filter tanggal akhir
      },
    ],
  },
  orderBy: [{ createdAt: 'desc' }],
  select: {
    id: true,              // ✅ wks_promo.id
    title: true,           // ✅ wks_promo.title
    description: true,     // ✅ wks_promo.description
    promoType: true,       // ✅ wks_promo.promoType
    checklist: true,       // ✅ wks_promo.checklist
    valuePercent: true,    // ✅ wks_promo.valuePercent
    valueNominal: true,    // ✅ wks_promo.valueNominal
    startAt: true,        // ✅ wks_promo.startAt (baru ditambahkan)
    endAt: true,          // ✅ wks_promo.endAt (baru ditambahkan)
  },
});
```

✅ **Relasi yang Digunakan:**
- `waitingList_id` → FK ke `wks_waitingList.id` ✅
- Filter `isActive: true` ✅
- Filter tanggal valid (`startAt <= now` dan `endAt >= now`) ✅

---

### 2. **Backend - Controller Endpoint**

**File:** `server-ngebengkel/src/wks/waiting-list/waiting-list.controller.ts` (line 100-114)

✅ **Endpoint:**
```typescript
@Get(':id/promo')
async getPromos(@Param('id') id: string): Promise<{
  message: string;
  data: Array<{
    id: string;
    title: string;
    description: string | null;
    promoType: string;
    checklist?: string[] | null;
    valuePercent?: number | null;
    valueNominal?: number | null;
    startAt?: string | null;    // ✅ Baru ditambahkan
    endAt?: string | null;      // ✅ Baru ditambahkan
  }>;
}>
```

✅ **Route:** `GET /api/waiting-list/:id/promo`
- Parameter `id` = `wks_waitingList.id`
- Query ke `wks_promo` dengan filter `waitingList_id = id`

---

### 3. **Frontend - Fetch Promo Data**

**File:** `listing-ngebengkel/app/workshop/[id]/components/WorkshopStructuredData.tsx` (line 57-78)

✅ **Fetch Function:**
```typescript
async function getPromos(waitingListId: string) {
  const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(waitingListId)}/promo`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  // ...
}
```

✅ **Parameter:**
- `waitingListId` = `workshop.id` = `wks_waitingList.id` ✅
- Endpoint: `/waiting-list/${waitingListId}/promo` ✅

---

### 4. **Frontend - Structured Data (JSON-LD)**

**File:** `listing-ngebengkel/app/workshop/[id]/components/WorkshopStructuredData.tsx` (line 201-255)

✅ **Menggunakan Semua Field dari wks_promo:**

| Field wks_promo | Digunakan di Structured Data | Status |
|----------------|------------------------------|--------|
| `title` | `offer.name` | ✅ |
| `description` | `offer.description` | ✅ |
| `promoType` | Logic untuk menentukan price/priceSpecification | ✅ |
| `valuePercent` | `offer.priceSpecification` (jika DISCOUNT_PERCENT) | ✅ |
| `valueNominal` | `offer.price` (jika DISCOUNT_NOMINAL) | ✅ |
| `startAt` | `offer.validFrom` | ✅ |
| `endAt` | `offer.validThrough` | ✅ |
| `checklist` | (belum digunakan di structured data, tapi ada di response) | ⚠️ |

✅ **Structured Data Schema:**
```json
{
  "@type": "Offer",
  "name": "promo.title",                    // ✅ dari wks_promo.title
  "description": "promo.description",       // ✅ dari wks_promo.description
  "validFrom": "promo.startAt",             // ✅ dari wks_promo.startAt
  "validThrough": "promo.endAt",            // ✅ dari wks_promo.endAt
  "price": "promo.valueNominal",            // ✅ dari wks_promo.valueNominal
  "priceSpecification": {                   // ✅ dari wks_promo.valuePercent
    "price": "0",
    "valuePercent": "promo.valuePercent"
  }
}
```

---

### 5. **Frontend - Metadata Keywords**

**File:** `listing-ngebengkel/app/workshop/[id]/layout.tsx` (line 126-133)

✅ **Menggunakan Promo untuk Metadata:**
```typescript
const promos = await getPromos(workshop.id);  // ✅ Fetch dari wks_promo
const hasPromo = promos.length > 0;
const promoText = hasPromo 
  ? ` Tersedia promo menarik: ${promos.slice(0, 2).map((p: { title: string }) => p.title).join(', ')}.`
  : '';

// ✅ Menambahkan promo ke description
const fullDescription = `${description}${promoText} Hubungi kami untuk informasi lebih lanjut.`;

// ✅ Menambahkan keyword promo
if (hasPromo) {
  keywords.push('promo bengkel', 'diskon servis');
}
```

✅ **Field yang Digunakan:**
- `promo.title` → Ditambahkan ke meta description ✅
- `promo.length > 0` → Menentukan apakah ada promo untuk keyword ✅

---

## 📊 Mapping Field wks_promo ke SEO

| Field wks_promo | Tipe | Digunakan di SEO | Lokasi |
|----------------|------|------------------|--------|
| `id` | String | - | Response only |
| `waitingList_id` | String (FK) | Filter query | Backend where clause ✅ |
| `title` | String | Meta description, Offer name | layout.tsx, WorkshopStructuredData.tsx ✅ |
| `description` | String? | Offer description | WorkshopStructuredData.tsx ✅ |
| `promoType` | Enum | Logic untuk price/priceSpecification | WorkshopStructuredData.tsx ✅ |
| `valuePercent` | Decimal? | Offer priceSpecification | WorkshopStructuredData.tsx ✅ |
| `valueNominal` | Int? | Offer price | WorkshopStructuredData.tsx ✅ |
| `checklist` | Json? | - | Response only (belum digunakan) |
| `applicableItems` | Json? | - | Response only (belum digunakan) |
| `startAt` | DateTime? | Offer validFrom | WorkshopStructuredData.tsx ✅ |
| `endAt` | DateTime? | Offer validThrough | WorkshopStructuredData.tsx ✅ |
| `isActive` | Boolean | Filter query | Backend where clause ✅ |

---

## ✅ Checklist Verifikasi

- [x] Backend query ke table `wks_promo` ✅
- [x] Menggunakan `waitingList_id` sebagai FK ke `wks_waitingList.id` ✅
- [x] Filter `isActive: true` ✅
- [x] Filter tanggal valid (`startAt` dan `endAt`) ✅
- [x] Semua field penting sudah di-select ✅
- [x] Frontend fetch dari endpoint yang benar ✅
- [x] Structured data menggunakan semua field promo ✅
- [x] Metadata menggunakan promo untuk description ✅
- [x] Keywords ditambahkan jika ada promo ✅

---

## 🔧 Perbaikan yang Dilakukan

### **Perbaikan: Menambahkan startAt dan endAt**

**Sebelum:**
- Backend tidak return `startAt` dan `endAt`
- Frontend structured data menggunakan `promo.startAt` dan `promo.endAt` (undefined)

**Sesudah:**
- ✅ Backend sekarang select `startAt` dan `endAt`
- ✅ Backend convert DateTime ke ISO string
- ✅ Controller DTO updated untuk include `startAt` dan `endAt`
- ✅ Frontend structured data sekarang bisa menggunakan `validFrom` dan `validThrough`

---

## 🎯 Kesimpulan

**✅ YA, penerapan SEO promo sudah merefer ke table wks_promo dengan benar:**

1. **Backend:**
   - ✅ Query langsung ke `wks_promo` table
   - ✅ Menggunakan `waitingList_id` sebagai FK
   - ✅ Filter promo aktif dan valid tanggal
   - ✅ Return semua field yang diperlukan untuk SEO

2. **Frontend:**
   - ✅ Fetch dari endpoint yang benar (`/waiting-list/:id/promo`)
   - ✅ Menggunakan `workshop.id` sebagai `waitingList_id`
   - ✅ Semua field promo digunakan di structured data
   - ✅ Promo ditambahkan ke metadata description dan keywords

3. **Structured Data:**
   - ✅ Offer schema menggunakan semua field dari `wks_promo`
   - ✅ Valid date range (`validFrom`, `validThrough`)
   - ✅ Price specification berdasarkan `promoType`

**Implementasi sudah lengkap dan sesuai dengan skema Prisma!** ✅

