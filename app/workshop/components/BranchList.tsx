'use client';
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardTitle } from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookingBranch } from '@/types/booking'
// Removed SlotList import because slots are not shown now
import { useRouter } from 'next/navigation'


type PromoPreview = {
  id?: string;
  title?: string;
  promoType?: string;
  checklist?: string[] | null;
} | null;

type BranchItem = BookingBranch & {
  typeName?: string | null;
  promoPreview?: PromoPreview;
};

type BranchListProps = {
  branches: BranchItem[];
  onBranchClick?: (branch: BranchItem) => void;
};

export function BranchList({ branches, onBranchClick }: BranchListProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 items-stretch">
      {branches.map((branch, index) => {
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
        const handleOpenDetail = () => {
          onBranchClick?.(branch)
          router.push(`/workshop/${branch.id}`)
        }
        // Pastikan perbandingan dengan tipe yang sama dan nilai yang valid
        const currentPromoId = openPromoId ? String(openPromoId).trim() : null
        const currentBranchId = branch.id ? String(branch.id).trim() : null
        const isPromoExpanded = currentPromoId !== null && currentPromoId === currentBranchId && !!branch.promoPreview
        const promo = branch.promoPreview
        const checklist = Array.isArray(promo?.checklist) ? promo!.checklist! : []
        
        return (
          <Card
            key={`branch-${branch.id}-${index}`}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              "hover:shadow-lg hover:shadow-shadow-hover",
              "border border-gray-100 bg-card",
              "cursor-pointer",
              "flex flex-col h-full"
            )}
            role="button"
            tabIndex={0}
            onClick={handleOpenDetail}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenDetail()
            }}
            aria-label={`Buka detail ${branch.name}`}
          >
            {/* Promo Badge - Pojok Kiri Atas */}
            {branch.promoPreview && (
              <div className="absolute top-0 left-0 z-10">
                <Badge 
                  className={cn(
                    "bg-yellow-50 text-yellow-800 border-yellow-200",
                    "px-2.5 py-1 text-xs font-semibold",
                    "rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none",
                    "shadow-sm"
                  )}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Promo
                </Badge>
              </div>
            )}
            <div className="p-4 md:p-5 flex flex-col flex-1 min-h-0">
              {/* Content Section - Can grow */}
              <div className="flex flex-col flex-1 space-y-3 min-h-0">
                {/* Header Section */}
                <div className={cn("space-y-2", branch.promoPreview && "mt-6")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg font-semibold text-card-foreground leading-tight line-clamp-1 truncate">
                      {branch.name}
                    </CardTitle>
                    {branch.company?.name && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-1">{branch.company.name}</p>
                    )}
                  </div>
                  {branch.logo && (
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Image
                        src={branch.logo}
                        alt={`${branch.name} logo`}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
                      />
                    </div>
                  )}
                </div>
                
                {branch.typeName && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {branch.typeName}
                  </Badge>
                )}
                
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <p className="text-xs md:text-sm">
                    {branch.city || 'Kota tidak tersedia'}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Action Buttons - WhatsApp di atas */}
              <div className="flex items-center gap-2 pt-2 mt-auto shrink-0">
                {waLink && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full gap-1.5 rounded-full",
                      "transition-all duration-200",
                      "focus:outline-none"
                    )}
                    style={{
                      borderColor: 'rgba(22, 163, 74, 0.5)',
                      color: '#16A34A',
                      backgroundColor: 'transparent'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Hubungi via WhatsApp"
                      title={normalized}
                      style={{
                        borderColor: 'rgba(22, 163, 74, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#16A34A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#16A34A';
                        e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.5)';
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </Button>
                )}
              </div>

              {/* Collapsible Promo Badge - di bawah WhatsApp */}
              {branch.promoPreview ? (
                <div className="shrink-0 mt-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPromoId((curr) => {
                        if (String(curr) === String(branch.id)) {
                          return null;
                        }
                        return String(branch.id);
                      });
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2",
                      "px-3 py-2 rounded-lg",
                      "transition-all duration-300",
                      "focus:outline-none",
                      "text-primary border-primary",
                      "hover:!bg-primary hover:!text-white hover:!border-primary",
                      isPromoExpanded && "rounded-b-none"
                    )}
                    style={{
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'hsl(var(--primary))';
                      e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                    }}
                    aria-expanded={!!isPromoExpanded}
                    aria-controls={`promo-content-${branch.id}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-semibold text-xs truncate">
                        {promo?.title ?? '🎉 Promo'}
                      </span>
                    </div>
                    {isPromoExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                  </Button>
                  
                  <div
                    id={`promo-content-${branch.id}`}
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isPromoExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-3 py-2 bg-background border border-primary/20 rounded-b-lg">
                      <div className="text-xs text-foreground space-y-1.5">
                        {checklist.length > 0 ? (
                          <ul className="space-y-1">
                            {checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-primary mt-0.5 shrink-0 text-xs">✓</span>
                                <span className="flex-1 text-xs leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs">{promo?.title ?? 'Promo tersedia'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[42px] shrink-0" aria-hidden="true" />
              )}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full blur-2xl md:blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-accent/5 rounded-full blur-xl md:blur-2xl -z-10 group-hover:bg-accent/10 transition-colors duration-300" />
          </Card>
        )
      })}
    </div>
  )
}


