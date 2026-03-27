import { NextResponse } from "next/server";

// Mock OCR endpoint – will be replaced with real OCR (e.g. Google Vision / AWS Textract)
export async function POST() {
  // Simulates extracting structured data from a quote PDF/image
  const mockResult = {
    vendor: "Buffet Exemplo",
    items: [
      { description: "Jantar completo (100 pax)", value: 15000 },
      { description: "Bebidas premium", value: 4500 },
      { description: "Sobremesas", value: 2800 },
    ],
    total: 22300,
    notes: "Inclui montagem e desmontagem. Validade: 30 dias.",
  };

  return NextResponse.json(mockResult);
}
