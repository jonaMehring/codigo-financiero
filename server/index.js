import express from "express";
import cors from "cors";
import mpRoutes from "./routes/mp.js";

const app = express();

const PORT = process.env.PORT || 3000;

// ✅ Lista blanca
const ALLOWED_ORIGINS = new Set([
  "https://codigo-financiero.integraprograma.com",
  "https://www.codigo-financiero.integraprograma.com",
]);

// ✅ CORS con función (más confiable)
const corsOptions = {
  origin: (origin, cb) => {
    // origin puede venir undefined en health checks / curl
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ CORS primero
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Body parsers ANTES de rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== health =====
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ Rutas MercadoPago
app.use("/api/mp", mpRoutes);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
