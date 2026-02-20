import { pool } from "../config/db";
import { OnboardingRow, HealthBaseline } from "../types";

export const createOnboarding = async (userId: string): Promise<OnboardingRow> => {
  const { rows } = await pool.query<OnboardingRow>(
    `INSERT INTO user_onboarding (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );
  return rows[0];
};

export const getOnboarding = async (userId: string): Promise<OnboardingRow | undefined> => {
  const { rows } = await pool.query<OnboardingRow>(
    `SELECT * FROM user_onboarding WHERE user_id = $1`,
    [userId]
  );
  return rows[0];
};

export const saveHealthBaseline = async (
  userId: string,
  baseline: HealthBaseline
): Promise<OnboardingRow> => {
  const { rows } = await pool.query<OnboardingRow>(
    `UPDATE user_onboarding
     SET health_baseline = $1, step_1_done = TRUE
     WHERE user_id = $2
     RETURNING *`,
    [JSON.stringify(baseline), userId]
  );
  return rows[0];
};

export const markStep2Done = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE user_onboarding SET step_2_done = TRUE WHERE user_id = $1`,
    [userId]
  );
};

export const markStep3Done = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE user_onboarding SET step_3_done = TRUE WHERE user_id = $1`,
    [userId]
  );
};