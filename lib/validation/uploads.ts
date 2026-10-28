export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_SCAN_BYTES = 100 * 1024 * 1024;
export const MAX_RECORD_BYTES = 10 * 1024 * 1024;

export const uploadTypes = {
  intraoral_photo: { label: "Digital dental photograph", accept: ".jpg,.jpeg,.png,.webp", extensions: [".jpg", ".jpeg", ".png", ".webp"], maxBytes: MAX_IMAGE_BYTES },
  panoramic_xray: { label: "Panoramic radiograph", accept: ".dcm,.dicom,.jpg,.jpeg,.png,.tif,.tiff", extensions: [".dcm", ".dicom", ".jpg", ".jpeg", ".png", ".tif", ".tiff"], maxBytes: MAX_SCAN_BYTES },
  periapical_xray: { label: "Periapical radiograph", accept: ".dcm,.dicom,.jpg,.jpeg,.png,.tif,.tiff", extensions: [".dcm", ".dicom", ".jpg", ".jpeg", ".png", ".tif", ".tiff"], maxBytes: MAX_SCAN_BYTES },
  bitewing_xray: { label: "Bitewing radiograph", accept: ".dcm,.dicom,.jpg,.jpeg,.png,.tif,.tiff", extensions: [".dcm", ".dicom", ".jpg", ".jpeg", ".png", ".tif", ".tiff"], maxBytes: MAX_SCAN_BYTES },
  cbct: { label: "CBCT / DICOM study", accept: ".dcm,.dicom,.zip", extensions: [".dcm", ".dicom", ".zip"], maxBytes: MAX_SCAN_BYTES },
  intraoral_scan: { label: "Intraoral 3D scan", accept: ".stl,.ply,.obj,.zip", extensions: [".stl", ".ply", ".obj", ".zip"], maxBytes: MAX_SCAN_BYTES },
  clinical_record: { label: "Structured clinical record", accept: ".csv,.json", extensions: [".csv", ".json"], maxBytes: MAX_RECORD_BYTES },
  environmental_dataset: { label: "Environmental dataset", accept: ".csv,.json", extensions: [".csv", ".json"], maxBytes: MAX_RECORD_BYTES },
} as const;

export type UploadModality = keyof typeof uploadTypes;

const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".tif": "image/tiff", ".tiff": "image/tiff", ".dcm": "application/dicom", ".dicom": "application/dicom",
  ".zip": "application/zip", ".stl": "model/stl", ".ply": "model/ply", ".obj": "model/obj",
  ".csv": "text/csv", ".json": "application/json",
};

export function expectedMimeType(file: File): string {
  const lowerName = file.name.toLowerCase();
  const extension = Object.keys(mimeByExtension).find((item) => lowerName.endsWith(item));
  return extension ? mimeByExtension[extension] : "application/octet-stream";
}

export function validateUpload(file: File, modality: UploadModality): string | null {
  const spec = uploadTypes[modality];
  const lowerName = file.name.toLowerCase();
  if (!spec.extensions.some((extension) => lowerName.endsWith(extension))) {
    return `File extension not supported for ${spec.label}. Accepted: ${spec.accept}.`;
  }
  if (file.size <= 0) return "Empty files cannot be uploaded.";
  if (file.size > spec.maxBytes) {
    return `File exceeds the ${Math.round(spec.maxBytes / (1024 * 1024))} MB limit for ${spec.label}.`;
  }
  if (file.name.length > 255 || /[/\\\u0000-\u001f]/.test(file.name)) {
    return "Filename is invalid or too long.";
  }
  return null;
}
