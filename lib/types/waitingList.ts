import type { WorkshopType } from './workshop';

export interface WaitingListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  province: string;
  subdistrict: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  categoryId: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  workshopTypes: WorkshopType[];
  hasPromo?: boolean;
  promoPreview?: {
    id: string;
    title: string;
    promoType: string;
    checklist?: string[] | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}


