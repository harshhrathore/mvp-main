import { pool } from "../config/db";
import { StreakRow } from "../types";
import { todayIST } from "../utils/helpers";

export const updateStreak = async (userId: string): Promise<StreakRow> => {
  const today = todayIST(); 

  
  const { rows } = await pool.query<StreakRow>(
    `SELECT * FROM user_streaks WHERE user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    // First-time insert
    const { rows: newRows } = await pool.query<StreakRow>(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
       VALUES ($1, 1, 1, $2)
       RETURNING *`,
      [userId, today]
    );
    return newRows[0];
  }

  const streak = rows[0];

  // If last_active_date is already today, nothing to do
  if (streak.last_active_date === today) {
    return streak;
  }

  // Calculate day diff using plain date strings (no timezone )
  const lastDate = new Date(streak.last_active_date + "T00:00:00");
  const todayDate = new Date(today + "T00:00:00");
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86_400_000);

  let newStreak: number;
  if (diffDays === 1) {
    newStreak = streak.current_streak + 1;   // consecutive day
  } else {
    newStreak = 1;                           // gap — reset
  }

  const longest = Math.max(newStreak, streak.longest_streak);

  const { rows: updated } = await pool.query<StreakRow>(
    `UPDATE user_streaks
     SET current_streak = $1, longest_streak = $2, last_active_date = $3
     WHERE user_id = $4
     RETURNING *`,
    [newStreak, longest, today, userId]
  );
  return updated[0];
};

export const getStreak = async (userId: string): Promise<StreakRow | undefined> => {
  const { rows } = await pool.query<StreakRow>(
    `SELECT * FROM user_streaks WHERE user_id = $1`,
    [userId]
  );
  return rows[0];
};