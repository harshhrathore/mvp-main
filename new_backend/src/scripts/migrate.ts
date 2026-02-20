// Migration Script: Migrate data from old schema to new schema

import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/db";

async function migrate() {
  console.log("🔄 Starting migration from old to new schema...\n");

  try {
    // ─── 1. Backup old data ──────────────────────────────────
    console.log("📦 Backing up existing data...");
    
    const oldUsers = await pool.query(`SELECT * FROM users`);
    const oldCheckins = await pool.query(`SELECT * FROM checkins`).catch(() => ({ rows: [] }));
    const oldQuizResults = await pool.query(`SELECT * FROM quiz_results`).catch(() => ({ rows: [] }));
    const oldStreaks = await pool.query(`SELECT * FROM user_streaks`).catch(() => ({ rows: [] }));

    console.log(`  ✓ Backed up ${oldUsers.rows.length} users`);
    console.log(`  ✓ Backed up ${oldCheckins.rows.length} check-ins`);
    console.log(`  ✓ Backed up ${oldQuizResults.rows.length} quiz results`);
    console.log(`  ✓ Backed up ${oldStreaks.rows.length} streaks\n`);

    // ─── 2. Drop old tables ──────────────────────────────────
    console.log("🗑️  Dropping old tables...");
    
    await pool.query(`DROP TABLE IF EXISTS 
      quiz_options, quiz_questions, quiz_results, 
      activities, checkins, recommendations CASCADE`);
    
    console.log("  ✓ Old tables dropped\n");

    // ─── 3. Create new tables ────────────────────────────────
    console.log("🏗️  Creating new schema...");
    
    // Read and execute schema.sql
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log("  ✓ New schema created\n");

    // ─── 4. Migrate data ─────────────────────────────────────
    console.log("📥 Migrating data to new schema...");

    // Migrate users (enhanced structure)
    for (const user of oldUsers.rows) {
      await pool.query(
        `INSERT INTO users (id, email, full_name, password_hash, gender, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, user.name, user.password, user.gender, user.created_at]
      );

      // Create auth record
      await pool.query(
        `INSERT INTO user_authentication (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      // Create onboarding record
      await pool.query(
        `INSERT INTO user_onboarding (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );
    }
    console.log(`  ✓ Migrated ${oldUsers.rows.length} users`);

    // Migrate quiz results → dosha_assessment
    for (const result of oldQuizResults.rows) {
      const scores = {
        vata: result.vata_score || 0,
        pitta: result.pitta_score || 0,
        kapha: result.kapha_score || 0,
      };
      
      await pool.query(
        `INSERT INTO dosha_assessment 
         (user_id, assessment_type, responses, prakriti_scores, primary_dosha, 
          secondary_dosha, confidence_score, completed_at)
         VALUES ($1, 'initial', '[]'::jsonb, $2, $3, $4, 0.75, $5)`,
        [
          result.user_id,
          JSON.stringify(scores),
          result.profile_type || 'Vata',
          'Pitta',
          result.created_at,
        ]
      );

      // Mark onboarding step 3 done
      await pool.query(
        `UPDATE user_onboarding SET step_3_done = TRUE WHERE user_id = $1`,
        [result.user_id]
      );
    }
    console.log(`  ✓ Migrated ${oldQuizResults.rows.length} quiz results`);

    // Migrate streaks
    for (const streak of oldStreaks.rows) {
      await pool.query(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           current_streak = EXCLUDED.current_streak,
           longest_streak = EXCLUDED.longest_streak,
           last_active_date = EXCLUDED.last_active_date`,
        [streak.user_id, streak.current_streak, streak.longest_streak, streak.last_active_date]
      );
    }
    console.log(`  ✓ Migrated ${oldStreaks.rows.length} streaks`);

    // Note: Old check-ins and activities are not migrated as they don't map cleanly
    // to the new conversation_messages structure. Fresh start for conversations.

    console.log("\n Migration complete!");
    console.log("\n  Note: Old check-ins and activities were not migrated.");
    console.log("   Users will start fresh with the new conversation system.");

  } catch (err) {
    console.error("\n Migration failed:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run migration
migrate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});