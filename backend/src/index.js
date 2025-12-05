import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, disconnectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import kelasRoutes from "./routes/kelas.js";
import siswaRoutes from "./routes/siswa.js";
import nilaiRoutes from "./routes/nilai.js";
import bobotNilaiRoutes from "./routes/bobotnilai.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (for uploaded images)
app.use('/uploads', express.static('uploads'));

app.get("/api", (req, res) => {
  res.json({ message: "Rapor Digital API - Backend Ready" });
});

// Public routes (no authentication required)
app.use("/api/auth", authRoutes);

// Protected routes (authentication required)
app.use("/api/kelas", authMiddleware, kelasRoutes);
app.use("/api/siswa", authMiddleware, siswaRoutes);
app.use("/api/nilai", authMiddleware, nilaiRoutes);
app.use("/api/bobot-nilai", authMiddleware, bobotNilaiRoutes);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(5000, () => console.log("✅ Backend on port 5000"));
});
