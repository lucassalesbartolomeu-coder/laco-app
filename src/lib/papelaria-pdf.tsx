/**
 * papelaria-pdf.tsx
 * Templates PDF de papelaria usando @react-pdf/renderer.
 * Cores e tipografia vêm do Identity Kit do casal.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KitPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface KitTypography {
  heading: { family: string; style: string };
  body: { family: string; style: string };
}

export interface IdentityKitData {
  palette: KitPalette;
  typography: KitTypography;
  style: string; // clássico | rústico | moderno | romântico | minimalista | boho
  invite?: {
    tagline?: string;
    description?: string;
  };
}

export interface WeddingInfo {
  partnerName1: string;
  partnerName2: string;
  weddingDate?: Date | string | null;
  venue?: string | null;
  city?: string | null;
}

export interface MenuData {
  boasVindas?: string;
  entrada?: string;
  principal?: string;
  sobremesa?: string;
  bebidas?: string;
}

export interface SaveTheDateData {
  nome1?: string;
  nome2?: string;
  data?: string;
  local?: string;
  hora?: string;
  frasePersonalizada?: string;
}

export interface TagLencinhoData {
  textoCustom?: string;
  nome1?: string;
  nome2?: string;
  data?: string;
}

export interface ConviteData {
  tagline?: string;
  nome1?: string;
  nome2?: string;
  data?: string;
  hora?: string;
  local?: string;
  cidade?: string;
  endereco?: string;
  rsvp?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function coupleNames(w: WeddingInfo) {
  return `${w.partnerName1} & ${w.partnerName2}`;
}

// Fallback palette (Laço brand) if kit palette is missing
const FALLBACK: KitPalette = {
  primary: "#1A3A33",
  secondary: "#C4734F",
  accent: "#D4AF6A",
  background: "#FAF8F4",
  text: "#1A1A1A",
  muted: "#6B7280",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SAVE THE DATE
// ─────────────────────────────────────────────────────────────────────────────

export function SaveTheDateDocument({
  kit,
  wedding,
  custom,
}: {
  kit: IdentityKitData;
  wedding: WeddingInfo;
  custom?: SaveTheDateData;
}) {
  const p = kit.palette ?? FALLBACK;

  const s = StyleSheet.create({
    page: {
      backgroundColor: p.primary,
      width: "100%",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
    },
    border: {
      position: "absolute",
      top: 16,
      left: 16,
      right: 16,
      bottom: 16,
      borderWidth: 1,
      borderColor: p.accent,
    },
    overline: {
      fontFamily: "Helvetica",
      fontSize: 9,
      color: p.accent,
      textTransform: "uppercase",
      letterSpacing: 4,
      marginBottom: 24,
    },
    title: {
      fontFamily: "Helvetica-Bold",
      fontSize: 36,
      color: "#FFFFFF",
      letterSpacing: 3,
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 1.2,
    },
    divider: {
      width: 60,
      height: 1,
      backgroundColor: p.accent,
      marginVertical: 20,
    },
    dateText: {
      fontFamily: "Helvetica",
      fontSize: 14,
      color: "#FFFFFF",
      letterSpacing: 2,
      marginBottom: 6,
      textAlign: "center",
    },
    venueText: {
      fontFamily: "Helvetica",
      fontSize: 11,
      color: p.muted,
      letterSpacing: 1,
      textAlign: "center",
      marginBottom: 32,
    },
    tagline: {
      fontFamily: "Helvetica",
      fontSize: 11,
      color: p.secondary,
      letterSpacing: 2,
      textTransform: "uppercase",
      textAlign: "center",
    },
    footer: {
      position: "absolute",
      bottom: 32,
      left: 48,
      right: 48,
      alignItems: "center",
    },
    footerText: {
      fontFamily: "Helvetica",
      fontSize: 8,
      color: p.accent,
      opacity: 0.6,
      letterSpacing: 1,
    },
  });

  const n1 = custom?.nome1 || wedding.partnerName1;
  const n2 = custom?.nome2 || wedding.partnerName2;
  const dataStr = custom?.data || (wedding.weddingDate ? formatDate(wedding.weddingDate) : "");
  const localStr = custom?.local || [wedding.venue, wedding.city].filter(Boolean).join("  ·  ");
  const frase = custom?.frasePersonalizada || "Convite em breve";

  return (
    <Document title={`Save the Date — ${n1} & ${n2}`}>
      <Page size={[595, 842]} style={s.page}>
        <View style={s.border} />

        <Text style={s.overline}>Save the Date</Text>

        <Text style={s.title}>
          {n1.toUpperCase()}{"\n"}&{"\n"}{n2.toUpperCase()}
        </Text>

        <View style={s.divider} />

        {dataStr && <Text style={s.dateText}>{dataStr}</Text>}
        {custom?.hora && <Text style={s.dateText}>{custom.hora}</Text>}
        {localStr && <Text style={s.venueText}>{localStr}</Text>}

        <Text style={s.tagline}>{frase}</Text>

        <View style={s.footer}>
          <Text style={s.footerText}>Gerado pelo Laço · laco.app</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MENU
// ─────────────────────────────────────────────────────────────────────────────

export function MenuDocument({
  kit,
  wedding,
  menu,
}: {
  kit: IdentityKitData;
  wedding: WeddingInfo;
  menu?: MenuData;
}) {
  const p = kit.palette ?? FALLBACK;

  const s = StyleSheet.create({
    page: {
      backgroundColor: p.background,
      padding: 56,
      fontFamily: "Helvetica",
      color: p.text,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
      borderBottomWidth: 1,
      borderBottomColor: p.accent,
      paddingBottom: 24,
    },
    overline: {
      fontSize: 8,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: p.muted,
      marginBottom: 8,
    },
    coupleNames: {
      fontFamily: "Helvetica-Bold",
      fontSize: 28,
      color: p.primary,
      letterSpacing: 2,
      textAlign: "center",
    },
    dateVenue: {
      fontSize: 10,
      color: p.muted,
      letterSpacing: 1,
      marginTop: 6,
      textAlign: "center",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
      color: p.secondary,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: p.muted,
    },
    sectionText: {
      fontSize: 11,
      color: p.text,
      lineHeight: 1.7,
    },
    placeholderText: {
      fontSize: 11,
      color: p.muted,
      fontStyle: "italic",
      lineHeight: 1.7,
    },
    dividerCentered: {
      width: 40,
      height: 1,
      backgroundColor: p.accent,
      marginVertical: 20,
      alignSelf: "center",
    },
    footer: {
      position: "absolute",
      bottom: 28,
      left: 56,
      right: 56,
      borderTopWidth: 0.5,
      borderTopColor: p.muted,
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: {
      fontSize: 8,
      color: p.muted,
    },
  });

  const sections: Array<{ title: string; content: string; placeholder: string }> = [
    {
      title: "Boas-vindas",
      content: menu?.boasVindas ?? "",
      placeholder: "Com amor e gratidão por compartilharem este momento especial conosco.",
    },
    {
      title: "Entradas",
      content: menu?.entrada ?? "",
      placeholder: "A ser definido pelo casal",
    },
    {
      title: "Prato Principal",
      content: menu?.principal ?? "",
      placeholder: "A ser definido pelo casal",
    },
    {
      title: "Sobremesa",
      content: menu?.sobremesa ?? "",
      placeholder: "A ser definido pelo casal",
    },
    {
      title: "Bebidas",
      content: menu?.bebidas ?? "",
      placeholder: "A ser definido pelo casal",
    },
  ];

  return (
    <Document title={`Menu — ${coupleNames(wedding)}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.overline}>Menu</Text>
          <Text style={s.coupleNames}>{coupleNames(wedding)}</Text>
          {(wedding.weddingDate || wedding.venue) && (
            <Text style={s.dateVenue}>
              {[
                wedding.weddingDate ? formatDate(wedding.weddingDate) : null,
                wedding.venue,
                wedding.city,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </Text>
          )}
        </View>

        {/* Sections */}
        {sections.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            {sec.content ? (
              <Text style={s.sectionText}>{sec.content}</Text>
            ) : (
              <Text style={s.placeholderText}>{sec.placeholder}</Text>
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Gerado pelo Laço · laco.app</Text>
          <Text style={s.footerText}>{coupleNames(wedding)}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TAG LENCINHO (Lágrimas de Alegria)
// ─────────────────────────────────────────────────────────────────────────────

export function TagLencinhoDocument({
  kit,
  wedding,
  custom,
}: {
  kit: IdentityKitData;
  wedding: WeddingInfo;
  custom?: TagLencinhoData;
}) {
  const p = kit.palette ?? FALLBACK;

  // 8cm × 8cm in points (1cm ≈ 28.35pt)
  const SIZE = 227; // ~8cm

  const s = StyleSheet.create({
    page: {
      backgroundColor: p.background,
      width: SIZE,
      height: SIZE,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    outerBorder: {
      position: "absolute",
      top: 6,
      left: 6,
      right: 6,
      bottom: 6,
      borderWidth: 1,
      borderColor: p.accent,
    },
    innerBorder: {
      position: "absolute",
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
      borderWidth: 0.5,
      borderColor: p.primary,
    },
    dropIcon: {
      fontSize: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    mainText: {
      fontFamily: "Helvetica",
      fontSize: 8,
      color: p.primary,
      textAlign: "center",
      lineHeight: 1.6,
      marginBottom: 10,
      fontStyle: "italic",
    },
    divider: {
      width: 30,
      height: 0.5,
      backgroundColor: p.accent,
      marginBottom: 8,
    },
    coupleText: {
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
      color: p.primary,
      textAlign: "center",
      letterSpacing: 1,
      marginBottom: 4,
    },
    dateText: {
      fontFamily: "Helvetica",
      fontSize: 7,
      color: p.muted,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    lacoText: {
      position: "absolute",
      bottom: 16,
      fontSize: 6,
      color: p.accent,
      opacity: 0.7,
    },
  });

  const n1 = custom?.nome1 || wedding.partnerName1;
  const n2 = custom?.nome2 || wedding.partnerName2;
  const dataStr = custom?.data || (wedding.weddingDate ? formatDate(wedding.weddingDate) : "");
  const texto = custom?.textoCustom || "Chore à vontade,\njá pode dizer que vai dar certo.";

  return (
    <Document title={`Tag Lencinho — ${n1} & ${n2}`}>
      <Page size={[SIZE, SIZE]} style={s.page}>
        <View style={s.outerBorder} />
        <View style={s.innerBorder} />

        <Text style={s.dropIcon}>✦</Text>

        <Text style={s.mainText}>{texto}</Text>

        <View style={s.divider} />

        <Text style={s.coupleText}>{n1} & {n2}</Text>

        {dataStr && <Text style={s.dateText}>{dataStr}</Text>}

        <Text style={s.lacoText}>laco.app</Text>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONVITE DIGITAL
// ─────────────────────────────────────────────────────────────────────────────

export function ConviteDocument({
  kit,
  wedding,
  custom,
}: {
  kit: IdentityKitData;
  wedding: WeddingInfo;
  custom?: ConviteData;
}) {
  const p = kit.palette ?? FALLBACK;

  const n1 = custom?.nome1 || wedding.partnerName1;
  const n2 = custom?.nome2 || wedding.partnerName2;
  const dataStr = custom?.data || (wedding.weddingDate ? formatDate(wedding.weddingDate) : "");
  const localStr = custom?.local || wedding.venue || "";
  const cidadeStr = custom?.cidade || wedding.city || "";
  const tagline =
    custom?.tagline ??
    kit.invite?.tagline ??
    "Com alegria em nossos corações, convidamos você para celebrar este momento único conosco.";

  const s = StyleSheet.create({
    page: {
      backgroundColor: p.primary,
      padding: 0,
      flexDirection: "column",
    },
    topBand: {
      backgroundColor: p.accent,
      height: 6,
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 60,
    },
    overline: {
      fontFamily: "Helvetica",
      fontSize: 9,
      color: p.accent,
      letterSpacing: 5,
      textTransform: "uppercase",
      marginBottom: 32,
      textAlign: "center",
    },
    tagline: {
      fontFamily: "Helvetica",
      fontSize: 12,
      color: "#FFFFFF",
      textAlign: "center",
      lineHeight: 1.8,
      fontStyle: "italic",
      marginBottom: 40,
      maxWidth: 380,
      opacity: 0.9,
    },
    nameDividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 40,
      width: "100%",
    },
    nameLine: {
      flex: 1,
      height: 0.5,
      backgroundColor: p.accent,
      opacity: 0.6,
    },
    coupleNames: {
      fontFamily: "Helvetica-Bold",
      fontSize: 40,
      color: "#FFFFFF",
      letterSpacing: 3,
      textAlign: "center",
      lineHeight: 1.1,
      marginHorizontal: 16,
    },
    andSymbol: {
      fontFamily: "Helvetica",
      fontSize: 20,
      color: p.accent,
      textAlign: "center",
      marginVertical: 4,
    },
    detailsBox: {
      borderWidth: 1,
      borderColor: p.accent,
      padding: 28,
      alignItems: "center",
      width: "80%",
      marginBottom: 32,
    },
    detailLabel: {
      fontFamily: "Helvetica",
      fontSize: 8,
      color: p.accent,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    detailValue: {
      fontFamily: "Helvetica-Bold",
      fontSize: 14,
      color: "#FFFFFF",
      letterSpacing: 1,
      textAlign: "center",
      marginBottom: 16,
    },
    detailValueSmall: {
      fontFamily: "Helvetica",
      fontSize: 11,
      color: "#FFFFFF",
      opacity: 0.85,
      textAlign: "center",
      marginBottom: 0,
    },
    detailDivider: {
      width: 24,
      height: 0.5,
      backgroundColor: p.accent,
      opacity: 0.5,
      marginVertical: 12,
    },
    bottomBand: {
      backgroundColor: p.accent,
      height: 6,
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 60,
      right: 60,
      alignItems: "center",
    },
    footerText: {
      fontSize: 8,
      color: p.accent,
      opacity: 0.6,
      letterSpacing: 1,
    },
  });

  return (
    <Document title={`Convite — ${coupleNames(wedding)}`}>
      <Page size="A4" style={s.page}>
        <View style={s.topBand} />

        <View style={s.body}>
          <Text style={s.overline}>Convite de Casamento</Text>

          <Text style={s.tagline}>{tagline}</Text>

          {/* Couple names with decorative lines */}
          <View style={s.nameDividerRow}>
            <View style={s.nameLine} />
            <View style={{ alignItems: "center" }}>
              <Text style={s.coupleNames}>{n1.toUpperCase()}</Text>
              <Text style={s.andSymbol}>&</Text>
              <Text style={s.coupleNames}>{n2.toUpperCase()}</Text>
            </View>
            <View style={s.nameLine} />
          </View>

          {/* Details box */}
          <View style={s.detailsBox}>
            {dataStr && (
              <>
                <Text style={s.detailLabel}>Data</Text>
                <Text style={s.detailValue}>{dataStr}</Text>
                {custom?.hora && <Text style={s.detailValueSmall}>{custom.hora}</Text>}
                <View style={s.detailDivider} />
              </>
            )}
            {localStr && (
              <>
                <Text style={s.detailLabel}>Local</Text>
                <Text style={s.detailValue}>{localStr}</Text>
                {custom?.endereco && <Text style={s.detailValueSmall}>{custom.endereco}</Text>}
                {cidadeStr && <Text style={s.detailValueSmall}>{cidadeStr}</Text>}
              </>
            )}
            {custom?.rsvp && (
              <>
                <View style={s.detailDivider} />
                <Text style={s.detailLabel}>RSVP</Text>
                <Text style={s.detailValueSmall}>{custom.rsvp}</Text>
              </>
            )}
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Gerado pelo Laço · laco.app</Text>
        </View>

        <View style={s.bottomBand} />
      </Page>
    </Document>
  );
}
