import { pool } from "../config/db";

export const saveActivity = async (
  userId: string,
  type: string,
  name: string,
  before: number,
  after: number
) => {
  await pool.query(
    `INSERT INTO activities (user_id, activity_type, activity_name, mood_before, mood_after)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId, type, name, before, after]
  );
};
