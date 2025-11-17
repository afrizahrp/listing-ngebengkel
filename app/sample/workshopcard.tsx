import { useState } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WorkshopCardProps {
  name: string;
  category: string;
  type: string;
  promoText?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

export const WorkshopCard = ({
  name,
  category,
  type,
  promoText,
  description,
  className,
  onClick,
}: WorkshopCardProps) => {
  const [isPromoExpanded, setIsPromoExpanded] = useState(false);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-shadow-hover",
        "border-border bg-card",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="p-6 space-y-4">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold text-card-foreground leading-tight">
              {name}
            </h3>
            <Badge variant="secondary" className="shrink-0 font-medium">
              {type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">{category}</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Collapsible Promo Badge */}
        {promoText && (
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPromoExpanded(!isPromoExpanded);
              }}
              className={cn(
                "w-full flex items-center justify-between gap-3",
                "px-4 py-3 rounded-lg",
                "bg-badge-promo text-badge-promo-foreground",
                "transition-all duration-300",
                "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-badge-promo focus:ring-offset-2",
                isPromoExpanded && "rounded-b-none"
              )}
              aria-expanded={isPromoExpanded}
              aria-controls="promo-content"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {isPromoExpanded ? "Special Offer" : "🎉 Special Offer"}
                </span>
              </div>
              {isPromoExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>
            
            <div
              id="promo-content"
              className={cn(
                "overflow-hidden transition-all duration-300",
                isPromoExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-4 py-3 bg-badge-promo/10 border border-badge-promo/20 rounded-b-lg">
                <p className="text-sm text-card-foreground">
                  {promoText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -z-10 group-hover:bg-accent/10 transition-colors duration-300" />
    </Card>
  );
};
