export type WorkshopType = {
  id: string;
  name: string;
  description: string | null;
};

export type WorkshopCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  types: WorkshopType[];
};

