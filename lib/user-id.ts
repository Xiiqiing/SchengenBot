/**
 * User ID Management
 * Stores and manages UUID in localStorage
 */

const USER_ID_KEY = 'schengen_bot_user_id';

/**
 * Check for valid UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate new UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Set User ID (After Login)
 */
export function setUserId(id: string): void {
  if (typeof window === 'undefined') return;

  if (isValidUUID(id)) {
    localStorage.setItem(USER_ID_KEY, id);
  }
}

/**
 * Get or create User ID
 * Stores in localStorage
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return random UUID (temporary)
    return generateUUID();
  }

  try {
    // Get from localStorage
    const storedId = localStorage.getItem(USER_ID_KEY);

    if (storedId && isValidUUID(storedId)) {
      return storedId;
    }

    // Create new if invalid or missing
    const newId = generateUUID();
    localStorage.setItem(USER_ID_KEY, newId);
    return newId;
  } catch (error) {
    // localStorage error: generate new UUID
    console.warn('localStorage error, generating new UUID:', error);
    return generateUUID();
  }
}

/**
 * Get User ID (Does not create)
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
 * Clear User ID
 */
export function clearUserId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear user ID:', error);
  }
}
