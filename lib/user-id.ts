/**
 * Kullanıcı ID Yönetimi
 * localStorage'da UUID saklar ve yönetir
 */

const USER_ID_KEY = 'schengen_bot_user_id';

/**
 * Geçerli UUID formatı kontrolü
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Yeni UUID oluştur
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Kullanıcı ID'sini al veya oluştur
 * localStorage'da saklar
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: rastgele UUID döndür (geçici)
    return generateUUID();
  }

  try {
    // localStorage'dan al
    const storedId = localStorage.getItem(USER_ID_KEY);
    
    if (storedId && isValidUUID(storedId)) {
      return storedId;
    }

    // Geçersiz veya yoksa yeni oluştur
    const newId = generateUUID();
    localStorage.setItem(USER_ID_KEY, newId);
    return newId;
  } catch (error) {
    // localStorage hatası: yeni UUID oluştur
    console.warn('localStorage error, generating new UUID:', error);
    return generateUUID();
  }
}

/**
 * Kullanıcı ID'sini al (oluşturmaz)
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedId = localStorage.getItem(USER_ID_KEY);
    return storedId && isValidUUID(storedId) ? storedId : null;
  } catch {
    return null;
  }
}

/**
 * Kullanıcı ID'sini temizle
 */
export function clearUserId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear user ID:', error);
  }
}

