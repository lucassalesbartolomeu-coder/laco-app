import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Cormorant Garamond is not registered here — Helvetica-Bold is used as fallback
// for the contract title, per react-pdf custom font registration requirements.

const BRAND_GREEN = "#2c6b5e";
const BRAND_GREEN_LIGHT = "#d1fae5";
const BRAND_GREEN_DARK = "#065f46";
const GRAY_100 = "#f3f4f6";
const GRAY_200 = "#e5e7eb";
const GRAY_300 = "#d1d5db";
const GRAY_500 = "#6b7280";
const GRAY_700 = "#374151";
const GRAY_900 = "#1a2e2a";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 60,
    color: GRAY_900,
    lineHeight: 1.6,
    backgroundColor: "#ffffff",
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: BRAND_GREEN,
    paddingBottom: 16,
    marginBottom: 28,
  },
  headerLeft: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
    letterSpacing: 2,
    lineHeight: 1,
  },
  companyName: {
    fontSize: 10,
    color: GRAY_500,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerMeta: {
    fontSize: 9,
    color: GRAY_500,
    marginBottom: 2,
  },

  /* ── Contract Title ── */
  contractTitle: {
    fontFamily: "Helvetica-Bold", // fallback for Cormorant Garamond
    fontSize: 16,
    color: GRAY_900,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  contractSubtitle: {
    fontSize: 10,
    color: GRAY_500,
    textAlign: "center",
    marginBottom: 28,
  },
  titleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    marginBottom: 24,
  },

  /* ── Sections ── */
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND_GREEN,
    marginTop: 24,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    paddingBottom: 4,
  },

  /* ── Data rows ── */
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    width: 140,
    fontSize: 10,
    color: GRAY_700,
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: GRAY_700,
  },

  /* ── Terms box ── */
  termsBox: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: GRAY_300,
    borderRadius: 4,
    padding: 16,
    backgroundColor: GRAY_100,
  },
  termsText: {
    fontSize: 10,
    lineHeight: 1.8,
    color: GRAY_700,
  },

  /* ── Signatures ── */
  signaturesSection: {
    marginTop: 44,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "44%",
  },
  signatureNameLine: {
    borderTopWidth: 1,
    borderTopColor: GRAY_700,
    marginBottom: 6,
  },
  signatureFieldLabel: {
    fontSize: 8,
    color: GRAY_500,
    marginBottom: 10,
    textAlign: "center",
  },
  signatureDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  signatureDateLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY_500,
    width: 36,
  },
  signatureDateLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_300,
    marginLeft: 4,
  },
  signedBadge: {
    fontSize: 9,
    color: BRAND_GREEN_DARK,
    backgroundColor: BRAND_GREEN_LIGHT,
    padding: "4 8",
    borderRadius: 4,
    marginTop: 4,
    textAlign: "center",
  },
  signedDate: {
    fontSize: 8,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 3,
  },
  pendingText: {
    fontSize: 9,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 4,
  },

  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 28,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 8,
    color: GRAY_500,
  },
  footerContract: {
    fontSize: 8,
    color: GRAY_500,
  },
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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function contractNumber(id: string) {
  return `Nº ${id.slice(-8).toUpperCase()}`;
}

export function ContractDocument({ contract, planner, wedding }: ContractPdfData) {
  const couple = `${wedding.partnerName1} & ${wedding.partnerName2}`;
  const contratcNo = contractNumber(contract.id);

  return (
    <Document
      title={`Contrato — ${couple}`}
      author={planner.companyName}
      subject="Contrato de Prestação de Serviços de Cerimonial"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoText}>Laço</Text>
            <Text style={styles.companyName}>{planner.companyName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>{contratcNo}</Text>
            <Text style={styles.headerMeta}>Emitido em {formatDate(contract.createdAt)}</Text>
          </View>
        </View>

        {/* ── Contract Title ── */}
        <Text style={styles.contractTitle}>
          Contrato de Prestação de Serviços de Cerimonial
        </Text>
        <Text style={styles.contractSubtitle}>{couple}</Text>
        <View style={styles.titleDivider} />

        {/* ── Partes ── */}
        <Text style={styles.sectionTitle}>Partes Contratantes</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Contratado:</Text>
          <Text style={styles.value}>
            {planner.companyName}{planner.phone ? `  ·  Tel: ${planner.phone}` : ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contratantes:</Text>
          <Text style={styles.value}>{couple}</Text>
        </View>

        {/* ── Evento ── */}
        <Text style={styles.sectionTitle}>Evento</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Data do Casamento:</Text>
          <Text style={styles.value}>{formatDate(wedding.weddingDate)}</Text>
        </View>
        {wedding.venue && (
          <View style={styles.row}>
            <Text style={styles.label}>Local:</Text>
            <Text style={styles.value}>
              {wedding.venue}
              {wedding.city ? `  —  ${wedding.city}` : ""}
            </Text>
          </View>
        )}
        {contract.value != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Valor Contratado:</Text>
            <Text style={styles.value}>{formatCurrency(contract.value)}</Text>
          </View>
        )}

        {/* ── Termos ── */}
        <Text style={styles.sectionTitle}>Termos e Condições</Text>
        <View style={styles.termsBox}>
          <Text style={styles.termsText}>{contract.terms}</Text>
        </View>

        {/* ── Assinaturas ── */}
        <Text style={styles.sectionTitle}>Assinaturas</Text>
        <View style={styles.signaturesSection}>

          {/* Planner */}
          <View style={styles.signatureBlock}>
            <View style={styles.signatureNameLine} />
            <Text style={styles.signatureFieldLabel}>Nome do Cerimonialista</Text>
            <View style={styles.signatureDateRow}>
              <Text style={styles.signatureDateLabel}>Data:</Text>
              <View style={styles.signatureDateLine} />
            </View>
            {contract.signedByPlanner ? (
              <View>
                <Text style={styles.signedBadge}>
                  Assinado por {contract.plannerName ?? planner.companyName}
                </Text>
                <Text style={styles.signedDate}>
                  {formatDate(contract.plannerSignedAt)}
                </Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>Pendente</Text>
            )}
          </View>

          {/* Couple */}
          <View style={styles.signatureBlock}>
            <View style={styles.signatureNameLine} />
            <Text style={styles.signatureFieldLabel}>Nome dos Contratantes</Text>
            <View style={styles.signatureDateRow}>
              <Text style={styles.signatureDateLabel}>Data:</Text>
              <View style={styles.signatureDateLine} />
            </View>
            {contract.signedByCouple ? (
              <View>
                <Text style={styles.signedBadge}>
                  Assinado por {contract.coupleName ?? couple}
                </Text>
                <Text style={styles.signedDate}>
                  {formatDate(contract.coupleSignedAt)}
                </Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>Pendente</Text>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>Gerado pelo Laço · laco.app</Text>
          <Text style={styles.footerContract}>{contratcNo}</Text>
        </View>

      </Page>
    </Document>
  );
}
