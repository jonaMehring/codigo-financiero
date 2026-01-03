import React, { useEffect, useMemo, useState } from "react";

// ✅ Ahora el ebook se descarga desde el BACKEND (archivo privado)
const getEbookUrl = (paymentId) =>
  `/api/mp/download-ebook?payment_id=${encodeURIComponent(paymentId)}`;

export default function Gracias() {
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState("");

  const paymentId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    // Mercado Pago a veces manda payment_id, a veces collection_id
    return params.get("payment_id") || params.get("collection_id") || "";
  }, []);

  useEffect(() => {
    let alive = true;

    async function verify() {
      try {
        if (!paymentId) {
          if (!alive) return;
          setApproved(false);
          setStatus("missing_payment_id");
          setLoading(false);
          return;
        }

        const r = await fetch(`/api/mp/verify-payment?payment_id=${encodeURIComponent(paymentId)}`);
        const data = await r.json();

        if (!alive) return;

        setApproved(!!data.approved);
        setStatus(data.status || (data.approved ? "approved" : "not_approved"));
        setLoading(false);

        // ✅ Solo si está aprobado: descargar desde endpoint seguro
        if (data.approved) {
          const ebookUrl = getEbookUrl(paymentId);

          // descarga directa (mejor que crear <a> a un archivo público)
          window.location.href = ebookUrl;

          // ✅ Evento GA4 SOLO si approved
          if (window.gtag) {
            window.gtag("event", "purchase_completed", {
              currency: "USD",
              value: 10,
              item_id: "codigo_financiero_ebook",
              item_name: "Código Financiero - Ebook",
              page_location: window.location.href,
            });
          }
        }
      } catch (e) {
        if (!alive) return;
        setApproved(false);
        setStatus("verify_error");
        setLoading(false);
      }
    }

    verify();
    return () => {
      alive = false;
    };
  }, [paymentId]);

  return (
    <>
      <main className="section section--dark">
        <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
          {loading ? (
            <>
              <h1 className="section__title section__title--light">Verificando tu pago…</h1>
              <p className="section__note section__note--light">
                Estamos confirmando la operación con Mercado Pago.
              </p>
            </>
          ) : approved ? (
            <>
              <h1 className="section__title section__title--light">
                ¡Gracias por tu compra! 🎉
              </h1>

              <p className="section__note section__note--light">
                Tu ebook <strong>Código Financiero</strong> se está descargando de forma automática.
              </p>

              <p className="section__note section__note--light">
                Si la descarga no comienza en unos segundos o tu navegador la bloquea, podés usar el siguiente botón:
              </p>

              <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                <a
                  href={getEbookUrl(paymentId)}
                  className="btn btn--primary btn--wide"
                >
                  Descargar ebook manualmente
                </a>
              </div>

              <p className="section__note section__note--light">
                También te recomendamos guardar este archivo en un lugar seguro o en tu nube personal para tener acceso siempre.
              </p>
            </>
          ) : (
            <>
              <h1 className="section__title section__title--light">Pago no confirmado</h1>

              <p className="section__note section__note--light">
                No se detectó un pago aprobado. Si volviste sin pagar, la descarga no se habilita.
              </p>

              <p className="section__note section__note--light" style={{ opacity: 0.9 }}>
                Estado: <strong>{status}</strong>
              </p>

              <div style={{ marginTop: "24px" }}>
                <a href="/" className="btn btn--primary btn--wide">
                  Volver al inicio
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__grid">
            <div>
              <h4 className="footer__title">Código Financiero</h4>
              <p className="footer__text">
                Ebook digital para identificar y transmutar bloqueos invisibles con el dinero y equilibrar tu Sistema GCS.
              </p>
            </div>

            <div>
              <h4 className="footer__title">Información útil</h4>
              <ul className="footer__list">
                <li>Acceso inmediato al realizar la compra</li>
                <li>Material 100% digital en formato PDF</li>
                <li>Lectura y ejercicios a tu propio ritmo</li>
              </ul>
            </div>

            <div>
              <h4 className="footer__title">Contacto</h4>
              <p className="footer__text">Lucas Ferrer – Código Financiero</p>
              <p className="footer__text">Consultas: codigofinanciero@ejemplo.com</p>
            </div>
          </div>

          <div className="footer__bottom">
            <p>© 2025 Lucas Ferrer – Código Financiero · Todos los derechos reservados</p>

            <p className="footer__by">
              Desarrollado por{" "}
              <a
                href="https://www.asesoriatecnologicaly.com"
                target="_blank"
                rel="noreferrer noopener"
              >
                Asesoría Tecnológica LY
              </a>
            </p>

            <p className="footer__meta">
              Los resultados pueden variar según la aplicación individual del contenido. Este material es educativo y no constituye asesoría financiera profesional.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
