const CLOUD_NAME = import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"];
const UPLOAD_PRESET = import.meta.env["VITE_CLOUDINARY_UPLOAD_PRESET"];

// Caps dimensions and auto-picks format/quality so every image we serve is
// small regardless of what was uploaded, without needing an incoming
// transformation configured on the upload preset itself.
const DELIVERY_TRANSFORM = "c_limit,w_1600,h_1600,q_auto,f_auto";

function withDeliveryTransform(url: string): string {
  return url.replace("/upload/", `/upload/${DELIVERY_TRANSFORM}/`);
}

// Uploads straight from the browser to Cloudinary using an unsigned upload
// preset — no backend round-trip for the file itself, just the resulting
// (transformed) URL gets saved to our DB.
export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Image upload isn't configured yet. Contact support.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error && data.error.message) || "Image upload failed. Please try again.");
  }
  return withDeliveryTransform(data.secure_url as string);
}
