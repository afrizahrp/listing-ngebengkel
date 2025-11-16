export const SYS_ENDPOINTS = {
  province: {
    base: '/sys_province',
    byId: (id: string) => `/sys_province/${id}`,
  },
  city: {
    base: '/sys_city',
    byId: (id: string) => `/sys_city/${id}`,
    byProvince: (provinceId: string) => `/sys_city/province/${provinceId}`,
  },
  district: {
    base: '/sys_district',
    byId: (id: string) => `/sys_district/${id}`,
    byCity: (cityId: string) => `/sys_district/city/${cityId}`,
  },
  subdistrict: {
    base: '/sys_subdistrict',
    byId: (id: string) => `/sys_subdistrict/${id}`,
    byDistrict: (districtId: string) => `/sys_subdistrict/district/${districtId}`,
    byCity: (cityId: string) => `/sys_subdistrict/city/${cityId}`,
  },
  waitingList: {
    // Arahkan ke route proxy Next.js agar token tetap di server
    base: '/api/waiting-list',
    byId: (id: string) => `/api/waiting-list/${id}`,
    categories: '/waiting-list/categories',
    checkAvailability: '/waiting-list/check-availability',
  },
} as const;

export type SysEndpointGroup = keyof typeof SYS_ENDPOINTS;


