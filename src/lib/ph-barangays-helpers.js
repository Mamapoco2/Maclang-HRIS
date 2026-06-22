import PH_BARANGAYS_BY_PROVINCE_CITY from "./ph-barangays";

export function getBarangays(province, city) {
  if (!province || !city) return [];
  return PH_BARANGAYS_BY_PROVINCE_CITY[province]?.[city] ?? [];
}

export function getMandaluyongBarangays() {
  return getBarangays("Metro Manila", "Mandaluyong");
}

export function getBarangaysByCityNameOnly(cityName) {
  for (const province of Object.keys(PH_BARANGAYS_BY_PROVINCE_CITY)) {
    const cities = PH_BARANGAYS_BY_PROVINCE_CITY[province];
    if (cityName in cities) {
      return cities[cityName];
    }
  }
  return [];
}

export function hasBarangayData(province, city) {
  return getBarangays(province, city).length > 0;
}

export default PH_BARANGAYS_BY_PROVINCE_CITY;
