import { NextResponse } from "next/server";

function validarPlaca(placa: string) {
  const padraoMercosul = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
  const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
  return padraoMercosul.test(placa) || padraoAntigo.test(placa);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placa = searchParams.get("placa")?.toUpperCase().trim() || "";

  if (!placa) {
    return NextResponse.json({ error: "A placa é obrigatória." }, { status: 400 });
  }

  if (!validarPlaca(placa)) {
    return NextResponse.json(
      { error: "Placa inválida. Use ABC1234 ou ABC1D23." },
      { status: 400 }
    );
  }

  try {
    const resp = await fetch(`https://api.tecnodesenvolvimento.com.br/veiculos/${placa}`, {
      headers: { Authorization: `Bearer ${process.env.TECNODEV_TOKEN}` }
    });

    const data = await resp.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao consultar API. Verifique seu token." },
      { status: 500 }
    );
  }
}
