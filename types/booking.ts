export type BookingSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type BookingBranch = {
  id: string;
  name: string;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  company: {
    id: string;
    name: string;
  };
  slots: BookingSlot[];
};

export type BookingData = {
  branches: BookingBranch[];
};


