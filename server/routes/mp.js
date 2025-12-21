import express from "express";

const router = express.Router();

router.post("/create-preference", async (req, res) => {
  try {
    const FRONT_URL = process.env.FRONT_URL;      // https://tudominio.com
    const API_URL = process.env.API_URL;          // https://tudominio.com o https://api.tudominio.com
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

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
    if (!pref?.init_point) return res.status(400).json({ error: "No init_point", pref });

    return res.json({ init_point: pref.init_point });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error create-preference" });
  }
});

export default router;
