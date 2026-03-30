import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1A1F3A",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: "#1A1F3A",
    paddingBottom: 14,
  },
  logo: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1A1F3A",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: "#B87333",
    marginTop: 2,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1A1F3A",
    marginTop: 8,
  },
  reportPeriod: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1A1F3A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1A1F3A",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiHighlight: {
    color: "#B87333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLabel: {
    color: "#374151",
    fontSize: 9,
    flex: 1,
  },
  rowValue: {
    color: "#1A1F3A",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  badge: {
    backgroundColor: "#C9A96E",
    color: "#1A1F3A",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 9,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B87333",
    marginTop: 1.5,
  },
  taskDotDone: {
    backgroundColor: "#9CA3AF",
  },
});

interface ReportData {
  planner: { companyName: string; email: string };
  period: string; // "Março 2026"
  kpis: {
    activeWeddings: number;
    pipelineCount: number;
    pipelineValue: number;
    pendingCommissions: number;
    weddingsSoon: number;
  };
  weddings: {
    couple: string;
    weddingDate: string | null;
    venue: string | null;
    city: string | null;
  }[];
  tasks: {
    title: string;
    dueDate: string | null;
    done: boolean;
    priority: string;
  }[];
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function MonthlyReportDocument({ data }: { data: ReportData }) {
  const now = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return createElement(Document, { title: `Relatório Mensal — ${data.period}` },
    createElement(Page, { size: "A4", style: styles.page },

      // Header
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.logo }, "Laço"),
        createElement(Text, { style: styles.subtitle }, data.planner.companyName || "Painel Cerimonialista"),
        createElement(Text, { style: styles.reportTitle }, `Relatório — ${data.period}`),
        createElement(Text, { style: styles.reportPeriod }, `Gerado em ${now}`),
      ),

      // KPIs
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Resumo do Período"),
        createElement(View, { style: styles.kpiRow },
          createElement(View, { style: styles.kpiCard },
            createElement(Text, { style: styles.kpiValue }, String(data.kpis.activeWeddings)),
            createElement(Text, { style: styles.kpiLabel }, "Casamentos Ativos"),
          ),
          createElement(View, { style: styles.kpiCard },
            createElement(Text, { style: styles.kpiValue }, String(data.kpis.pipelineCount)),
            createElement(Text, { style: styles.kpiLabel }, "Leads no Pipeline"),
          ),
          createElement(View, { style: styles.kpiCard },
            createElement(Text, { style: [styles.kpiValue, styles.kpiHighlight] }, String(data.kpis.weddingsSoon)),
            createElement(Text, { style: styles.kpiLabel }, "Casamentos em 30 dias"),
          ),
        ),
        createElement(View, { style: styles.kpiRow },
          createElement(View, { style: styles.kpiCard },
            createElement(Text, { style: styles.kpiValue }, formatCurrency(data.kpis.pipelineValue)),
            createElement(Text, { style: styles.kpiLabel }, "Valor em Pipeline"),
          ),
          createElement(View, { style: styles.kpiCard },
            createElement(Text, { style: [styles.kpiValue, styles.kpiHighlight] }, formatCurrency(data.kpis.pendingCommissions)),
            createElement(Text, { style: styles.kpiLabel }, "Comissões Pendentes"),
          ),
        ),
      ),

      // Weddings
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Casamentos Ativos"),
        data.weddings.length === 0
          ? createElement(Text, { style: styles.emptyText }, "Nenhum casamento ativo no período.")
          : data.weddings.map((w, i) =>
              createElement(View, { key: i, style: styles.row },
                createElement(Text, { style: styles.rowLabel }, w.couple),
                createElement(View, { style: { flexDirection: "row", gap: 8, alignItems: "center" } },
                  w.weddingDate
                    ? createElement(Text, { style: styles.badge }, formatDate(w.weddingDate))
                    : null,
                  createElement(Text, { style: styles.rowValue }, w.city || w.venue || "—"),
                ),
              )
            ),
      ),

      // Tasks
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Tarefas"),
        data.tasks.length === 0
          ? createElement(Text, { style: styles.emptyText }, "Nenhuma tarefa registrada.")
          : data.tasks.slice(0, 15).map((t, i) =>
              createElement(View, { key: i, style: styles.taskRow },
                createElement(View, { style: [styles.taskDot, t.done ? styles.taskDotDone : {}] }),
                createElement(View, { style: { flex: 1 } },
                  createElement(Text, { style: [styles.rowLabel, t.done ? { color: "#9CA3AF" } : {}] }, t.title),
                ),
                t.dueDate
                  ? createElement(Text, { style: { fontSize: 8, color: "#6B7280" } }, formatDate(t.dueDate))
                  : null,
              )
            ),
      ),

      // Footer
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, "Laço — Plataforma de Planejamento de Casamentos"),
        createElement(Text, { style: styles.footerText }, data.planner.email),
      ),
    )
  );
}
