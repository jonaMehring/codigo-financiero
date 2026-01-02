import React, { useEffect, useState } from "react";



const CTAButton = ({ children, className = "" }) => {
  const buy = async () => {
    try {
      // ✅ Tomar la URL real del .env (Vite)
      let API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error("Falta configurar VITE_API_URL en el frontend");
      }

      // ✅ Evitar doble // si viene con / al final
      API_URL = API_URL.replace(/\/+$/, "");

      // ✅ Llamada correcta al backend
      const r = await fetch(`${API_URL}/api/mp/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // si no es 2xx, mostrar el texto crudo (muchas veces es HTML del proxy)
      if (!r.ok) {
        const text = await r.text();
        console.error("create-preference failed:", r.status, text);
        throw new Error(`Error iniciando pago (HTTP ${r.status}). Revisá consola.`);
      }

      const data = await r.json();

      if (!data?.init_point) {
        console.error("Respuesta sin init_point:", data);
        throw new Error("No se pudo iniciar el pago (sin init_point).");
      }

      window.location.href = data.init_point;
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error iniciando pago");
    }
  };

  return (
    <button type="button" onClick={buy} className={`btn btn--primary btn--block ${className}`}>
      {children}
    </button>
  );
};
   
 
// ====== COUNTDOWN GLOBAL 24 HS ======
function useGlobalCountdown(hours = 24) {
  const STORAGE_KEY = "cf_deadline";
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let deadline = localStorage.getItem(STORAGE_KEY);

    // si no existe o ya venció → crear nuevo deadline
    if (!deadline || Number(deadline) < Date.now()) {
      deadline = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, String(deadline));
    }

    const interval = setInterval(() => {
      const currentDeadline = Number(localStorage.getItem(STORAGE_KEY)) || Number(deadline);
      const diff = currentDeadline - Date.now();

      if (diff <= 0) {
        // reinicia automáticamente
        const newDeadline = Date.now() + hours * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, String(newDeadline));
        setTimeLeft(newDeadline - Date.now());
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hours]);

  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft / (1000 * 60)) % 60);
  const secondsLeft = Math.floor((timeLeft / 1000) % 60);

  return { hoursLeft, minutesLeft, secondsLeft };
}

function CountdownBar() {
  // ✅ ocultar en /gracias o ?gracias=1
  const params = new URLSearchParams(window.location.search);
  const isGraciasQuery = params.get("gracias") === "1";

  const path = window.location.pathname.replace(/\/+$/, "");
  const isGraciasPath = path.endsWith("/gracias");

  const isGracias = isGraciasQuery || isGraciasPath;
  if (isGracias) return null;

  const { hoursLeft, minutesLeft, secondsLeft } = useGlobalCountdown(24);

  const totalSecondsLeft = hoursLeft * 3600 + minutesLeft * 60 + secondsLeft;
  const isLast2Hours = totalSecondsLeft > 0 && totalSecondsLeft <= 2 * 3600;
  const isLast10Min = totalSecondsLeft > 0 && totalSecondsLeft <= 10 * 60;

  const message = isLast2Hours ? (
    <>
      <span className="countdown-icon" aria-hidden="true">
        ⏳
      </span>{" "}
      Últimas 2 horas de precio lanzamiento:
    </>
  ) : (
    <>
      <span className="countdown-icon" aria-hidden="true">
        ⏰
      </span>{" "}
      Precio lanzamiento termina en
    </>
  );

  return (
    <div
      className={isLast10Min ? "countdown-bar countdown-bar--blink" : "countdown-bar"}
      style={{
        background: "#FF6B35",
        color: "#000",
        textAlign: "center",
        padding: "10px 16px",
        fontWeight: "700",
        fontSize: "0.95rem",
        position: "sticky",
        top: 0,
        zIndex: 9999,
      }}
    >
      {message}{" "}
      <strong>
        {String(hoursLeft).padStart(2, "0")}:
        {String(minutesLeft).padStart(2, "0")}:
        {String(secondsLeft).padStart(2, "0")}
      </strong>
      {isLast10Min ? " 🚨" : ""}
    </div>
  );
}

export default function App() {
  return (
    <>
      <CountdownBar />
      {/* SECCIÓN 1 – HERO */}
      <header className="hero section section--dark" id="inicio">
        <div className="container hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">
              Descubre en 48 Horas Tu Bloqueo Financiero Invisible
              <br />
              <span className="highlight">
                y Cómo Desbloquearlo Para Generar Más de $3,000 USD al Mes
              </span>
            </h1>

            <p className="hero__subtitle">
              Ebook de 79 páginas con el sistema completo paso a paso para
              identificar qué está frenando tu flujo de dinero y transformarlo
              en menos de 30 días.
            </p>



            <div className="hero__ctas">
              <CTAButton>ADQUIRIR AHORA </CTAButton>
              <p className="hero__note">
                ✓ Descarga inmediata · ✓ Precio lanzamiento 
                <br />· ✓ Acceso de por
                vida
              </p>
            </div>

            <p className="hero__note" style={{ marginTop: "20px" }}>
              Lucas Ferrer +11 años especializándome en bloqueos invisibles,
              energéticos y vibracionales del dinero.
            </p>
          </div>
        </div>
      </header>

      <main>
        {/* SECCIÓN 2 – LOGÍSTICA CLARA */}
        <section className="section section--light" id="logistica">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title1">
                ¿CÓMO FUNCIONA CÓDIGO FINANCIERO?
              </h2>
            </div>

            <div className="grid grid--3">
              <article className="card">

                <p className="card__text">
                  <strong>70% Teoría Profunda + 30% Práctica Aplicable</strong>
                </p>
                <p className="card__text">
                  Este es un ebook digital completo que combina profundidad
                  conceptual con ejercicios específicos para desbloquear el flujo
                  de abundancia natural en tu vida. No es un workbook superficial
                  ni un “libro marketinero”: es transformación real desde la raíz
                  invisible de tu relación con el dinero.
                </p>
              </article>

              <article className="card">

                <p className="card__text">
                  <strong>
                    48 Horas Para Identificar · 30 Días Para Integrar
                  </strong>
                </p>
                <p className="card__text">
                  En 48 horas identificarás qué está bloqueado (Generar, Sostener
                  o Circular). En 30 días (o antes) de aplicar el Protocolo verás
                  cambios tangibles en tu realidad financiera.
                </p>
              </article>

              <article className="card">

                <p className="card__text">
                  <strong>Desbloquear Tu Sistema GCS Para Flujo Constante</strong>
                </p>
                <p className="card__text">
                  Identificar y transmutar los bloqueos invisibles (energéticos,
                  lingüísticos, heredados) para que puedas generar y sostener
                  $3,000+ USD mensuales. No desde más esfuerzo, sino desde tu
                  nueva programación interna.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3 – CONTENIDO: LAS 3 PARTES */}
        <section className="section section--light" id="contenido">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title">LO QUE RECIBES</h2>
            </div>

            <div className="grid grid--3">
              <article className="card">
                <h3 className="card__title">PARTE 1: FUNDAMENTOS INVISIBLES</h3>
                <p className="card__text">
                  <strong>4 capítulos:</strong> Sistema GCS · Código Lingüístico ·
                  Filtro Magnético · Lealtades Invisibles.
                </p>
                <p className="card__text">
                  <strong>Resultado:</strong> Sabrás exactamente qué está
                  bloqueado y por qué nada ha funcionado profundamente hasta ahora.
                </p>
              </article>

              <article className="card">
                <h3 className="card__title">PARTE 2: ALQUIMIA PROFUNDA</h3>
                <p className="card__text">
                  <strong>5 capítulos:</strong> Energías Masculina/Femenina ·
                  Transmutación · Cuerpo como Sensor · Historia Financiera ·
                  Anatomía de Bloqueos.
                </p>
                <p className="card__text">
                  <strong>Resultado:</strong> Comprenderás la arquitectura
                  completa de tu sistema financiero invisible con claridad
                  absoluta.
                </p>
              </article>

              <article className="card">
                <h3 className="card__title">PARTE 3: SISTEMA DE ACTIVACIÓN</h3>
                <p className="card__text">
                  <strong>5 ejercicios completos:</strong> Termómetro GCS · Ritual
                  del Fuego · Vocabulario Transmutado · Filtro del Querer ·
                  Protocolo 30 Días.
                </p>
                <p className="card__text">
                  <strong>Resultado:</strong> Herramientas exactas para transmutar
                  e integrar tu nuevo código en 30 días.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4 – LA META */}
        <section className="section section--dark" id="meta">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title section__title--light">
                ¿CUÁL ES LA META REAL?
              </h2>
            </div>
            <p className="section__note section__note--light">
              Código Financiero es para profesionales y emprendedores que sienten
              que algo invisible los frena, trabajan duro pero están estancados,
              generan dinero pero no lo sostienen, y están listos para hacer el
              trabajo interno profundo que las estrategias tradicionales ignoran.
            </p>

            <p className="section__note section__note--light">
              No se trata de “trabajar más duro” o aplicar otra estrategia
              externa. Se trata de desbloquear tu código interno: la capa
              invisible donde se determina si puedes ver oportunidades, recibir
              abundancia y sostenerla.
            </p>

            <p className="section__note section__note--light">
              <strong>El resultado:</strong> crear tu capacidad de generar y
              sostener <strong>$3,000+ USD mensuales</strong> de forma
              consistente, sin depender de más esfuerzo externo.
            </p>
          </div>
        </section>

        {/* SECCIÓN 5 – AGITACIÓN */}
        <section className="section section--light" id="agitacion">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title">
                Trabajas un Montón Pero el Dinero No Fluye
              </h2>
              <div >
                <img className="finanza" src="/finan.jpeg" alt="" />
              </div>
            </div>
            <div className="negocio">
              <h2>
                Tu negocio sigue estancado, aunque lo estás intentando todo.
              </h2>
              <p>
                Haces promociones, descuentos, marketing, aprendes más, trabajas
                más horas.
              </p>
              <p>
                Cada mes empiezas desde cero. El dinero entra pero no se queda.
                Trabajas duro pero siempre terminas en el mismo lugar.
              </p>
            </div>
            <p>
              <strong>Y lo peor: </strong>
              <strong className="text-orange">no sabes qué es.</strong>
            </p>


          </div>
        </section>

        {/* SECCIÓN 6 – CAMINO 99% ➜ 1% */}
        <section className="section section--dark" id="el-99">
          <div className="container">
            <div className="camino">
              {/* TEXTO ARRIBA – 99% */}
              <div className="camino__top">
                <h2 className="camino__title-99">
                  El 99% de los profesionales y emprenderdores pasan por lo mismo.
                </h2>
                <p className="camino__subtitle-99">
                  Trabajan más, lanzan más, se esfuerzan más… pero cada mes sienten
                  que empiezan desde cero y que el dinero entra y se va sin control.
                </p>
              </div>

              {/* DIAGRAMA + FLECHA HACIA EL TEXTO */}
              <div className="camino__graphic">
                <img
                  src="/diagrama-99-1.png"
                  alt="Camino del 1% al 99%"
                  className="camino__image"
                />

                {/* Flecha que sale del 99% hacia el texto superior */}
                <svg
                  className="camino__arrow"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <defs>
                    <marker
                      id="camino-arrow-head"
                      markerWidth="6"
                      markerHeight="6"
                      refX="5"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff" />
                    </marker>
                  </defs>
                  {/* curva suave hacia arriba */}
                  <path
                    d="M 15 85 C 40 65, 65 40, 85 15"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    markerEnd="url(#camino-arrow-head)"
                  />
                </svg>
              </div>

              {/* TEXTO ABAJO – 1% */}
              <div className="camino__bottom">
                <h3 className="camino__title-1">
                  Lo que hace el{" "}
                  <span className="camino__title-1--accent">1 %</span> de personas con abundancia real
                </h3>
                <p className="camino__subtitle-1">
                  En vez de quedarse atrapados en la rueda del 99%, entienden que el problema no es externo y trabajan en su{" "}
                  <strong>Código Financiero interno</strong>
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* SECCIÓN 8 – PARA QUIÉN ES */}
        <section className="section section--light" id="para-quien">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title">Este Ebook Es Para Ti Si…</h2>
            </div>

            <ul className="list">
              <li>
                <strong>Tienes capacidad y talento</strong> pero tus resultados financieros no lo
                reflejan, y esa desconexión te frustra brutalmente.
              </li>
              <li>
                <strong>Estás harto de “esfuérzate más”</strong> cuando sabes que el problema no
                es falta de esfuerzo, es algo más profundo.
              </li>
              <li>
                <strong>Te reconoces en patrones de escasez</strong> de tu familia y estás listo
                para romper ese ciclo heredado.
              </li>
              <li>
                No buscas tips rápidos, <strong>buscas transformación real</strong>,
                trabajando en tu relación invisible con el dinero.
              </li>
              <li>
                <strong>Vives con ansiedad financiera constante</strong> aunque generes “bien”,
                nunca sientes paz o libertad real.
              </li>
              <li>
                <strong>Reconoces que te auto-saboteas</strong> (procrastinas cobrar, regalas tu
                trabajo) y estás listo para transmutarlo.
              </li>
            </ul>

            <p style={{ marginTop: "12px" }}>
              Si los “Es para ti” te identifican, Código Financiero fue creado
              exactamente para ti. La pregunta es:{" "}
              <strong>
                ¿estás listo para transformar tus finanzas?
              </strong>
            </p>
          </div>
        </section>

        {/* SECCIÓN 9 – PROMESA CON TIMEFRAME */}
        <section className="section section--dark" id="promesa">
          <div className="container">
            <h2 className="section__title section__title--light">
              En 48 Horas Identificarás Qué Está Bloqueando Tu Abundancia
            </h2>
            <p className="section__subtitle section__subtitle--light">
              Y en 30 días tendrás el sistema activado para generar y sostener
              $3,000+ USD mensuales.
            </p>
            <p className="section__note section__note--light">
              Tendrás acceso inmediato al ebook completo, a las 3 partes, al
              Protocolo de 30 días y a los ejercicios de activación.
            </p>
            <CTAButton>ADQUIRIR AHORA</CTAButton>
          </div>
          
        </section>


        {/* SECCIÓN 11 – TESTIMONIOS */}
        <section className="section section--light" id="testimonios">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title">TESTIMONIOS</h2>
            </div>

            <div className="grid grid--3">
              <article className="card card--testimonial">

                <p className="test">
                  “Trabajaba sin parar, 4 tarjetas explotadas, ansiedad e insomnio. Mi
                  peluquería era un caos. Luego de aplicar lo aprendido durante 2
                  meses, todo se ordenó: pasé de $4–5 millones a $11 millones
                  mensuales, liquidé casi todas las deudas, recuperé el sueño y mi
                  relación mejoró.”
                </p>
                <p className="testimonial__author test">
                  — Marcos González, Peluquero
                </p>
                <div
                  className="testimonial__stars"
                  aria-label="Valoración 5 de 5 estrellas"
                >
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </article>

              <article className="card card--testimonial">
                <p className="test">
                  “Estaba completamente bloqueada: me costaba poner precios, hacía
                  rebajas constantemente, tenía que perseguir a los clientes para que
                  me pagaran. Dudaba hasta de mi profesión. En solo 1 mes de aplicar el
                  sistema, desbloqueé mi flujo: ya duplico mis ingresos, los clientes
                  me pagan solos, pongo mis precios sin culpa y disfruto mi trabajo.
                  Todos los bloqueos eran internos.”
                </p>
                <p className="testimonial__author test">
                  — Silvia Peralta, Escribana
                </p>
                <div
                  className="testimonial__stars"
                  aria-label="Valoración 5 de 5 estrellas"
                >
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </article>

              <article className="card card--testimonial">

                <p className="test">
                  “Me encontraba estancada en el mismo techo: $600 al mes que ni
                  siquiera alcanzaba y terminaba perdiendo. Tenía deudas constantes.
                  Sabía lo que tenía que hacer, pero algo me bloqueaba. En 1 mes de
                  trabajar en mi mentalidad, identifiqué mis bloqueos de Generar y
                  Sostener. Pasé a generar más de $1,500 mensuales y comencé a pagar mis
                  deudas.”
                </p>
                <p className="testimonial__author test">
                  — Lina Marcela López, Emprendedora Digital
                </p>
                <div
                  className="testimonial__stars"
                  aria-label="Valoración 5 de 5 estrellas"
                >
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SECCIÓN 12 – OFERTA + PRECIO + CTA */}
        <section className="section section--dark" id="oferta">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title section__title--light">
                Tu Código Financiero Está a Un Clic de Distancia
              </h2>
            </div>

            <ul className="list list--light">
              <li>Ebook digital completo de 79 páginas.</li>
              <li>Las 3 partes incluidas.</li>
              <li>Descarga inmediata.</li>
              <li>Protocolo de 30 días completo.</li>
              <li>14 capítulos + 5 ejercicios.</li>
              <li>Acceso de por vida.</li>
            </ul>

            <div className="pricing" style={{ marginTop: "32px" }}>
              <div className="pricing__card">
                <p className="pricing__price">
                  Precio regular: <s>$59 USD</s>
                </p>
                <p className="pricing__price">
                  <strong className="precio">
                    PRECIO DE LANZAMIENTO:
                    <span className="precio-destacado"> $29 USD</span>
                  </strong>
                </p>
                <p className="pricing__mini">
                  Este precio especial puede cambiar en cualquier momento.
                </p>

                <div style={{ marginTop: "24px" }}>
                  <CTAButton>ADQUIRIR AHORA</CTAButton>
                  <p className="pricing__mini" style={{ marginTop: "12px" }}>
                    ✓ Acceso instantáneo · 🔒 Pago seguro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 13 – ¿POR QUÉ ES TAN BARATO? */}
        <section className="section section--light" id="por-que-barato">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title section__title--light">
                ¿Por Qué el Precio es Tan Bajo?
              </h2>
            </div>

            <p>
              Código Financiero podría costar miles de dólares ya que es el
              resultado de 11 años especializándome a través de decenas de
              libros, eventos y retiros sobre abundancia en diferentes países,
              cursos de miles de dólares y mentores de éxito que me han llevado
              a un conocimiento profundo en este tema que hoy aplico en mis
              sesiones de coaching.
            </p>

            <p>
              Lo hago accesible por dos razones. Primera: creo profundamente que
              este conocimiento no debería estar disponible solo para quienes
              pueden pagar coaching premium. Los bloqueos invisibles con el
              dinero afectan a millones de profesionales y emprendedores
              talentosos que merecen acceso a transformación real. He
              experimentado en carne propia estos bloqueos durante muchos años y
              deseo que tu proceso sea diferente gracias al mío.
            </p>

            
          </div>
        </section>

        {/* SECCIÓN 14 – SOBRE LUCAS */}
        <section className="section section--dark" id="sobre-mi">
          <div className="container split split--about">
            <div className="split__col split__col--media">
              <img
                src="/lucas-coach.jpeg"
                alt="Lucas"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "16px",
                  objectFit: "cover",
                }}
              />
            </div>

          <div className="split__col">
  <h2 className="section__title section__title--light">
    Sobre Mí (Y Por Qué Creé Código Financiero)
  </h2>

  {/* intro corta, siempre visible */}
  <p className="section__subtitle section__subtitle--light">
    Mi nombre es Lucas Ferrer, y durante más de 11 años me he especializado
    en algo que casi nadie toca: los aspectos invisibles, energéticos y
    vibracionales de la relación con el dinero.
  </p>

  <p className="section__note section__note--light">
    No soy un asesor financiero tradicional. Trabajo en una capa más
    profunda: donde se define si podés ver oportunidades cuando están frente
    a vos, recibir abundancia sin sabotearla y operar desde expansión en vez
    de auto-limitación.
  </p>

  <p className="section__note section__note--light">
      Durante años el dinero fue mi talón de Aquiles. Tenía éxito aparente:
      auto de lujo, casa de lujo, viajes en primera clase. Pero por dentro me
      sentía vacío, insuficiente y validado solo por lo que ganaba.
    </p>
    
<p className="section__note section__note--light">
      Sentía que si dejaba de accionar, todo se caería. Invertía en
      educación, eventos y mentores, aplicaba todas las tácticas de
      marketing, publicaba sin parar… y aun así no sentía paz ni abundancia
      real.
    </p>
  {/* bloque expandible con toda la historia */}
  <details className="about__details">
    <summary className="about__summary">
      Ver más sobre mi historia
      <span className="about__chevron" aria-hidden="true" />
    </summary>

    <p className="section__note section__note--light">
      Después de un viaje de un mes sin trabajar, todo colapsó: caí en deudas
      altas, mi relación terminó y llegué a contar centavos para comer,
      recibiendo llamadas de cobranza y pidiendo prestado. El patrón se
      repetía una y otra vez.
    </p>

    <p className="section__note section__note--light">
      Ahí entendí que nada externo era la causa: era 100% interno. Tenía un
      código de escasez, creencias de pobreza y patrones heredados operando
      sin mi consentimiento. Empecé a trabajar en mi inconsciente y a
      reprogramar mi código.
    </p>

    <p className="section__note section__note--light">
      Me tomó alrededor de año y medio. No fue rápido ni fácil, pero cuando
      se desbloqueó todo se alineó: me liberé de deudas, logré flujo
      constante y aprendí a circular, sostener y sentirme seguro con el
      dinero.
    </p>

    <p className="section__note section__note--light">
      De ese proceso nació <strong>Código Financiero</strong>. Es la
      destilación de más de una década de especialización en un mapa que me
      hubiera ahorrado años de lucha si lo hubiera tenido antes. No es solo
      teoría: es el mismo sistema que uso en mis sesiones de coaching
      premium, empaquetado en un formato accesible.
    </p>

    <p className="section__note section__note--light">
      Mi filosofía es simple: el problema con el dinero no es externo, es
      interno. Cuando desbloqueás tu código, los resultados empiezan a
      aparecer de forma natural, sin forzar. Los <strong>$29 USD</strong> que
      vale este ebook no representan su valor real; son la inversión mínima
      para demostrarte que estás comprometido con tu transformación.
    </p>
  </details>
</div>
</div>
        </section>

        {/* FAQ */}
        <section className="section section--light" id="faq">
          <div className="container">
            <div className="section__header section__header--center">
              <h2 className="section__title">Preguntas Frecuentes</h2>
            </div>

            <div className="faq">
              <article className="faq__item">
                <details className="faq__details">
                  <summary className="faq__summary">
                    <span>¿Cuánto tiempo necesito dedicar?</span>
                    <span className="faq__toggle" aria-hidden="true"></span>
                  </summary>
                  <p className="faq__answer">
                    Lectura: 3–5 horas a tu ritmo para las 100+ páginas.
                    Aplicación: 25–30 minutos diarios (15 min matutino + 10 min
                    nocturno + aplicación durante el día).
                  </p>
                </details>
              </article>

              <article className="faq__item">
                <details className="faq__details">
                  <summary className="faq__summary">
                    <span>¿Necesito experiencia previa en trabajo energético?</span>
                    <span className="faq__toggle" aria-hidden="true"></span>
                  </summary>
                  <p className="faq__answer">
                    No. Todo puede aplicarse desde un enfoque práctico de cambio
                    de hábitos. El Sistema GCS es diagnóstico objetivo, el
                    vocabulario es reprogramación lingüística. No requiere “creer”
                    en nada.
                  </p>
                </details>
              </article>

              <article className="faq__item">
                <details className="faq__details">
                  <summary className="faq__summary">
                    <span>¿En cuánto tiempo veré resultados?</span>
                    <span className="faq__toggle" aria-hidden="true"></span>
                  </summary>
                  <p className="faq__answer">
                    48 horas: identificarás qué está bloqueado (consciencia).
                    7–14 días: cambios en lenguaje, sensación corporal,
                    oportunidades. 30 días: sistema GCS balanceado, vocabulario
                    natural, bloqueo transmutado. 60–90 días: resultados tangibles
                    en tu realidad financiera externa.
                  </p>
                </details>
              </article>

              <article className="faq__item">
                <details className="faq__details">
                  <summary className="faq__summary">
                    <span>¿Esto reemplaza estrategias financieras tradicionales?</span>
                    <span className="faq__toggle" aria-hidden="true"></span>
                  </summary>
                  <p className="faq__answer">
                    No, las complementa. Trabaja en la capa invisible que
                    determina si las estrategias externas funcionan. Si tienes
                    bloqueos internos activos, ninguna estrategia externa da
                    resultados profundos. Primero desbloqueas tu código, luego las
                    estrategias funcionan naturalmente.
                  </p>
                </details>
              </article>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          className="section section--dark section--border"
          id="cta-final"
        >
          <div className="container cta-final">
            <p className="cta-final__text">
              Si sentís que este material te está hablando directo, este es tu
              punto de partida para dejar de vivir en modo supervivencia
              financiera y empezar a operar desde un Código Financiero alineado
              con la abundancia.
            </p>
            <CTAButton>ADQUIRIR AHORA</CTAButton>
          </div>
        </section>
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
              <p className="footer__text">Consultas: codigofinanciero@ejemplo.com</p>
            </div>
          </div>

          {/* Línea final con créditos */}
          <div className="footer__bottom">
            <p>© 2025 Lucas Ferrer– Código Financiero · Todos los derechos reservados</p>

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
