/**
 * Country and city constants
 */

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface City {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'France', name: 'France', flag: '🇫🇷' },
  { code: 'Netherlands', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'Ireland', name: 'Ireland', flag: '🇮🇪' },
  { code: 'Malta', name: 'Malta', flag: '🇲🇹' },
  { code: 'Sweden', name: 'Sweden', flag: '🇸🇪' },
  { code: 'Czechia', name: 'Czechia', flag: '🇨🇿' },
  { code: 'Croatia', name: 'Croatia', flag: '🇭🇷' },
  { code: 'Bulgaria', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'Finland', name: 'Finland', flag: '🇫🇮' },
  { code: 'Slovenia', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'Denmark', name: 'Denmark', flag: '🇩🇰' },
  { code: 'Norway', name: 'Norway', flag: '🇳🇴' },
  { code: 'Estonia', name: 'Estonia', flag: '🇪🇪' },
  { code: 'Lithuania', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'Luxembourg', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'Ukraine', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'Latvia', name: 'Latvia', flag: '🇱🇻' },
  { code: 'Portugal', name: 'Portugal', flag: '🇵🇹' },
];

export const CITIES: City[] = [
  { code: 'Ankara', name: 'Ankara' },
  { code: 'Istanbul', name: 'Istanbul' },
  { code: 'Izmir', name: 'Izmir' },
  { code: 'Gaziantep', name: 'Gaziantep' },
  { code: 'Edirne', name: 'Edirne' },
  { code: 'Antalya', name: 'Antalya' },
  { code: 'Bursa', name: 'Bursa' },
];

export const MONTHS: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
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

export function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day} ${MONTHS[month]} ${year}`;
  } catch {
    return dateStr;
  }
}
