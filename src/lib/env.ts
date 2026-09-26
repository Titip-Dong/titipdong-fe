import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.url(),
  VITE_MIDTRANS_CLIENT_KEY: z.string().min(1),
  VITE_MIDTRANS_SNAP_URL: z.url(),
});

export const env = schema.parse(import.meta.env);
