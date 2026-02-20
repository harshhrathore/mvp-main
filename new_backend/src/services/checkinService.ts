import { pool } from "../config/db";

export const saveCheckin = async (
  userId: string,
  text: string,
  emotion: string,
  dosha: string,
  aiResponse: string
) => {
  await pool.query(
    `INSERT INTO checkins (user_id, text, emotion, dosha_state, ai_response)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId, text, emotion, dosha, aiResponse]
  );
};
