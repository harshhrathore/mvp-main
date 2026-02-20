// Script to run SAMA Chat Integration migration
import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/db";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  console.log("🔄 Running SAMA Chat Integration migration...\n");

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../database/migrations/add_sama_chat_preferences.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Execute the migration
    await pool.query(migrationSQL);

    console.log("✅ Migration completed successfully!");
    console.log("\nVerifying columns...");

    // Verify the columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_preferences' 
      AND column_name IN ('emotional_attachment', 'voice_gender')
      ORDER BY column_name
    `);

    console.log("\nColumns in user_preferences:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });

    // Verify constraint
    const constraintResult = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conname = 'chk_emotional_attachment'
    `);

    if (constraintResult.rows.length > 0) {
      console.log("\n✅ Constraint 'chk_emotional_attachment' exists");
    } else {
      console.log("\n⚠️  Constraint 'chk_emotional_attachment' not found");
    }

  } catch (err) {
    console.error("\n❌ Migration failed:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
