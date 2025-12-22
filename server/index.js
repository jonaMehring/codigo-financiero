import express from "express";
import cors from "cors";
import mpRoutes from "./routes/mp.js";

const app = express();

// ✅ PORT para Koyeb (Koyeb setea process.env.PORT)
const PORT = process.env.PORT || 3000;

// ✅ CORS (IMPORTANTE: antes de rutas)
const ALLOWED_ORIGINS = new Set([
  "https://codigo-financiero.integraprograma.com",
  "https://www.codigo-financiero.integraprograma.com",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite llamadas sin Origin (server-to-server, health checks, etc.)
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);

      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ✅ Responder preflight para TODO
app.options("*", cors());

app.use(express.json());

app.use("/api/mp", mpRoutes);

// ===== health =====
app.get("/health", (req, res) => res.json({ ok: true }));

// ===== Mercado Pago: create preference =====
app.post("/api/mp/create-preference", async (req, res) => {
  try {
    const FRONT_URL = process.env.FRONT_URL; // https://codigo-financiero.integraprograma.com
    const API_URL = process.env.API_URL;     // https://TU-APP.koyeb.app
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!FRONT_URL || !API_URL || !ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        required: ["FRONT_URL", "API_URL", "MP_ACCESS_TOKEN"],
        current: {
          FRONT_URL: !!FRONT_URL,
          API_URL: !!API_URL,
          MP_ACCESS_TOKEN: !!ACCESS_TOKEN,
        },
      });
    }

    const body = {
      items: [
        {
          title: "Código Financiero - Ebook",
          quantity: 1,
          currency_id: "USD",
          unit_price: 10,
        },
      ],
      back_urls: {
        success: `${FRONT_URL}/gracias`,
        pending: `${FRONT_URL}/gracias`,
        failure: `${FRONT_URL}/gracias`,
      },
      auto_return: "approved",
      notification_url: `${API_URL}/api/mp/webhook`,
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const pref = await r.json();

    if (!r.ok) {
      return res.status(400).json({ error: "MP error", mp: pref });
    }

    if (!pref?.init_point) {
      return res.status(400).json({ error: "No init_point", pref });
    }

    return res.json({ init_point: pref.init_point, preference_id: pref.id });
  } catch (e) {
    console.error("create-preference error:", e);
    return res.status(500).json({ error: "Error create-preference" });
  }
});

// ===== Mercado Pago: webhook =====
app.post("/api/mp/webhook", async (req, res) => {
  try {
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    const dataId = req.query["data.id"] || req.body?.data?.id;
    if (!dataId) return res.sendStatus(200);

    const pr = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    const payment = await pr.json();

    console.log("MP payment:", {
      id: payment?.id,
      status: payment?.status,
      status_detail: payment?.status_detail,
      payer_email: payment?.payer?.email,
      date_approved: payment?.date_approved,
      transaction_amount: payment?.transaction_amount,
    });

    return res.sendStatus(200);
  } catch (e) {
    console.error("webhook error:", e);
    return res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
