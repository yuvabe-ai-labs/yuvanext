import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url("Must be a valid URL"),
  VITE_STAGE_TYPE: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
