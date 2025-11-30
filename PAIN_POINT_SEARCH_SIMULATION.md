# Simulasi Pain Point Search

## Scenario: User mengetik "bunyi gludak-gluduk pada saat mobil jalan"

### Step 1: User Input
```
User mengetik di SearchBar:
┌─────────────────────────────────────────────────────────┐
│ 🔍 bunyi gludak-gluduk pada saat mobil jalan           │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Real-time Processing (setiap ketikan)

#### 2.1 Keyword Extraction
```javascript
Input: "bunyi gludak-gluduk pada saat mobil jalan"
↓
Extract keywords: ["bunyi", "gludak", "gluduk", "pada", "saat", "mobil", "jalan"]
↓
Filter (length > 2): ["bunyi", "gludak", "gluduk", "pada", "saat", "mobil", "jalan"]
```

#### 2.2 Pain Point Matching
```javascript
Check keywords terhadap PAIN_POINT_KEYWORDS:

"suspensi" keywords: ['bunyi', 'gludak', 'gluduk', 'berbunyi', 'suspensi', 'shock', ...]
↓
Matches found:
- "bunyi" → exact match (+2 points)
- "gludak" → exact match (+2 points)  
- "gluduk" → exact match (+2 points)
- Full phrase "bunyi gludak-gluduk" → phrase match (+3 points)
↓
Total Score: 9 points
Confidence: 0.9 (90%)
```

#### 2.3 Service Types Mapping
```javascript
Matched Pain Point: "suspensi"
↓
Service Types:
- Perbaikan Suspensi
- Ganti Shock Absorber
- Service Suspensi
- Perbaikan Per
- Ganti Bushing Suspensi
- Perbaikan Stabilizer
```

### Step 3: Visual Feedback (UI)

#### 3.1 Search Suggestions (Dropdown)
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 bunyi gludak-gluduk pada saat mobil jalan           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Saran Pencarian                                         │
├─────────────────────────────────────────────────────────┤
│ 🔧 Masalah Suspensi                                    │
│ 🔧 Perbaikan Suspensi                                  │
│ 🔧 Service Suspensi                                    │
└─────────────────────────────────────────────────────────┘
```

#### 3.2 Pain Point Badge (Setelah Enter/Submit)
```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Menampilkan bengkel untuk: Masalah Suspensi         │
│    Ditemukan berdasarkan: bunyi, gludak, gluduk       │
│                                                         [×]
└─────────────────────────────────────────────────────────┘
```

### Step 4: Filtering Bengkel

#### 4.1 Backend Query (Enhanced)
```javascript
// Query ke backend dengan service types
{
  serviceTypes: [
    "Perbaikan Suspensi",
    "Ganti Shock Absorber", 
    "Service Suspensi",
    // ... dll
  ]
}
```

#### 4.2 Frontend Filtering
```javascript
// Filter bengkel yang memiliki service types tersebut
branches.filter(branch => {
  return branch.serviceTypes?.some(serviceType => 
    matchedServiceTypes.includes(serviceType.name)
  );
});
```

### Step 5: Results Display

```
┌─────────────────────────────────────────────────────────┐
│ Menampilkan 12 dari 45 bengkel untuk: Masalah Suspensi │
└─────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Bengkel A    │ │ Bengkel B    │ │ Bengkel C    │
│              │ │              │ │              │
│ ✅ Perbaikan │ │ ✅ Ganti     │ │ ✅ Service   │
│    Suspensi  │ │    Shock     │ │    Suspensi  │
│              │ │    Absorber  │ │              │
│              │ │              │ │              │
│ [WhatsApp]   │ │ [WhatsApp]   │ │ [WhatsApp]   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Step 6: User Action

#### Option A: User klik salah satu bengkel
```
→ Navigate ke /workshop/[slug]
→ Detail page menampilkan service types yang relevan
```

#### Option B: User klik "Lihat semua bengkel untuk Masalah Suspensi"
```
→ Navigate ke /bengkel?painPoint=suspensi
→ Landing page khusus untuk masalah suspensi (SEO-friendly)
```

---

## Flow Diagram

```
User Input
    ↓
[SearchBar Component]
    ↓
[Pain Point Matcher]
    ├─→ Extract Keywords
    ├─→ Match Pain Points
    └─→ Map to Service Types
    ↓
[Visual Feedback]
    ├─→ Search Suggestions (dropdown)
    └─→ Pain Point Badge (after submit)
    ↓
[Enhanced Filtering]
    ├─→ Filter by Service Types
    └─→ Sort by Relevance
    ↓
[Results Display]
    └─→ BranchList dengan filtered results
```

---

## Contoh Query Lainnya

### Query: "AC tidak dingin"
```
Match: "ac" (confidence: 0.95)
Service Types: ["Service AC", "Isi Freon AC", "Perbaikan AC", ...]
Result: Bengkel yang handle AC
```

### Query: "rem bunyi"
```
Match: "rem" (confidence: 0.85)
Service Types: ["Perbaikan Rem", "Ganti Kampas Rem", "Service Rem", ...]
Result: Bengkel yang handle rem
```

### Query: "service berkala"
```
Match: "oli" (confidence: 0.90)
Service Types: ["Ganti Oli", "Service Berkala", "Tune Up", ...]
Result: Bengkel yang handle service rutin
```

### Query: "Jakarta" (lokasi, bukan pain point)
```
Match: null (bukan pain point)
Result: Filter by location (city/district) seperti biasa
```

---

## Technical Implementation

### Files Created:
1. `utils/painPointMatcher.ts` - Core matching logic
2. `components/PainPointBadge.tsx` - Visual feedback badge
3. `components/SearchSuggestions.tsx` - Dropdown suggestions

### Files to Modify:
1. `components/CTA.tsx` - Integrate pain point matching
2. `components/SearchBar.tsx` - Add suggestions dropdown
3. `components/BranchList.tsx` - Show service types badges

### Database Requirements:
- Bengkel harus punya relasi ke `wks_ServiceType`
- Service types harus punya nama yang match dengan mapping

---

## Next Steps

1. ✅ Create pain point matcher utility
2. ✅ Create visual feedback components
3. ⏳ Integrate ke CTA.tsx
4. ⏳ Update SearchBar dengan suggestions
5. ⏳ Update BranchList untuk show service types
6. ⏳ Backend API untuk filter by service types
7. ⏳ SEO landing pages untuk pain points




