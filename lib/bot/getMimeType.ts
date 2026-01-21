/**
 * Gets MIME type from file extension.
 * @param filePath - The file path with extension.
 * @returns The MIME type, or 'application/octet-stream' if unknown.
 */
const getMimeType = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    pdf: 'application/pdf',
    zip: 'application/zip',
  };
  return extension
    ? mimeTypes[extension] || 'application/octet-stream'
    : 'application/octet-stream';
};

export default getMimeType;
