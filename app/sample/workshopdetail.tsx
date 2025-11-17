import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Award, 
  Tag,
  Sparkles 
} from "lucide-react";

export interface Workshop {
  name: string;
  category: string;
  type: string;
  promoText?: string;
  description?: string;
  duration?: string;
  schedule?: string;
  instructor?: string;
  location?: string;
  capacity?: string;
  price?: string;
  requirements?: string[];
  outcomes?: string[];
}

interface WorkshopDetailModalProps {
  workshop: Workshop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkshopDetailModal = ({
  workshop,
  open,
  onOpenChange,
}: WorkshopDetailModalProps) => {
  if (!workshop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {workshop.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                {workshop.category}
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {workshop.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Promo Section */}
          {workshop.promoText && (
            <div className="bg-badge-promo/10 border-2 border-badge-promo/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-badge-promo shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-badge-promo mb-1">
                    Special Offer
                  </h4>
                  <p className="text-sm text-card-foreground">
                    {workshop.promoText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About This Workshop</h3>
            <p className="text-muted-foreground leading-relaxed">
              {workshop.description}
            </p>
          </div>

          <Separator />

          {/* Workshop Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshop.duration && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Duration</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.duration}
                  </p>
                </div>
              </div>
            )}

            {workshop.schedule && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Schedule</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.schedule}
                  </p>
                </div>
              </div>
            )}

            {workshop.instructor && (
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Instructor</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.instructor}
                  </p>
                </div>
              </div>
            )}

            {workshop.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Location</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.location}
                  </p>
                </div>
              </div>
            )}

            {workshop.capacity && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Capacity</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.capacity}
                  </p>
                </div>
              </div>
            )}

            {workshop.price && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Price</p>
                  <p className="text-muted-foreground text-sm">
                    {workshop.price}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Requirements */}
          {workshop.requirements && workshop.requirements.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {workshop.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground text-sm">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Learning Outcomes */}
          {workshop.outcomes && workshop.outcomes.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {workshop.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span className="text-muted-foreground text-sm">
                        {outcome}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" size="lg">
              Register Now
            </Button>
            <Button variant="outline" size="lg">
              Save for Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
