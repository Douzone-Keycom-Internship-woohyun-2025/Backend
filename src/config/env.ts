import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[ENV ERROR] ${name} 가 설정되지 않았습니다.`);
    process.exit(1);
  }
  return value;
}

export const DATABASE_URL = requireEnv("DATABASE_URL");
export const KIPRIS_KEY = requireEnv("KIPRIS_API_KEY");
export const KIPRIS_BASE = requireEnv("KIPRIS_BASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
