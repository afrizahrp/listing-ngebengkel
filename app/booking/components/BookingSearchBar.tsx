import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type BookingSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BookingSearchBar({ value, onChange }: BookingSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari nama bengkel atau promo..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        aria-label="Cari nama bengkel atau promo"
      />
    </div>
  );
}


