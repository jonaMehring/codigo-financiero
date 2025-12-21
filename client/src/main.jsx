// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Gracias from "./Gracias";
import "./styles.css";

const params = new URLSearchParams(window.location.search);

// ✅ Acepta gracias por query (?gracias=1) o por ruta (/gracias)
const isGraciasByQuery = params.get("gracias") === "1";
const path = window.location.pathname.replace(/\/+$/, "");
const isGraciasByPath = path.endsWith("/gracias");

const showGracias = isGraciasByQuery || isGraciasByPath;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {showGracias ? <Gracias /> : <App />}
  </React.StrictMode>
);
