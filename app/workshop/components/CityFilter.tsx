import { Button } from '@/components/ui/button';

type CityFilterProps = {
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
};

export function CityFilter({ cities, selectedCity, onSelectCity }: CityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {['Semua Kota', ...cities].map((city) => {
        const isSelected = selectedCity === city;
        return (
          <Button
            key={city}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCity(city)}
            aria-pressed={isSelected}
            className={
              isSelected
                ? 'rounded-full border border-[#045693] bg-[#045693] text-white hover:bg-[#045693]/90 px-5 py-2 shadow-sm'
                : 'rounded-full border border-[#045693]/40 text-[#045693] bg-white px-5 py-2 hover:border-[#045693] hover:bg-primary/5'
            }
          >
            {city}
          </Button>
        );
      })}
    </div>
  );
}

