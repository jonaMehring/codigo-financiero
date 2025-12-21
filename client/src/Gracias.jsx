// src/Gracias.jsx
import React, { useEffect } from "react";

// ruta al PDF dentro de /public
const EBOOK_URL = `${import.meta.env.BASE_URL}ebook/Codigo-Financiero.pdf`;

export default function Gracias() {
  useEffect(() => {
    // ✅ Descarga automática al entrar a la página
    const link = document.createElement("a");
    link.href = EBOOK_URL;
    link.download = "Codigo-Financiero.pdf"; // nombre sugerido
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ✅ Evento de GA4 para marcar compra completada / página de gracias
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "purchase_completed", {
        currency: "USD",
        value: 10, // valor del ebook
        item_id: "codigo_financiero_ebook",
        item_name: "Código Financiero - Ebook",
        page_location: window.location.href,
      });
    }
  }, []);

  return (
    <>
      <main className="section section--dark">
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: 640 }}
        >
          <h1 className="section__title section__title--light">
            ¡Gracias por tu compra! 🎉
          </h1>

          <p className="section__note section__note--light">
            Tu ebook <strong>Código Financiero</strong> se está descargando de
            forma automática.
          </p>

          <p className="section__note section__note--light">
            Si la descarga no comienza en unos segundos o tu navegador la
            bloquea, podés usar el siguiente botón:
          </p>

          {/* Descarga manual */}
          <div style={{ marginTop: "24px", marginBottom: "24px" }}>
            <a
              href={EBOOK_URL}
              download="Codigo-Financiero.pdf"
              className="btn btn--primary btn--wide"
            >
              Descargar ebook manualmente
            </a>
          </div>

          <p className="section__note section__note--light">
            También te recomendamos guardar este archivo en un lugar seguro o en
            tu nube personal para tener acceso siempre que quieras.
          </p>
        </div>
      </main>

      {/* FOOTER NUEVO */}
      <footer className="footer">
        <div className="container footer__inner">
          {/* Cols de info */}
          <div className="footer__grid">
            <div>
              <h4 className="footer__title">Código Financiero</h4>
              <p className="footer__text">
                Ebook digital para identificar y transmutar bloqueos invisibles
                con el dinero y equilibrar tu Sistema GCS.
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
              <p className="footer__text">
                Consultas: codigofinanciero@ejemplo.com
              </p>
            </div>
          </div>

          {/* Línea final con créditos */}
          <div className="footer__bottom">
            <p>
              © 2025 Lucas Ferrer – Código Financiero · Todos los derechos
              reservados
            </p>

            <p className="footer__by">
              Desarrollado por{" "}
              <a
                href="https://www.asesoriatecnologicaly.com"
                target="_blank"
                rel="noreferrer"
              >
                Asesoría Tecnológica LY
              </a>
            </p>

            <p className="footer__meta">
              Los resultados pueden variar según la aplicación individual del
              contenido. Este material es educativo y no constituye asesoría
              financiera profesional.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
