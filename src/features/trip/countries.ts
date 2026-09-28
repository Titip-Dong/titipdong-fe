/** Destinations offered in the trip form, keyed by ISO 3166-1 alpha-2 code. */
export const countries: Record<string, string> = {
  JP: "Jepang",
  KR: "Korea Selatan",
  SG: "Singapura",
  TH: "Thailand",
  MY: "Malaysia",
  VN: "Vietnam",
  CN: "Tiongkok",
  HK: "Hong Kong",
  TW: "Taiwan",
  AU: "Australia",
  US: "Amerika Serikat",
  GB: "Inggris",
  FR: "Prancis",
  TR: "Turki",
  SA: "Arab Saudi",
  ID: "Indonesia",
};

export function countryName(code: string): string {
  return countries[code] ?? code;
}
