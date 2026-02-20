import "../src/loadEnv"; // Load environment variables first
import { pool } from "../src/config/db";
import fs from "fs";
import path from "path";

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, "../src/database/migrations/add_notifications_table.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Running migration...");
        await pool.query(sql);
        console.log("Migration completed successfully.");
    } catch (error: any) {
        if (error.code === '42P07') {
            console.log("Table already exists, skipping migration.");
        } else {
            console.error("Migration failed:", error);
        }
    } finally {
        await pool.end();
    }
};

runMigration();
