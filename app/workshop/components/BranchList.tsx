'use client';
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardTitle } from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, MapPin, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookingBranch } from '@/types/booking'
// Removed SlotList import because slots are not shown now
import { useRouter } from 'next/navigation'
import { useClaimWorkshop } from '@/queryHooks/useClaimWorkshop'
import { toast } from 'sonner'


type PromoPreview = {
  id?: string;
  title?: string;
  promoType?: string;
  checklist?: string[] | null;
} | null;

type BranchItem = BookingBranch & {
  typeName?: string | null;
  promoPreview?: PromoPreview;
  claimStatus?: string | null;
};

type BranchListProps = {
  branches: BranchItem[];
  onBranchClick?: (branch: BranchItem) => void;
};

export function BranchList({ branches, onBranchClick }: BranchListProps) {
  const router = useRouter()
  const [openPromoIds, setOpenPromoIds] = useState<Set<string>>(new Set())
  // Track branch yang sudah berhasil diklaim di sisi UI (tanpa reload)
  const [locallyClaimedIds] = useState<Set<string>>(new Set())
  const [claimingBranchId, setClaimingBranchId] = useState<string | null>(null)
  const claimMutation = useClaimWorkshop()
  if (branches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tidak ada bengkel yang cocok dengan filter saat ini. Coba pilih kota lain atau sesuaikan
        kata kunci pencarian.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
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
          // Gunakan slug dari database (sudah pasti terisi di wks_waitingList)
          // Fallback ke ID jika slug tidak tersedia (seharusnya tidak terjadi)
          const slug = branch.slug || branch.id
          if (!slug) {
            console.warn('No slug or ID available for branch:', branch.name)
            return
          }
          router.push(`/workshop/${slug}`)
        }
        // Cek apakah promo untuk branch ini sudah expanded
        const branchIdStr = branch.id ? String(branch.id).trim() : null
        const isPromoExpanded = branchIdStr !== null && openPromoIds.has(branchIdStr) && !!branch.promoPreview
        const promo = branch.promoPreview
        const checklist = Array.isArray(promo?.checklist) ? promo!.checklist! : []
        
        // Check claim status
        // Button hanya hidden jika status benar-benar CLAIMED (bukan PENDING_VERIFICATION)
        const isAlreadyClaimedFromApi =
          !!branch.claimStatus && branch.claimStatus === 'CLAIMED'
        const isLocallyClaimed =
          !!branchIdStr && locallyClaimedIds.has(branchIdStr)
        const isUnclaimed = !isAlreadyClaimedFromApi && !isLocallyClaimed
        
        const handleClaim = async (e: React.MouseEvent) => {
          e.stopPropagation()
          e.preventDefault()
          
          if (!branch.id) return
          
          // Trim ID untuk menghilangkan spasi
          const trimmedId = String(branch.id).trim()
          if (!trimmedId) return
          
          // Prevent multiple clicks
          if (claimingBranchId === trimmedId) return
          
          // Set claiming state untuk branch ini saja
          setClaimingBranchId(trimmedId)
          
          // TODO: Show modal/form untuk input phone, name, email
          // Untuk sekarang, gunakan data dari branch
          try {
            const result = await claimMutation.mutateAsync({
              waitingListId: trimmedId,
              phone: branch.phone || '',
              name: branch.name,
            })
            // JANGAN langsung hide button - status masih PENDING_VERIFICATION
            // Button akan hilang setelah verifikasi sukses (status = CLAIMED)
            toast.success('Kode Verifikasi Dikirim', {
              description: result.message || 'Silakan cek WhatsApp untuk kode verifikasi.',
            })
            // Redirect ke halaman verifikasi
            if (!branch.slug) {
              toast.error('Slug tidak tersedia', {
                description: 'Tidak dapat redirect ke halaman verifikasi.',
              })
              return
            }
            router.push(`/workshop/${branch.slug}/claim/verify?claimRequestId=${result.claimRequestId}`)
          } catch (error: unknown) {
            const description =
              error instanceof Error
                ? error.message || 'Terjadi kesalahan saat mengklaim bengkel.'
                : 'Terjadi kesalahan saat mengklaim bengkel.'
            toast.error('Gagal Klaim', {
              description,
            })
          } finally {
            // Reset claiming state setelah selesai
            setClaimingBranchId(null)
          }
        }
        
        return (
          <Card
            key={`branch-${branch.id}-${index}`}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/5",
              "border border-gray-200/60 bg-card",
              "cursor-pointer",
              "flex flex-col h-full",
              "rounded-xl"
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
                    "bg-yellow-50 text-yellow-800 border-yellow-200/60",
                    "px-3 py-1.5 text-xs font-semibold",
                    "rounded-br-xl rounded-tl-none rounded-tr-none rounded-bl-none",
                    "shadow-md"
                  )}
                >
                  {/* <Sparkles className="h-3.5 w-3.5 mr-1.5" /> */}
                  Promo
                </Badge>
              </div>
            )}
            {/* Logo - Pojok Kanan Atas */}
            {branch.logo && (
              <div className="absolute top-0 right-0 z-10 p-3" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={branch.logo}
                  alt={`${branch.name} logo`}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-md object-cover ring-1 ring-border/30 shadow-sm"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1 min-h-0">
              {/* Content Section - Can grow */}
              <div className="flex flex-col flex-1 space-y-4 min-h-0">
                {/* Header Section */}
                <div className={cn("space-y-3", branch.promoPreview && "mt-8", branch.logo && "pr-10")}>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm md:text-base font-semibold text-card-foreground leading-snug">
                    {branch.name}
                  </CardTitle>
                  {branch.company?.name && (
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{branch.company.name}</p>
                  )}
                </div>
                
                {branch.typeName && (
                  <Badge variant="secondary" className="w-fit text-xs font-medium px-2.5 py-1">
                    {branch.typeName}
                  </Badge>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <p className="text-sm">
                    {branch.city || 'Kota tidak tersedia'}
                  </p>
                </div>
              </div>

              {/* Action Area Container - Container Terpisah untuk WhatsApp & Promo */}
              <div className="mt-6 pt-6 shrink-0 space-y-3 border-t border-gray-100/80">
                {/* Claim Button - Tampilkan jika unclaimed */}
                {isUnclaimed && (
                  <Button
                    variant="outline"
                    size="default"
                    className={cn(
                      "w-full gap-2 rounded-lg",
                      "transition-all duration-200",
                      "focus:outline-none",
                      "h-10",
                      "border-blue-200 text-blue-700 hover:bg-blue-50"
                    )}
                    onClick={handleClaim}
                    disabled={claimingBranchId === branchIdStr || claimMutation.isPending}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">
                      {claimingBranchId === branchIdStr ? 'Memproses...' : 'Klaim Bengkel Ini'}
                    </span>
                  </Button>
                )}
                
                {/* WhatsApp Button */}
                {waLink && (
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className={cn(
                      "w-full gap-2 rounded-lg",
                      "transition-all duration-200",
                      "focus:outline-none",
                      "h-10"
                    )}
                    style={{
                      borderColor: 'rgba(22, 163, 74, 0.4)',
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#16A34A';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#16A34A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#16A34A';
                        e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.4)';
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">WhatsApp</span>
                    </a>
                  </Button>
                )}

                {/* Collapsible Promo Section */}
                {branch.promoPreview ? (
                  <div className="shrink-0">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        const branchIdStr = String(branch.id).trim();
                        setOpenPromoIds((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(branchIdStr)) {
                            // Jika sudah expanded, tutup (remove dari set)
                            newSet.delete(branchIdStr);
                          } else {
                            // Jika belum expanded, buka (tambah ke set)
                            newSet.add(branchIdStr);
                          }
                          return newSet;
                        });
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2",
                        "px-4 py-2.5 rounded-lg h-10",
                        "transition-all duration-300",
                        "focus:outline-none",
                        "text-primary border-primary/60",
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
                        e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.6)';
                      }}
                      aria-expanded={!!isPromoExpanded}
                      aria-controls={`promo-content-${branch.id}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span className="font-semibold text-sm truncate">
                          {promo?.title ?? '🎉 Promo'}
                        </span>
                      </div>
                      {isPromoExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </Button>
                    
                    <div
                      id={`promo-content-${branch.id}`}
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        isPromoExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="px-4 py-3 bg-background border border-primary/20 rounded-b-lg mt-0.5">
                        <div className="text-sm text-foreground space-y-2">
                          {checklist.length > 0 ? (
                            <ul className="space-y-2">
                              {checklist.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5 shrink-0 text-sm font-medium">✓</span>
                                  <span className="flex-1 text-sm leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm">{promo?.title ?? 'Promo tersedia'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
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


