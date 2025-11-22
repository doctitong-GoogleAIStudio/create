/**
 * Converts a File object to its base64 representation.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            // result is in format "data:image/jpeg;base64,LzlqLzRBQ...". We only want the part after the comma.
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as data URL.'));
        }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a base64 string to a data URL.
 * @param base64 The base64 string.
 * @param mimeType The MIME type of the data.
 * @returns The data URL string.
 */
export const base64ToDataUrl = (base64: string, mimeType: string): string => {
    return `data:${mimeType};base64,${base64}`;
}
