// The developer's public key (SPKI, Base64 encoded).
// This key is used to verify that the license key was issued by the developer.
// The corresponding private key must be kept secret by the developer and used to sign the user's installationId.
const DEVELOPER_PUBLIC_KEY_B64 = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGNlar/bBXciynvW0XVg/a3XIdlPif1o3Wsv9ioAiCmvlhARPDBew/5ordPfmNPKqZPRA1U0oBu4VVd7f97tegg==';
let developerPublicKey: CryptoKey | null = null;

// Function to get the installation ID
export const getInstallationId = (): string => {
  let id = localStorage.getItem('installationId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('installationId', id);
  }
  return id;
};

// Helper to convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

const getDeveloperPublicKey = async (): Promise<CryptoKey> => {
    if (developerPublicKey) {
        return developerPublicKey;
    }
    const keyBuffer = base64ToArrayBuffer(DEVELOPER_PUBLIC_KEY_B64);
    developerPublicKey = await window.crypto.subtle.importKey(
        'spki',
        keyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
    );
    return developerPublicKey;
};


// Function to verify the license key (signature)
export const verifyLicense = async (
    licenseKey: string, // Base64 signature
    installationId: string
): Promise<boolean> => {
    try {
        const publicKey = await getDeveloperPublicKey();
        const signature = base64ToArrayBuffer(licenseKey);
        const data = new TextEncoder().encode(installationId);
        
        return await window.crypto.subtle.verify(
            {
                name: 'ECDSA',
                hash: { name: 'SHA-256' },
            },
            publicKey,
            signature,
            data
        );
    } catch (e) {
        console.error('Verification error:', e);
        return false;
    }
};
