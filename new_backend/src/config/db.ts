import "../loadEnv";
import { Pool } from "pg";
import { env } from "./env";

console.log("Initializing database pool with URL:", (env.databaseUrl() || "").substring(0, 50) + "...");

export const pool = new Pool({
  connectionString: env.databaseUrl(),
  

  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 5000,
  keepAlive: true,
  

  ssl: {
    rejectUnauthorized: false
  }
});


pool.on("connect", () => {
  console.log("Connected to Supabase (Transaction Pooler)");
});

pool.on("error", (err) => {
  console.error("Database pool error:", err);
});


export const dbHealthCheck = async (): Promise<boolean> => {
  try {
    const result = await pool.query("SELECT 1");
    return result.rowCount === 1;
  } catch (err) {
    console.error("[DB Health] Connection failed:", err);
    return false;
  }
};