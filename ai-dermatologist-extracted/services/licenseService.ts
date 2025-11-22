// Function to get the installation ID. It remains a unique identifier for the device.
export const getInstallationId = (): string => {
  let id = localStorage.getItem('installationId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('installationId', id);
  }
  return id;
};

// Function to verify the license key against the installation ID using the new formula.
export const verifyLicense = (
    licenseKey: string,
    installationId: string
): boolean => {
    try {
        // Encode the user's installation ID to Base64
        const base64Id = btoa(installationId);
        // Construct the expected license key format
        const expectedKey = `AI-DERMATOLOGIST-${base64Id}-ACTIVATED`;
        
        // Check if the provided key matches the expected format
        return licenseKey === expectedKey;
    } catch (e) {
        console.error('License verification error:', e);
        return false;
    }
};
