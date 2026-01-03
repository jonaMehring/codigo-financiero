import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const requiredEnv = (name) => {
  const v = process.env[name];
  return v && String(v).trim().length ? v.trim() : null;
};

// Helpers para evitar repetir headers
const mpHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

/**
 * ✅ CREA PREFERENCIA
 * Devuelve init_point para redirigir a Mercado Pago
 */
router.post("/create-preference", async (req, res) => {
  try {
    const FRONT_URL = requiredEnv("FRONT_URL");
    const API_URL = requiredEnv("API_URL");
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

    const body = {
      items: [
        { title: "Código Financiero - Ebook", quantity: 1, currency_id: "USD", unit_price: 10 },
      ],
      back_urls: {
        success: `${FRONT_URL}/gracias`,
        pending: `${FRONT_URL}/gracias`,
        failure: `${FRONT_URL}/gracias`,
      },
      auto_return: "approved",
      notification_url: `${API_URL}/api/mp/webhook`,
      external_reference: "codigo_financiero_ebook",
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: mpHeaders(ACCESS_TOKEN),
      body: JSON.stringify(body),
    });

    const pref = await r.json();

    if (!r.ok) return res.status(400).json({ error: "MP error", mp: pref });
    if (!pref?.init_point) return res.status(400).json({ error: "No init_point", pref });

    return res.json({ init_point: pref.init_point, preference_id: pref.id });
  } catch (e) {
    console.error("create-preference error:", e);
    return res.status(500).json({ error: "Error create-preference" });
  }
});

/**
 * ✅ VERIFY PAYMENT
 * Lo llama el FRONT en /gracias para decidir si habilitar descarga
 *
 * URL: GET /api/mp/verify-payment?payment_id=123
 * También acepta collection_id por compatibilidad
 */
router.get("/verify-payment", async (req, res) => {
  try {
    const ACCESS_TOKEN = requiredEnv("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ ok: false, approved: false, status: "missing_access_token" });
    }

    const paymentId = req.query.payment_id || req.query.collection_id || "";

    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        approved: false,
        status: "missing_payment_id",
      });
    }

    const pr = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: mpHeaders(ACCESS_TOKEN),
    });

    const payment = await pr.json();

    if (!pr.ok) {
      return res.status(400).json({
        ok: false,
        approved: false,
        status: "mp_error",
        mp: payment,
      });
    }

    const status = payment?.status || "unknown";
    const status_detail = payment?.status_detail || "";

    return res.json({
      ok: true,
      approved: status === "approved",
      status,
      status_detail,
      id: payment?.id,
      payer_email: payment?.payer?.email || null,
    });
  } catch (e) {
    console.error("verify-payment error:", e);
    return res.status(500).json({ ok: false, approved: false, status: "server_error" });
  }
});

/**
 * ✅ DESCARGA SEGURA DEL EBOOK (NUEVO)
 * Descarga SOLO si el pago está APPROVED
 *
 * URL: GET /api/mp/download-ebook?payment_id=123
 * (acepta collection_id también)
 */
router.get("/download-ebook", async (req, res) => {
  try {
    const ACCESS_TOKEN = requiredEnv("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) return res.status(500).json({ error: "missing_access_token" });

    const paymentId = req.query.payment_id || req.query.collection_id || "";
    if (!paymentId) return res.status(400).json({ error: "missing_payment_id" });

    // 🔎 Verificamos pago real en MP
    const pr = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: mpHeaders(ACCESS_TOKEN),
    });
    const payment = await pr.json();

    if (!pr.ok) {
      return res.status(400).json({ error: "mp_error", mp: payment });
    }

    if (payment?.status !== "approved") {
      return res.status(403).json({
        error: "payment_not_approved",
        status: payment?.status || "unknown",
        status_detail: payment?.status_detail || "",
      });
    }

    // 📂 Ruta al PDF privado (según tu estructura: server/private/Codigo-Financiero.pdf)
    const filePath = path.resolve(process.cwd(), "server", "private", "Codigo-Financiero.pdf");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "file_not_found" });
    }

    // ✅ Forzar descarga
    return res.download(filePath, "Codigo-Financiero.pdf");
  } catch (e) {
    console.error("download-ebook error:", e);
    return res.status(500).json({ error: "download_error" });
  }
});

/**
 * ✅ WEBHOOK
 * Mercado Pago llama a esta URL cuando cambia el estado de un pago.
 */
router.post("/webhook", async (req, res) => {
  try {
    const ACCESS_TOKEN = requiredEnv("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) return res.sendStatus(200);

    const dataId = req.query["data.id"] || req.body?.data?.id;
    if (!dataId) return res.sendStatus(200);

    const pr = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: mpHeaders(ACCESS_TOKEN),
    });

    const payment = await pr.json();

    console.log("MP payment:", {
      id: payment?.id,
      status: payment?.status,
      status_detail: payment?.status_detail,
      payer_email: payment?.payer?.email,
    });

    return res.sendStatus(200);
  } catch (e) {
    console.error("webhook error:", e);
    return res.sendStatus(200);
  }
});

export default router;
