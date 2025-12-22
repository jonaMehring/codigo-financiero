// server/routes/mp.js
import express from "express";

const router = express.Router();

// Helpers
const requiredEnv = (name) => {
  const v = process.env[name];
  return v && String(v).trim().length ? v.trim() : null;
};

router.post("/create-preference", async (req, res) => {
  try {
    const FRONT_URL = requiredEnv("FRONT_URL");         // https://codigo-financiero.integraprograma.com
    const API_URL = requiredEnv("API_URL");             // https://TU-APP.koyeb.app
    const ACCESS_TOKEN = requiredEnv("MP_ACCESS_TOKEN");

    if (!FRONT_URL || !API_URL || !ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        required: ["FRONT_URL", "API_URL", "MP_ACCESS_TOKEN"],
        received: {
          FRONT_URL: !!FRONT_URL,
          API_URL: !!API_URL,
          MP_ACCESS_TOKEN: !!ACCESS_TOKEN,
        },
      });
    }

    // (Opcional) validar que sea https
    // if (!FRONT_URL.startsWith("https://") || !API_URL.startsWith("https://")) { ... }

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

      // Webhook (Mercado Pago lo llama desde sus servidores, NO desde el navegador)
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
      return res.status(r.status).json({
        error: "Mercado Pago devolvió error",
        status: r.status,
        pref,
      });
    }

    if (!pref?.init_point) {
      return res.status(400).json({ error: "No init_point", pref });
    }

    return res.json({
      init_point: pref.init_point,
      preference_id: pref.id,
    });
  } catch (e) {
    console.error("create-preference error:", e);
    return res.status(500).json({ error: "Error create-preference" });
  }
});

export default router;
