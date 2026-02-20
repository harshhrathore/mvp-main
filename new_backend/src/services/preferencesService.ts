import { pool } from "../config/db";

export interface UserPreferences {
  pref_id: string;
  user_id: string;
  nickname: string | null;
  voice_gender: string;
  speaking_speed: string;
  background_sounds: boolean;
  preferred_language: string;
  morning_reminder: boolean;
  evening_checkin: boolean;
  learning_level: string;
  data_for_research: boolean;
  emotional_attachment: number;
}

/**
 * Get user preferences (creates default if doesn't exist)
 */
export const getPreferences = async (userId: string): Promise<UserPreferences> => {
  let { rows } = await pool.query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [userId]
  );

  // If no preferences exist, create defaults
  if (rows.length === 0) {
    const { rows: newRows } = await pool.query(
      `INSERT INTO user_preferences (user_id)
       VALUES ($1)
       RETURNING *`,
      [userId]
    );
    return newRows[0];
  }

  return rows[0];
};

/**
 * Update user preferences (partial update)
 */
export const updatePreferences = async (
  userId: string,
  updates: Partial<Omit<UserPreferences, "pref_id" | "user_id">>
): Promise<UserPreferences> => {
  // Build dynamic SET clause
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ");

  const { rows } = await pool.query(
    `UPDATE user_preferences
     SET ${setClause}
     WHERE user_id = $1
     RETURNING *`,
    [userId, ...values]
  );

  if (rows.length === 0) {
    // Preferences don't exist yet — create with updates
    const { rows: newRows } = await pool.query(
      `INSERT INTO user_preferences (user_id, ${fields.join(", ")})
       VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(", ")})
       RETURNING *`,
      [userId, ...values]
    );
    return newRows[0];
  }

  return rows[0];
};

/**
 * Reset preferences to defaults
 */
export const resetPreferences = async (userId: string): Promise<UserPreferences> => {
  const { rows } = await pool.query(
    `UPDATE user_preferences
     SET voice_gender = 'female',
         speaking_speed = 'normal',
         background_sounds = TRUE,
         preferred_language = 'English',
         morning_reminder = TRUE,
         evening_checkin = TRUE,
         learning_level = 'beginner',
         data_for_research = FALSE,
         emotional_attachment = 7
     WHERE user_id = $1
     RETURNING *`,
    [userId]
  );
  return rows[0];
};

/**
 * Update user's voice gender preference
 */
export const updateVoiceGender = async (
  userId: string,
  gender: 'male' | 'female'
): Promise<UserPreferences> => {
  return updatePreferences(userId, { voice_gender: gender });
};

/**
 * Update user's emotional attachment level (1-10)
 */
export const updateEmotionalAttachment = async (
  userId: string,
  level: number
): Promise<UserPreferences> => {
  // Validate level is within range
  if (level < 1 || level > 10) {
    throw new Error("Emotional attachment level must be between 1 and 10");
  }
  
  return updatePreferences(userId, { emotional_attachment: level });
};
