import express from "express";
import cors from "cors";

const app = express();

// CORS CONFIG
app.use(cors({
  origin: [
    "https://codigo-financiero.integraprograma.com",
    "https://www.codigo-financiero.integraprograma.com"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());


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
      // webhook a Koyeb
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

    // ✅ luego: guardar en DB / enviar email / generar link tokenizado
    return res.sendStatus(200);
  } catch (e) {
    console.error("webhook error:", e);
    return res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
