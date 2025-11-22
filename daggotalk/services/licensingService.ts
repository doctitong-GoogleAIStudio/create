
const DB_NAME = 'DoggoTalkDB';
const DB_VERSION = 1;
const KEY_STORE_NAME = 'cryptoKeys';
const INSTALL_ID_KEY = 'installId';
const LICENSE_KEY = 'appLicense';
const DAILY_USAGE_KEY = 'dailyUsage';
const MAX_FREE_TRANSLATIONS = 5;

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME, { keyPath: 'name' });
      }
    };
  });
}

// Helper to get a value from a store
async function getFromDB(storeName: string, key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Helper to put a value into a store
async function putInDB(storeName: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Get or create a persistent installation ID
function getOrCreateInstallId(): string {
  let installId = localStorage.getItem(INSTALL_ID_KEY);
  if (!installId) {
    installId = crypto.randomUUID();
    localStorage.setItem(INSTALL_ID_KEY, installId);
  }
  return installId;
}

// Generate a new key pair
async function generateKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true, // not extractable, but required to be true for storing in IndexedDB
    ['sign', 'verify']
  );
}

// Get or create the key pair
async function getOrCreateKeyPair(): Promise<CryptoKeyPair> {
  const storedKeys = await getFromDB(KEY_STORE_NAME, 'signingKey');
  if (storedKeys) {
    return storedKeys.keyPair;
  }
  const keyPair = await generateKeyPair();
  await putInDB(KEY_STORE_NAME, { name: 'signingKey', keyPair });
  return keyPair;
}

// Export public key to a string format (JWK stringified)
async function exportPublicKey(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk);
}

// Helper to create a digest (hash)
async function digest(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- License Verification ---
async function verifyLicense(publicKey: CryptoKey): Promise<boolean> {
  const licenseBlobStr = localStorage.getItem(LICENSE_KEY);
  if (!licenseBlobStr) {
    return false;
  }
  
  try {
    const { licenseData, signature } = JSON.parse(licenseBlobStr);
    
    if (new Date(licenseData.expiresAt) < new Date()) {
      console.error("License has expired.");
      return false;
    }
    
    const publicKeyJwkStr = await exportPublicKey(publicKey);
    const dataThatWasSigned = JSON.stringify(licenseData) + publicKeyJwkStr;
    const expectedSignature = await digest(dataThatWasSigned);

    if (signature !== expectedSignature) {
        console.error("License signature is invalid. Tampering detected?");
        return false;
    }

    const installId = getOrCreateInstallId();
    if (licenseData.installId !== installId) {
        console.error("License is for a different installation.");
        return false;
    }

    return true;

  } catch (error) {
    console.error("Failed to parse or verify license:", error);
    return false;
  }
}

// --- Public API ---

/**
 * Checks if a valid, unexpired license is present in storage.
 */
export async function verifyStoredLicense(): Promise<boolean> {
    try {
        const keyPair = await getOrCreateKeyPair();
        return await verifyLicense(keyPair.publicKey);
    } catch (error) {
        console.error("Could not verify license:", error);
        return false;
    }
}

/**
 * Attempts to activate the application with a given license string.
 * @param licenseString The license blob provided by the admin.
 * @returns True if activation is successful, otherwise false.
 */
export async function activateLicense(licenseString: string): Promise<boolean> {
    if (!licenseString || typeof licenseString !== 'string') {
        console.error("Invalid license string provided.");
        return false;
    }
    localStorage.setItem(LICENSE_KEY, licenseString);
    return await verifyStoredLicense();
}

/**
 * Retrieves the installation-specific data needed to generate a license.
 */
export async function getInstallData(): Promise<{ installId: string; publicKeyJwkStr: string; }> {
    const installId = getOrCreateInstallId();
    const keyPair = await getOrCreateKeyPair();
    const publicKeyJwkStr = await exportPublicKey(keyPair.publicKey);
    return { installId, publicKeyJwkStr };
}

// --- Daily Usage Tracking ---

interface DailyUsageData {
  date: string; // YYYY-MM-DD format
  count: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getDailyUsage(): DailyUsageData {
  try {
    const stored = localStorage.getItem(DAILY_USAGE_KEY);
    if (stored) {
      const usage: DailyUsageData = JSON.parse(stored);
      const today = getTodayDateString();

      // Reset count if it's a new day
      if (usage.date !== today) {
        return { date: today, count: 0 };
      }

      return usage;
    }

    return { date: getTodayDateString(), count: 0 };
  } catch (error) {
    console.error('Error reading daily usage:', error);
    return { date: getTodayDateString(), count: 0 };
  }
}

export function incrementDailyUsage(): number {
  try {
    const usage = getDailyUsage();
    usage.count += 1;
    localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(usage));
    return usage.count;
  } catch (error) {
    console.error('Error incrementing daily usage:', error);
    return 0;
  }
}

export function canTranslate(isPremium: boolean): { canTranslate: boolean; remainingUsage: number } {
  if (isPremium) {
    return { canTranslate: true, remainingUsage: -1 }; // Unlimited for premium
  }

  const usage = getDailyUsage();
  const remaining = Math.max(0, MAX_FREE_TRANSLATIONS - usage.count);

  return {
    canTranslate: remaining > 0,
    remainingUsage: remaining
  };
}

export function getRemainingUsage(isPremium: boolean): number {
  if (isPremium) {
    return -1; // Unlimited
  }

  const usage = getDailyUsage();
  return Math.max(0, MAX_FREE_TRANSLATIONS - usage.count);
}

export function resetDailyUsage(): void {
  localStorage.removeItem(DAILY_USAGE_KEY);
}

// --- Enhanced License Verification with Daily Usage ---

export interface LicenseInfo {
  isValid: boolean;
  isPremium: boolean;
  installationId: string;
  expiryDate?: string;
  remainingUsage: number;
}

export async function getLicenseInfo(): Promise<LicenseInfo> {
  try {
    const isPremium = await verifyStoredLicense();
    const installId = getOrCreateInstallId();
    const remainingUsage = getRemainingUsage(isPremium);

    // Get expiry date from stored license if available
    let expiryDate: string | undefined;
    const licenseBlobStr = localStorage.getItem(LICENSE_KEY);
    if (licenseBlobStr) {
      try {
        const { licenseData } = JSON.parse(licenseBlobStr);
        expiryDate = licenseData.expiresAt;
      } catch (error) {
        console.error('Error parsing license for expiry date:', error);
      }
    }

    return {
      isValid: true,
      isPremium,
      installationId: installId,
      expiryDate,
      remainingUsage
    };
  } catch (error) {
    console.error('Error getting license info:', error);
    return {
      isValid: false,
      isPremium: false,
      installationId: getOrCreateInstallId(),
      remainingUsage: getRemainingUsage(false)
    };
  }
}

/**
 * Generates a license blob. (For admin use)
 * @param installId The user's installation ID.
 * @param publicKeyJwkStr The user's public key as a JWK string.
 * @returns A license string to be given to the user.
 */
export async function generateLicense(installId: string, publicKeyJwkStr: string): Promise<string> {
  console.log("Generating license for install ID:", installId);

  const licenseData = {
    installId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year license
    type: 'premium',
  };

  const dataToSign = JSON.stringify(licenseData) + publicKeyJwkStr;
  const signature = await digest(dataToSign);

  const licenseBlob = {
    licenseData,
    signature,
  };

  return JSON.stringify(licenseBlob, null, 2);
}