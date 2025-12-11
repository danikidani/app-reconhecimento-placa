// src/components/SWRegister.tsx
"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => console.log("Service Worker registrado:", reg.scope))
        .catch((err) => console.warn("Erro ao registrar SW:", err));
    }
  }, []);

  return null;
}
