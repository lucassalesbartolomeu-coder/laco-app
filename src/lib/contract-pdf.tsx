import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Paleta Laco ───────────────────────────────────────────────────────────
const VERDE_NOITE  = "#1A3A33";
const TEAL         = "#2C6B5E";
const COPPER       = "#C4734F";
const COPPER_LIGHT = "#F5E8E1";
const BODY         = "#1A1A1A";
const SEPARATOR    = "#E5E7EB";
const GRAY_500     = "#6B7280";
const GRAY_700     = "#374151";
const GREEN_BADGE  = "#D1FAE5";
const GREEN_DARK   = "#065F46";
const WHITE        = "#FFFFFF";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 64,
    paddingHorizontal: 0,
    color: BODY,
    lineHeight: 1.6,
    backgroundColor: WHITE,
  },

  // Faixa superior colorida
  headerBand: {
    backgroundColor: VERDE_NOITE,
    paddingHorizontal: 52,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
  },
  companyNameText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  cnpjText: {
    fontSize: 9,
    color: "#A8C4BE",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerMetaLabel: {
    fontSize: 8,
    color: "#A8C4BE",
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  headerMetaValue: {
    fontSize: 9,
    color: WHITE,
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  // Faixa com titulo do contrato
  titleBand: {
    backgroundColor: TEAL,
    paddingHorizontal: 52,
    paddingVertical: 14,
    marginBottom: 28,
  },
  contractTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: WHITE,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  contractCouple: {
    fontSize: 9,
    color: "#C8DDD9",
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Conteudo interno
  content: {
    paddingHorizontal: 52,
  },

  // Titulos de secao
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: VERDE_NOITE,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginTop: 22,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: VERDE_NOITE,
  },

  // Layout 2 colunas
  twoColumns: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  column: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    borderRadius: 4,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  columnLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  columnValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BODY,
    lineHeight: 1.4,
  },
  columnSub: {
    fontSize: 9,
    color: GRAY_500,
    marginTop: 2,
  },

  // Tabela de evento
  eventTable: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: SEPARATOR,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  eventCell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: SEPARATOR,
  },
  eventCellLast: {
    flex: 1,
    padding: 10,
  },
  eventCellLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GRAY_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventCellValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BODY,
  },

  // Tabela de servicos
  serviceTableHeader: {
    flexDirection: "row",
    backgroundColor: VERDE_NOITE,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  serviceTableHeaderDesc: {
    flex: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  serviceTableHeaderVal: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "right",
  },
  serviceRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SEPARATOR,
    backgroundColor: WHITE,
  },
  serviceDesc: {
    flex: 3,
    fontSize: 10,
    color: BODY,
  },
  serviceVal: {
    flex: 1,
    fontSize: 10,
    color: BODY,
    textAlign: "right",
  },
  serviceTotalRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COPPER_LIGHT,
    borderRadius: 3,
  },
  serviceTotalDesc: {
    flex: 3,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COPPER,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  serviceTotalVal: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COPPER,
    textAlign: "right",
  },

  // Termos e clausulas
  termsBox: {
    borderWidth: 1,
    borderColor: SEPARATOR,
    borderRadius: 4,
    padding: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 4,
  },
  termsText: {
    fontSize: 9.5,
    lineHeight: 1.9,
    color: GRAY_700,
  },

  // Assinaturas
  signaturesSection: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  signatureBlock: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: BODY,
    width: "100%",
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BODY,
    textAlign: "center",
    marginBottom: 2,
  },
  signatureRole: {
    fontSize: 8,
    color: GRAY_500,
    textAlign: "center",
    marginBottom: 6,
  },
  signedBadge: {
    fontSize: 8,
    color: GREEN_DARK,
    backgroundColor: GREEN_BADGE,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 10,
    marginTop: 4,
    textAlign: "center",
  },
  signedDate: {
    fontSize: 8,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 3,
  },
  signatureDigitalNote: {
    fontSize: 7,
    color: GRAY_500,
    textAlign: "center",
    marginTop: 4,
  },
  pendingBadge: {
    fontSize: 8,
    color: GRAY_500,
    backgroundColor: "#F3F4F6",
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 10,
    marginTop: 4,
    textAlign: "center",
  },

  // Rodape
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8F8F8",
    borderTopWidth: 1,
    borderTopColor: SEPARATOR,
    paddingHorizontal: 52,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 8,
    color: COPPER,
    letterSpacing: 0.3,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerContract: {
    fontSize: 8,
    color: GRAY_500,
    letterSpacing: 0.2,
  },
  footerDate: {
    fontSize: 7,
    color: GRAY_500,
    marginTop: 1,
  },
});

// ─── Tipos ─────────────────────────────────────────────────────────────────

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
    cnpj?: string | null;
  };
  wedding: {
    partnerName1: string;
    partnerName2: string;
    weddingDate?: Date | string | null;
    venue?: string | null;
    city?: string | null;
    estimatedGuests?: number | null;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(d: Date | string | null | undefined) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(v: number | null | undefined) {
  if (v == null) return "\u2014";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function contractNumber(id: string) {
  return `N\u00BA ${id.slice(-8).toUpperCase()}`;
}

// ─── Componente principal ──────────────────────────────────────────────────

export function ContractDocument({ contract, planner, wedding }: ContractPdfData) {
  const couple = `${wedding.partnerName1} & ${wedding.partnerName2}`;
  const contractNo = contractNumber(contract.id);

  return (
    <Document
      title={`Contrato \u2014 ${couple}`}
      author={planner.companyName}
      subject="Contrato de Prestacao de Servicos de Cerimonial"
    >
      <Page size="A4" style={styles.page}>

        {/* Faixa de cabecalho */}
        <View style={styles.headerBand}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyNameText}>{planner.companyName}</Text>
              {planner.cnpj ? (
                <Text style={styles.cnpjText}>CNPJ: {planner.cnpj}</Text>
              ) : planner.phone ? (
                <Text style={styles.cnpjText}>Tel: {planner.phone}</Text>
              ) : null}
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerMetaLabel}>CONTRATO</Text>
              <Text style={styles.headerMetaValue}>{contractNo}</Text>
              <Text style={styles.headerMetaLabel}>EMITIDO EM</Text>
              <Text style={styles.headerMetaValue}>{formatShortDate(contract.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Faixa com titulo do contrato */}
        <View style={styles.titleBand}>
          <Text style={styles.contractTitle}>Contrato de Prestacao de Servicos</Text>
          <Text style={styles.contractCouple}>{couple}</Text>
        </View>

        {/* Conteudo */}
        <View style={styles.content}>

          {/* Partes contratantes - 2 colunas */}
          <Text style={styles.sectionTitle}>Partes Contratantes</Text>
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Contratada</Text>
              <Text style={styles.columnValue}>{planner.companyName}</Text>
              {planner.cnpj ? (
                <Text style={styles.columnSub}>CNPJ: {planner.cnpj}</Text>
              ) : null}
              {planner.phone ? (
                <Text style={styles.columnSub}>Tel: {planner.phone}</Text>
              ) : null}
            </View>
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Contratantes</Text>
              <Text style={styles.columnValue}>{wedding.partnerName1}</Text>
              <Text style={styles.columnValue}>{wedding.partnerName2}</Text>
            </View>
          </View>

          {/* Dados do evento */}
          <Text style={styles.sectionTitle}>Dados do Evento</Text>
          <View style={styles.eventTable}>
            <View style={styles.eventCell}>
              <Text style={styles.eventCellLabel}>Data do Casamento</Text>
              <Text style={styles.eventCellValue}>{formatDate(wedding.weddingDate)}</Text>
            </View>
            <View style={styles.eventCell}>
              <Text style={styles.eventCellLabel}>Local</Text>
              <Text style={styles.eventCellValue}>
                {wedding.venue
                  ? wedding.city
                    ? `${wedding.venue} \u2014 ${wedding.city}`
                    : wedding.venue
                  : wedding.city ?? "\u2014"}
              </Text>
            </View>
            <View style={styles.eventCellLast}>
              <Text style={styles.eventCellLabel}>Convidados</Text>
              <Text style={styles.eventCellValue}>
                {wedding.estimatedGuests != null
                  ? `${wedding.estimatedGuests} pessoas`
                  : "\u2014"}
              </Text>
            </View>
          </View>

          {/* Servicos contratados */}
          <Text style={styles.sectionTitle}>Servicos Contratados</Text>
          <View style={styles.serviceTableHeader}>
            <Text style={styles.serviceTableHeaderDesc}>Descricao</Text>
            <Text style={styles.serviceTableHeaderVal}>Valor</Text>
          </View>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceDesc}>
              Cerimonial completo \u2014 {planner.companyName}
            </Text>
            <Text style={styles.serviceVal}>{formatCurrency(contract.value)}</Text>
          </View>
          <View style={styles.serviceTotalRow}>
            <Text style={styles.serviceTotalDesc}>Total</Text>
            <Text style={styles.serviceTotalVal}>{formatCurrency(contract.value)}</Text>
          </View>

          {/* Termos e clausulas */}
          <Text style={styles.sectionTitle}>Termos e Condicoes</Text>
          <View style={styles.termsBox}>
            <Text style={styles.termsText}>{contract.terms}</Text>
          </View>

          {/* Assinaturas */}
          <Text style={styles.sectionTitle}>Assinaturas</Text>
          <View style={styles.signaturesSection}>

            {/* Casal */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{contract.coupleName ?? couple}</Text>
              <Text style={styles.signatureRole}>Contratantes</Text>
              {contract.signedByCouple ? (
                <View>
                  <Text style={styles.signedBadge}>Assinado digitalmente</Text>
                  <Text style={styles.signedDate}>{formatDate(contract.coupleSignedAt)}</Text>
                  <Text style={styles.signatureDigitalNote}>Assinatura digital via Laco</Text>
                </View>
              ) : (
                <Text style={styles.pendingBadge}>Aguardando assinatura</Text>
              )}
            </View>

            {/* Cerimonialista */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{contract.plannerName ?? planner.companyName}</Text>
              <Text style={styles.signatureRole}>Cerimonialista</Text>
              {contract.signedByPlanner ? (
                <View>
                  <Text style={styles.signedBadge}>Assinado digitalmente</Text>
                  <Text style={styles.signedDate}>{formatDate(contract.plannerSignedAt)}</Text>
                  <Text style={styles.signatureDigitalNote}>Assinatura digital via Laco</Text>
                </View>
              ) : (
                <Text style={styles.pendingBadge}>Aguardando assinatura</Text>
              )}
            </View>

          </View>
        </View>

        {/* Rodape fixo */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>Contrato gerado pelo Laco \u00B7 laco.app</Text>
          <View style={styles.footerRight}>
            <Text style={styles.footerContract}>{contractNo}</Text>
            <Text style={styles.footerDate}>Gerado em {formatShortDate(new Date())}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
