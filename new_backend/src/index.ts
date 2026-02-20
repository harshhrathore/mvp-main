import "./loadEnv";
import express from "express";
import cors from "cors";
import { ensureEnv } from "./config/env";
import { pool } from "./config/db";
ensureEnv(); 

// ── middleware
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

// ── routes 
import healthRoutes         from "./routes/healthRoutes";
import authRoutes           from "./routes/authRoutes";
import onboardingRoutes     from "./routes/onboardingRoutes";
import doshaRoutes          from "./routes/doshaRoutes";
import chatRoutes           from "./routes/chatRoutes";
import checkinRoutes        from "./routes/checkinRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import voiceRoutes          from "./routes/voiceRoutes";         
import analyticsRoutes      from "./routes/analyticsRoutes";      
import preferencesRoutes    from "./routes/preferencesRoutes";
import dashboardRoutes      from "./routes/dashboardRoutes";    


const app = express();

// CORS 
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || []
        : true,                   
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));  
app.use(globalLimiter);                     


app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/dosha", doshaRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/voice", voiceRoutes);          
app.use("/api/analytics", analyticsRoutes);      
app.use("/api/preferences", preferencesRoutes);
app.use("/api/dashboard", dashboardRoutes);    


app.use(errorHandler);

// Test DB connection separately (non-blocking, don't block server startup)
setTimeout(() => {
  pool.query("SELECT 1")
    .then(() => console.log("✅ Database connection successful!"))
    .catch((err: any) => console.error("❌ Database failed:", err.message));
}, 100);

const PORT: number = (Number(process.env.PORT) || 5000) as number;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 SAMAA backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", err);
    process.exit(1);
  }
});

export default app;