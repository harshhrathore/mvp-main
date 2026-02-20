import { pool } from "../config/db";
import { UserRow, AuthRow } from "../types";

// ── CREATE 
export const createUser = async (
  fullName: string,
  email: string,
  gender: string | null
): Promise<UserRow> => {
  const { rows } = await pool.query<any>(
    `INSERT INTO users (full_name, email, gender)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [fullName, email, gender]
  );
  const row = rows[0];
  return {
    id: row.user_id || row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    birth_date: row.birth_date,
    gender: row.gender,
    country: row.country,
    account_status: row.account_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

// Create the auth row right after the user row
export const createAuthRecord = async (userId: string, password_hash: string): Promise<AuthRow> => {
  const { rows } = await pool.query<any>(
    `INSERT INTO user_authentication (user_id, password_hash)
     VALUES ($1,$2)
     RETURNING *`,
    [userId, password_hash]
  );
  const row = rows[0];
  return {
    auth_id: row.auth_id,
    user_id: row.user_id,
    password_hash: row.password_hash,
    google_id: row.google_id,
    apple_id: row.apple_id,
    last_login_at: row.last_login_at,
    failed_attempts: row.failed_attempts,
    locked_until: row.locked_until
  };
};

// ── READ 
export const findUserByEmail = async (email: string): Promise<UserRow | undefined> => {
  const { rows } = await pool.query<any>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (!rows[0]) return undefined;
  const row = rows[0];
  return {
    id: row.user_id || row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    birth_date: row.birth_date,
    gender: row.gender,
    country: row.country,
    account_status: row.account_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

export const findUserById = async (userId: string): Promise<UserRow | undefined> => {
  const { rows } = await pool.query<any>(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) return undefined;
  const row = rows[0];
  return {
    id: row.user_id || row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    birth_date: row.birth_date,
    gender: row.gender,
    country: row.country,
    account_status: row.account_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

export const findAuthByUserId = async (userId: string): Promise<AuthRow | undefined> => {
  const { rows } = await pool.query<any>(
    `SELECT * FROM user_authentication WHERE user_id = $1`,
    [userId]
  );
  if (!rows[0]) return undefined;
  const row = rows[0];
  return {
    auth_id: row.auth_id,
    user_id: row.user_id,
    password_hash: row.password_hash,
    google_id: row.google_id,
    apple_id: row.apple_id,
    last_login_at: row.last_login_at,
    failed_attempts: row.failed_attempts,
    locked_until: row.locked_until
  };
};

// ── LOGIN TRACKING 
export const recordLoginSuccess = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE user_authentication
     SET last_login_at = CURRENT_TIMESTAMP, failed_attempts = 0, locked_until = NULL
     WHERE user_id = $1`,
    [userId]
  );
};

export const recordLoginFailure = async (userId: string): Promise<void> => {
  // Increment failed_attempts; if it hits 5 lock for 15 minutes
  await pool.query(
    `UPDATE user_authentication
     SET failed_attempts = failed_attempts + 1,
         locked_until = CASE
           WHEN failed_attempts + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
           ELSE locked_until
         END
     WHERE user_id = $1`,
    [userId]
  );
};

export const isAccountLocked = async (userId: string): Promise<boolean> => {
  const { rows } = await pool.query<{ locked: boolean }>(
    `SELECT (locked_until IS NOT NULL AND locked_until > CURRENT_TIMESTAMP) AS locked
     FROM user_authentication WHERE user_id = $1`,
    [userId]
  );
  return rows[0]?.locked ?? false;
};