import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Storage polyfill for Claude artifacts / sandboxed environments
if (typeof window !== "undefined") {
  try {
    window.localStorage.getItem("__test__");
  } catch {
    const store = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      },
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
