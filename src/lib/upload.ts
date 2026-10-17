import { createUpload } from "@/api/generated/endpoints/upload/upload";
import {
  CreateUploadRequestContentType,
  type CreateUploadRequestPurpose,
} from "@/api/generated/model";

export const IMAGE_TYPES: readonly string[] = Object.values(CreateUploadRequestContentType);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Indonesian message when the file cannot be uploaded, or null when it can. */
export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Pilih foto JPG, PNG, atau WebP, ya.";
  if (file.size > MAX_IMAGE_BYTES)
    return "Fotonya lebih dari 5 MB. Pilih foto yang lebih kecil, ya.";
  return null;
}

/**
 * Uploads an image straight to Blob Storage and returns the upload ID to send to the endpoint that uses it.
 * The PUT goes through XMLHttpRequest (fetch cannot report upload progress) and carries no bearer token.
 */
export async function uploadImage(
  file: File,
  purpose: CreateUploadRequestPurpose,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const upload = await createUpload({
    purpose,
    contentType: file.type as CreateUploadRequestContentType,
    sizeBytes: file.size,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(upload.uploadMethod, upload.uploadUrl);
    for (const [name, value] of Object.entries(upload.uploadHeaders)) {
      xhr.setRequestHeader(name, value);
    }
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed with ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });

  return upload.id;
}
