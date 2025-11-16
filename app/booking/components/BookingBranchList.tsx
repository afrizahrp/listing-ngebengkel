'use client';
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BookingBranch } from '@/types/booking'
// Removed BookingSlotList import because slots are not shown now
import { useRouter } from 'next/navigation'


type BookingBranchListProps = {
  branches: BookingBranch[];
  onBranchClick?: (branch: BookingBranch) => void;
};

export function BookingBranchList({ branches, onBranchClick }: BookingBranchListProps) {
  const router = useRouter()
  const [openPromoId, setOpenPromoId] = useState<string | null>(null)
  if (branches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tidak ada bengkel yang cocok dengan filter saat ini. Coba pilih kota lain atau sesuaikan
        kata kunci pencarian.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      {branches.map((branch) => {
        const rawPhone = (branch.phone || '').trim()
        const digitsOnly = rawPhone.replace(/[^0-9]/g, '')
        let normalized = digitsOnly
        if (digitsOnly.startsWith('0')) {
          normalized = `62${digitsOnly.slice(1)}`
        } else if (digitsOnly.startsWith('8')) {
          normalized = `62${digitsOnly}`
        }
        // Validasi sederhana: mulai dengan 62 dan panjang wajar (10-15)
        const isValidWa = /^62[0-9]{8,13}$/.test(normalized)
        const defaultMsg = `Halo, saya tertarik dengan layanan ${branch.name}.`
        const waLink = isValidWa
          ? `https://wa.me/${normalized}?text=${encodeURIComponent(defaultMsg)}`
          : ''
        const mapsLink = branch.address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name} ${branch.address}`)}`
          : ''
        const handleOpenDetail = () => {
          onBranchClick?.(branch)
          router.push(`/workshop/${branch.id}`)
        }
        const hasPromoOpen = openPromoId === branch.id && (branch as any).promoPreview
        return (
          <Card
            key={branch.id}
            className="bg-white shadow-none border-0 rounded-xl transition hover:bg-gray-50/60 hover:ring-1 hover:ring-gray-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleOpenDetail}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenDetail()
            }}
            aria-label={`Buka detail ${branch.name}`}
          >
            <CardHeader className="flex flex-col gap-1 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {branch.name}
                  </CardTitle>
                  {branch.company?.name && (
                    <p className="text-sm text-muted-foreground">{branch.company.name}</p>
                  )}
                  {(branch as any).typeName && (
                    <p className="text-sm text-muted-foreground">{(branch as any).typeName}</p>
                  )}
                </div>
              </div>
              {(branch.address || branch.district) && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {[branch.address, branch.district].filter(Boolean).join(' • ')}
                  </p>
                  {mapsLink && (
                    <a
                      className="text-xs text-blue-600 hover:underline"
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Lihat lokasi di Google Maps
                    </a>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              {hasPromoOpen && (
                <div className="mb-3 rounded-md bg-gray-100 p-3" onClick={(e) => e.stopPropagation()}>
                  {(() => {
                    const p = (branch as any).promoPreview as {
                      title?: string
                      checklist?: string[]
                    }
                    const checklist = Array.isArray(p?.checklist) ? p!.checklist! : []
                    return (
                      <div className="text-sm text-foreground">
                        <p className="font-medium">{p?.title ?? 'Promo'}</p>
                        {checklist.length > 0 && (
                          <ul className="mt-1 list-disc pl-5">
                            {checklist.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="flex items-center gap-2">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
                    aria-label="Hubungi via WhatsApp"
                    title={normalized}
                    onClick={(e) => e.stopPropagation()}
                  >
                    💬 WhatsApp
                  </a>
                )}
                {(branch as any).promoPreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenPromoId((curr) => (curr === branch.id ? null : branch.id))
                    }}
                    className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-200"
                    aria-expanded={openPromoId === branch.id}
                  >
                    🏷️ Promo
                  </button>
                )}
              </div>

              <div className="mt-3 border-b border-gray-200" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


