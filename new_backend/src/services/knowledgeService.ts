import { pool } from "../config/db";
import { KnowledgeRow } from "../types";

interface SearchParams {
  emotion: string;
  dosha: string;         // "Vata" | "Pitta" | "Kapha"
  timeOfDay?: string;    // "morning" | "afternoon" | "evening" | "night"
  limit?: number;
}

// ── SEARCH KNOWLEDGE BASE
export const searchKnowledge = async (params: SearchParams): Promise<KnowledgeRow[]> => {
  const { emotion, dosha, timeOfDay, limit = 3 } = params;

  const { rows } = await pool.query<KnowledgeRow & { _score: number }>(
    `SELECT *,
       (CASE WHEN $1 = ANY(balances_doshas) THEN 3 ELSE 0 END +
        CASE WHEN $2 = ANY(helps_with_emotions) THEN 2 ELSE 0 END +
        CASE WHEN best_time_of_day = $3 OR best_time_of_day = 'any' THEN 1 ELSE 0 END
       ) AS _score
     FROM ayurveda_knowledge
     WHERE ($1 = ANY(balances_doshas) OR $2 = ANY(helps_with_emotions))
     ORDER BY _score DESC, times_recommended DESC
     LIMIT $4`,
    [dosha, emotion, timeOfDay || "any", limit]
  );

  return rows;
};

// ── GET BY ID 
export const getKnowledgeById = async (knowledgeId: string): Promise<KnowledgeRow | undefined> => {
  const { rows } = await pool.query<KnowledgeRow>(
    `SELECT * FROM ayurveda_knowledge WHERE knowledge_id = $1`,
    [knowledgeId]
  );
  return rows[0];
};

// ── INCREMENT times_recommended counter 
export const incrementRecommendCount = async (knowledgeId: string): Promise<void> => {
  await pool.query(
    `UPDATE ayurveda_knowledge SET times_recommended = times_recommended + 1 WHERE knowledge_id = $1`,
    [knowledgeId]
  );
};