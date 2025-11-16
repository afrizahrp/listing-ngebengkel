import { Badge } from '@/components/ui/badge';
import type { BookingSlot } from '../../../types/booking';

type BookingSlotListProps = {
  slots: BookingSlot[];
};

export function BookingSlotList({ slots }: BookingSlotListProps) {
  const availableSlots = slots.filter((slot) => slot.isAvailable);

  if (availableSlots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada slot tersedia untuk hari ini. Silakan cek kembali nanti.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableSlots.map((slot) => (
        <Badge
          key={slot.id}
          variant="outline"
          className="rounded-full border border-[#045693]/40 bg-white px-3 py-1 text-sm text-foreground"
        >
          {slot.startTime} - {slot.endTime}
        </Badge>
      ))}
    </div>
  );
}


