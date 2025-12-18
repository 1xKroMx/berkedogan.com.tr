import { neon } from "@neondatabase/serverless";

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    const error = new Error("DATABASE_URL is not set");
    error.code = "MISSING_DATABASE_URL";
    throw error;
  }

  return neon(databaseUrl);
}

export function logDbError(error) {
  console.error("DB Error", {
    name: error?.name,
    code: error?.code,
    message: error?.message,
  });
}
