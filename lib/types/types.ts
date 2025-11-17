export interface SysProvince {
  id: string;
  name: string;
  company_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
  updatedBy?: string | null;
  cities?: Array<{
    id: string;
    name: string;
  }>;
}

export interface SysCity {
  id: string;
  name: string;
  company_id: string;
  province_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
  updatedBy?: string | null;
  province?: {
    id: string;
    name: string;
  };
  districts?: Array<{
    id: string;
    name: string;
  }>;
}

export interface SysDistrict {
  id: string;
  name: string;
  company_id: string;
  city_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
  updatedBy?: string | null;
  city?: {
    id: string;
    name: string;
    province?: {
      id: string;
      name: string;
    };
  };
  subdistricts?: Array<{
    id: string;
    name: string;
  }>;
}

export interface SysSubDistrict {
  id: string;
  name: string;
  company_id: string;
  district_id: string;
  city_id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
  updatedBy?: string | null;
  district?: {
    id: string;
    name: string;
    city?: {
      id: string;
      name: string;
    };
  };
  city?: {
    id: string;
    name: string;
    province?: {
      id: string;
      name: string;
    };
  };
}

