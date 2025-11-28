export type BookingSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type BookingBranch = {
  id: string;
  name: string;
  slug?: string | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  logo?: string | null;
  company: {
    id: string;
    name: string;
  };
  slots: BookingSlot[];
};

export type BookingData = {
  branches: BookingBranch[];
};


