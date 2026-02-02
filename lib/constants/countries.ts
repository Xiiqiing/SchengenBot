/**
 * Ülke ve şehir sabitleri
 */

export interface Country {
  code: string;
  name: string;
  nameTr: string;
  flag: string;
}

export interface City {
  code: string;
  name: string;
  nameTr: string;
}

export const COUNTRIES: Country[] = [
  { code: 'France', name: 'France', nameTr: 'Fransa', flag: '🇫🇷' },
  { code: 'Netherlands', name: 'Netherlands', nameTr: 'Hollanda', flag: '🇳🇱' },
  { code: 'Ireland', name: 'Ireland', nameTr: 'İrlanda', flag: '🇮🇪' },
  { code: 'Malta', name: 'Malta', nameTr: 'Malta', flag: '🇲🇹' },
  { code: 'Sweden', name: 'Sweden', nameTr: 'İsveç', flag: '🇸🇪' },
  { code: 'Czechia', name: 'Czechia', nameTr: 'Çekya', flag: '🇨🇿' },
  { code: 'Croatia', name: 'Croatia', nameTr: 'Hırvatistan', flag: '🇭🇷' },
  { code: 'Bulgaria', name: 'Bulgaria', nameTr: 'Bulgaristan', flag: '🇧🇬' },
  { code: 'Finland', name: 'Finland', nameTr: 'Finlandiya', flag: '🇫🇮' },
  { code: 'Slovenia', name: 'Slovenia', nameTr: 'Slovenya', flag: '🇸🇮' },
  { code: 'Denmark', name: 'Denmark', nameTr: 'Danimarka', flag: '🇩🇰' },
  { code: 'Norway', name: 'Norway', nameTr: 'Norveç', flag: '🇳🇴' },
  { code: 'Estonia', name: 'Estonia', nameTr: 'Estonya', flag: '🇪🇪' },
  { code: 'Lithuania', name: 'Lithuania', nameTr: 'Litvanya', flag: '🇱🇹' },
  { code: 'Luxembourg', name: 'Luxembourg', nameTr: 'Lüksemburg', flag: '🇱🇺' },
  { code: 'Ukraine', name: 'Ukraine', nameTr: 'Ukrayna', flag: '🇺🇦' },
  { code: 'Latvia', name: 'Latvia', nameTr: 'Letonya', flag: '🇱🇻' },
  { code: 'Portugal', name: 'Portugal', nameTr: 'Portekiz', flag: '🇵🇹' },
];

export const CITIES: City[] = [
  { code: 'Ankara', name: 'Ankara', nameTr: 'Ankara' },
  { code: 'Istanbul', name: 'Istanbul', nameTr: 'İstanbul' },
  { code: 'Izmir', name: 'Izmir', nameTr: 'İzmir' },
  { code: 'Gaziantep', name: 'Gaziantep', nameTr: 'Gaziantep' },
  { code: 'Edirne', name: 'Edirne', nameTr: 'Edirne' },
  { code: 'Antalya', name: 'Antalya', nameTr: 'Antalya' },
  { code: 'Bursa', name: 'Bursa', nameTr: 'Bursa' },
];

export const MONTHS_TR: Record<string, string> = {
  '01': 'Ocak',
  '02': 'Şubat',
  '03': 'Mart',
  '04': 'Nisan',
  '05': 'Mayıs',
  '06': 'Haziran',
  '07': 'Temmuz',
  '08': 'Ağustos',
  '09': 'Eylül',
  '10': 'Ekim',
  '11': 'Kasım',
  '12': 'Aralık',
};

// UK Cities for schengenappointments.com scraping
export interface UKCity {
  code: string;
  name: string;
  nameEn: string;
}

export const UK_CITIES: UKCity[] = [
  { code: 'manchester', name: 'Manchester', nameEn: 'Manchester' },
  { code: 'london', name: 'London', nameEn: 'London' },
  { code: 'edinburgh', name: 'Edinburgh', nameEn: 'Edinburgh' },
  { code: 'cardiff', name: 'Cardiff', nameEn: 'Cardiff' },
];

export function getUKCityByCode(code: string): UKCity | undefined {
  return UK_CITIES.find(c => c.code === code.toLowerCase());
}

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCityByCode(code: string): City | undefined {
  return CITIES.find(c => c.code === code);
}

export function formatDateTR(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day} ${MONTHS_TR[month]} ${year}`;
  } catch {
    return dateStr;
  }
}
