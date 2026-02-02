/**
 * Schengen Visa Appointments API Client
 * Harici API: https://api.schengenvisaappointments.com
 */

export interface AppointmentData {
  id: number;
  source_country: string;
  mission_country: string;
  center_name: string;
  appointment_date: string;
  visa_category: string;
  visa_subcategory: string | null;
  book_now_link: string;
}

export interface FilterOptions {
  country?: string;
  city?: string;
  sourceCountry?: string;
}

export class SchengenAppointmentAPI {
  private baseUrl = 'https://api.schengenvisaappointments.com/api/visa-list/';

  /**
   * Tüm randevuları getir
   */
  async getAppointments(): Promise<AppointmentData[]> {
    try {
      const response = await fetch(`${this.baseUrl}?format=json`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Her zaman fresh data
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }

      return data;
    } catch (error) {
      console.error('SchengenAppointmentAPI Error:', error);
      throw error;
    }
  }

  /**
   * Randevuları filtrele
   */
  filterAppointments(
    appointments: AppointmentData[],
    options: FilterOptions
  ): AppointmentData[] {
    const {
      country,
      city,
      sourceCountry = 'Turkiye'
    } = options;

    return appointments.filter(apt => {
      // Kaynak ülke kontrolü
      if (sourceCountry && apt.source_country !== sourceCountry) {
        return false;
      }

      // Hedef ülke kontrolü
      if (country && apt.mission_country.toLowerCase() !== country.toLowerCase()) {
        return false;
      }

      // Şehir kontrolü
      if (city && !apt.center_name.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }

      // Randevu tarihi kontrolü (geçmiş tarihler hariç)
      if (apt.appointment_date) {
        const appointmentDate = new Date(apt.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Randevuları tarihe göre sırala
   */
  sortByDate(appointments: AppointmentData[]): AppointmentData[] {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.appointment_date);
      const dateB = new Date(b.appointment_date);
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Tek bir ülke ve şehir için randevu kontrol et
   */
  async checkAvailability(country: string, city: string): Promise<AppointmentData[]> {
    const appointments = await this.getAppointments();
    const filtered = this.filterAppointments(appointments, { country, city });
    return this.sortByDate(filtered);
  }

  /**
   * Çoklu ülke ve şehir için randevu kontrol et
   */
  async checkMultiple(
    countries: string[],
    cities: string[]
  ): Promise<Map<string, AppointmentData[]>> {
    const appointments = await this.getAppointments();
    const results = new Map<string, AppointmentData[]>();

    for (const country of countries) {
      for (const city of cities) {
        const key = `${country}-${city}`;
        const filtered = this.filterAppointments(appointments, { country, city });
        const sorted = this.sortByDate(filtered);
        
        if (sorted.length > 0) {
          results.set(key, sorted);
        }
      }
    }

    return results;
  }
}

// Singleton instance
export const schengenAPI = new SchengenAppointmentAPI();
