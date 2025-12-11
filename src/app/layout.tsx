// src/app/layout.tsx
import "./globals.css";
import SWRegister from "../components/SWRegister";

export const metadata = {
  title: "REVELA",
  description: "Consulta rápida de veículos — leilão, roubo, multas, IPVA (Sim/Não).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D3B66" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-black text-white">
        <SWRegister />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
