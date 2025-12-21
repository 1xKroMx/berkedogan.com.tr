import { neon } from "@neondatabase/serverless";

function pickDatabaseUrl() {
  return (
    process.env.DATABASE_URL_APP ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED
  );
}

export function getSql() {
  const databaseUrl = pickDatabaseUrl();
  if (!databaseUrl) {
    const error = new Error(
      "Database URL is not set (set DATABASE_URL_APP or DATABASE_URL)"
    );
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
