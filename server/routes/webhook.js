import express from "express";

const router = express.Router();

router.post("/webhook", async (req, res) => {
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
      email: payment?.payer?.email,
    });

    return res.sendStatus(200);
  } catch (e) {
    console.error("Webhook error:", e);
    return res.sendStatus(200);
  }
});

export default router;
