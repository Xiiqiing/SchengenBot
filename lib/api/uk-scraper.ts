/**
 * UK Schengen Appointments Scraper
 * Scrapes appointment data from schengenappointments.com for UK cities
 */

import axios from 'axios';

export interface UKAppointmentSlot {
  date: string;           // e.g., "03 Feb (Tue)"
  slotsAvailable: number; // e.g., 1
  lastSeen: string;       // e.g., "30 minutes ago"
}

export interface UKAppointmentData {
  city: string;
  country: string;
  isAvailable: boolean;
  totalSlots: number;
  totalDays: number;
  slots: UKAppointmentSlot[];
  bookingLink: string | null;
  lastChecked: string;
  checkedAt: Date;
  sourceUrl: string;
}

export class UKAppointmentScraper {
  private baseUrl = 'https://schengenappointments.com';

  /**
   * Build the URL for a specific city/country combination
   */
  private buildUrl(city: string, country: string, visaType: string = 'tourism'): string {
    return `${this.baseUrl}/in/${city.toLowerCase()}/${country.toLowerCase()}/${visaType}`;
  }

  /**
   * Fetch and parse appointment data for a specific city/country
   */
  async checkAvailability(
    city: string,
    country: string,
    visaType: string = 'tourism'
  ): Promise<UKAppointmentData> {
    const url = this.buildUrl(city, country, visaType);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      return this.parseHTML(response.data, city, country, url);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);

      // Return empty result on error
      return {
        city,
        country,
        isAvailable: false,
        totalSlots: 0,
        totalDays: 0,
        slots: [],
        bookingLink: null,
        lastChecked: 'Error fetching data',
        checkedAt: new Date(),
        sourceUrl: url,
      };
    }
  }

  /**
   * Parse the HTML response to extract appointment data
   */
  private parseHTML(html: string, city: string, country: string, sourceUrl: string): UKAppointmentData {
    const result: UKAppointmentData = {
      city,
      country,
      isAvailable: false,
      totalSlots: 0,
      totalDays: 0,
      slots: [],
      bookingLink: null,
      lastChecked: '',
      checkedAt: new Date(),
      sourceUrl,
    };

    // Check for "No appointments available" message
    const noAppointmentMatch = html.match(/No appointments available/i);
    if (noAppointmentMatch) {
      result.isAvailable = false;

      // Try to get last checked time from "Last checked: X ago" text
      const checkedMatch = html.match(/Last\s+checked:\s*(\d+\s+(?:minutes?|hours?|days?|seconds?)\s+ago)/i);
      if (checkedMatch) {
        result.lastChecked = checkedMatch[1];
      } else {
        // Try alternative format: just "checked X ago"
        const altMatch = html.match(/checked\s*:?\s*(\d+\s+(?:minutes?|hours?|days?|seconds?)\s+ago)/i);
        if (altMatch) {
          result.lastChecked = altMatch[1];
        }
      }

      return result;
    }

    // Parse appointment summary: "X appointments available over Y days"
    const summaryMatch = html.match(/(\d+)\s+appointments?\s+available\s+over\s+(\d+)\s+days?/i);
    if (summaryMatch) {
      result.isAvailable = true;
      result.totalSlots = parseInt(summaryMatch[1], 10);
      result.totalDays = parseInt(summaryMatch[2], 10);
    }

    // Parse VFS booking link
    const bookingLinkMatch = html.match(/href="(https:\/\/visa\.vfsglobal\.com[^"]+)"/);
    if (bookingLinkMatch) {
      result.bookingLink = bookingLinkMatch[1];
    }

    // Parse individual appointment slots from table rows
    // Table structure: <tr><td>Date</td><td>Slots</td><td>Last seen</td></tr>
    const tableRowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<th[^>]*class="[^"]*text-nowrap[^"]*"[^>]*>([\s\S]*?)<\/th>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;

    // Alternative: simpler pattern for slot rows
    const slotRowPattern = /<th[^>]*class="[^"]*text-nowrap[^"]*"[^>]*>([^<]+)<\/th>[\s\S]*?(\d+)\s+slots?\s+available[\s\S]*?<span[^>]*class="[^"]*badge[^"]*"[^>]*>([^<]+)<\/span>/gi;

    let match;
    while ((match = slotRowPattern.exec(html)) !== null) {
      const date = match[1].trim();
      const slots = parseInt(match[2], 10);
      const lastSeen = match[3].trim();

      result.slots.push({
        date,
        slotsAvailable: slots,
        lastSeen,
      });
    }

    // If no slots parsed from pattern, try simpler approach
    if (result.slots.length === 0 && result.isAvailable) {
      // Look for date patterns followed by slot counts
      const simpleDatePattern = /(\d{1,2}\s+\w+\s+\(\w+\))[\s\S]*?(\d+)\s+slots?\s+available[\s\S]*?(\d+\s+(?:minutes?|hours?|days?)\s+ago)/gi;

      while ((match = simpleDatePattern.exec(html)) !== null) {
        result.slots.push({
          date: match[1].trim(),
          slotsAvailable: parseInt(match[2], 10),
          lastSeen: match[3].trim(),
        });
      }
    }

    // Get last checked time if we have slots (from source website's "Last Seen" column)
    if (result.slots.length > 0) {
      result.lastChecked = result.slots[0].lastSeen;
    }

    return result;
  }

  /**
   * Check multiple city/country combinations
   */
  async checkMultiple(
    checks: Array<{ city: string; country: string; visaType?: string }>
  ): Promise<UKAppointmentData[]> {
    const results: UKAppointmentData[] = [];

    for (const check of checks) {
      const result = await this.checkAvailability(
        check.city,
        check.country,
        check.visaType || 'tourism'
      );
      results.push(result);

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }
}

// Singleton instance
export const ukScraper = new UKAppointmentScraper();
