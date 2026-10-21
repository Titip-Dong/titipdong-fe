import { createUpload } from "@/api/generated/endpoints/upload/upload";
import type { CreateUploadRequestPurpose } from "@/api/generated/model";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Upload an allowed image using the backend-issued, short-lived SAS URL. */
export async function uploadImage(file: File, purpose: CreateUploadRequestPurpose) {
  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
    throw new Error("Pilih gambar JPG, PNG, atau WebP.");
  }
  if (file.size < 1 || file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const upload = await createUpload({
    purpose,
    contentType: file.type as (typeof IMAGE_TYPES)[number],
    sizeBytes: file.size,
  });
  const response = await fetch(upload.uploadUrl, {
    method: upload.uploadMethod,
    headers: upload.uploadHeaders,
    body: file,
  });
  if (!response.ok) throw new Error("Foto gagal diunggah. Coba lagi.");
  return upload.id;
}
