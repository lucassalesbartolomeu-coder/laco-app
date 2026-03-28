import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 60,
    color: "#1a2e2a",
    lineHeight: 1.6,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#2c6b5e",
    marginBottom: 32,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  logo: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#2c6b5e" },
  headerSub: { fontSize: 9, color: "#6b7280" },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2c6b5e",
    marginTop: 24,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontFamily: "Helvetica-Bold", width: 130 },
  value: { flex: 1, color: "#374151" },
  termsBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  termsText: { fontSize: 10, lineHeight: 1.8, color: "#374151" },
  signaturesSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: { width: "45%" },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    marginTop: 40,
    marginBottom: 6,
  },
  signatureLabel: { fontSize: 9, color: "#6b7280", textAlign: "center" },
  signedBadge: {
    fontSize: 9,
    color: "#065f46",
    backgroundColor: "#d1fae5",
    padding: "4 8",
    borderRadius: 4,
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

export interface ContractPdfData {
  contract: {
    id: string;
    terms: string;
    value?: number | null;
    signedByPlanner: boolean;
    signedByCouple: boolean;
    plannerName?: string | null;
    coupleName?: string | null;
    plannerSignedAt?: Date | string | null;
    coupleSignedAt?: Date | string | null;
    createdAt: Date | string;
  };
  planner: {
    companyName: string;
    phone: string;
  };
  wedding: {
    partnerName1: string;
    partnerName2: string;
    weddingDate?: Date | string | null;
    venue?: string | null;
    city?: string | null;
  };
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function ContractDocument({ contract, planner, wedding }: ContractPdfData) {
  const couple = `${wedding.partnerName1} & ${wedding.partnerName2}`;

  return (
    <Document
      title={`Contrato — ${couple}`}
      author={planner.companyName}
      subject="Contrato de Prestação de Serviços de Cerimonial"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Laço</Text>
            <Text style={styles.headerSub}>Plataforma de Gestão de Casamentos</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              Contrato #{contract.id.slice(-8).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 9, color: "#6b7280" }}>
              Emitido em {formatDate(contract.createdAt)}
            </Text>
          </View>
        </View>

        {/* Partes */}
        <Text style={styles.sectionTitle}>Partes Contratantes</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Contratado:</Text>
          <Text style={styles.value}>{planner.companyName} — Tel: {planner.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contratantes:</Text>
          <Text style={styles.value}>{couple}</Text>
        </View>

        {/* Evento */}
        <Text style={styles.sectionTitle}>Informações do Evento</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Data do Casamento:</Text>
          <Text style={styles.value}>{formatDate(wedding.weddingDate)}</Text>
        </View>
        {wedding.venue && (
          <View style={styles.row}>
            <Text style={styles.label}>Local:</Text>
            <Text style={styles.value}>
              {wedding.venue}{wedding.city ? ` — ${wedding.city}` : ""}
            </Text>
          </View>
        )}
        {contract.value != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Valor do Contrato:</Text>
            <Text style={styles.value}>{formatCurrency(contract.value)}</Text>
          </View>
        )}

        {/* Termos */}
        <Text style={styles.sectionTitle}>Termos e Condições</Text>
        <View style={styles.termsBox}>
          <Text style={styles.termsText}>{contract.terms}</Text>
        </View>

        {/* Assinaturas */}
        <Text style={styles.sectionTitle}>Assinaturas</Text>
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Cerimonialista</Text>
            {contract.signedByPlanner ? (
              <View>
                <Text style={styles.signedBadge}>
                  Assinado por {contract.plannerName}
                </Text>
                <Text style={{ fontSize: 8, color: "#6b7280", textAlign: "center", marginTop: 4 }}>
                  {formatDate(contract.plannerSignedAt)}
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", marginTop: 4 }}>
                Pendente
              </Text>
            )}
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Casal</Text>
            {contract.signedByCouple ? (
              <View>
                <Text style={styles.signedBadge}>
                  Assinado por {contract.coupleName}
                </Text>
                <Text style={{ fontSize: 8, color: "#6b7280", textAlign: "center", marginTop: 4 }}>
                  {formatDate(contract.coupleSignedAt)}
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", marginTop: 4 }}>
                Pendente
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Laço — Gestão de Casamentos</Text>
          <Text style={styles.footerText}>laco.app</Text>
        </View>
      </Page>
    </Document>
  );
}
