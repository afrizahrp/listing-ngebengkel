import { Button } from '@/components/ui/button';

type BookingTypeFilterProps = {
  types: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
};

export function BookingTypeFilter({ types, selectedType, onSelectType }: BookingTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {['Semua Tipe', ...types].map((type) => {
        const isSelected = selectedType === type;
        return (
          <Button
            key={type}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectType(type)}
            aria-pressed={isSelected}
            className={
              isSelected
                ? 'rounded-full border border-[#045693] bg-[#045693] text-white hover:bg-[#045693]/90 px-5 py-2 shadow-sm'
                : 'rounded-full border border-[#045693]/40 text-[#045693] bg-white px-5 py-2 hover:border-[#045693] hover:bg-primary/5'
            }
          >
            {type}
          </Button>
        );
      })}
    </div>
  );
}


