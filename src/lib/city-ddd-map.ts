/**
 * Maps normalized Brazilian city names to their DDD (área telefônica).
 * Used to determine the wedding venue's approximate coordinates for
 * km-based attendance distance calculations.
 *
 * Covers state capitals, major cities, popular wedding/event venues.
 * Keys are lowercase ASCII (accents stripped).
 */
const CITY_DDD_RAW: Record<string, string> = {
  // ── DDD 11 — Grande São Paulo / Bragantina ───────────────────────────────
  "sao paulo":                    "11",
  "guarulhos":                    "11",
  "santo andre":                  "11",
  "sao bernardo do campo":        "11",
  "sao caetano do sul":           "11",
  "diadema":                      "11",
  "osasco":                       "11",
  "carapicuiba":                  "11",
  "maua":                         "11",
  "ribeirao pires":               "11",
  "rio grande da serra":          "11",
  "suzano":                       "11",
  "mogi das cruzes":              "11",
  "poa":                          "11",
  "ferraz de vasconcelos":        "11",
  "itaquaquecetuba":              "11",
  "aruja":                        "11",
  "santa isabel":                 "11",
  "igarata":                      "11",
  "biritiba-mirim":               "11",
  "biritiba mirim":               "11",
  "salesopolis":                  "11",
  "mairipora":                    "11",
  "nazare paulista":              "11",
  "atibaia":                      "11",
  "braganca paulista":            "11",
  "campo limpo paulista":         "11",
  "varzea paulista":              "11",
  "jundiai":                      "11",
  "itupeva":                      "11",
  "jarinu":                       "11",
  "itatiba":                      "11",
  "amparo":                       "11",
  "lindoia":                      "11",
  "serra negra":                  "11",
  "cotia":                        "11",
  "embu das artes":               "11",
  "embu-guacu":                   "11",
  "embu guacu":                   "11",
  "taboao da serra":              "11",
  "itapecerica da serra":         "11",
  "ibiuna":                       "11",
  "sao roque":                    "11",
  "mairinque":                    "11",
  "cajamar":                      "11",
  "franco da rocha":              "11",
  "caieiras":                     "11",
  "jandira":                      "11",
  "barueri":                      "11",
  "santana de parnaiba":          "11",
  "pirapora do bom jesus":        "11",

  // ── DDD 12 — Vale do Paraíba ─────────────────────────────────────────────
  "sao jose dos campos":          "12",
  "taubate":                      "12",
  "pindamonhangaba":              "12",
  "guaratingueta":                "12",
  "aparecida":                    "12",
  "lorena":                       "12",
  "jacareí":                      "12",
  "jacarei":                      "12",
  "ubatuba":                      "12",
  "caraguatatuba":                "12",
  "sao sebastiao":                "12",
  "ilhabela":                     "12",
  "campos do jordao":             "12",
  "santo antonio do pinhal":      "12",
  "sao bento do sapucai":         "12",
  "cunha":                        "12",
  "cacapava":                     "12",
  "monteiro lobato":              "12",

  // ── DDD 13 — Baixada Santista ────────────────────────────────────────────
  "santos":                       "13",
  "sao vicente":                  "13",
  "praia grande":                 "13",
  "guaruja":                      "13",
  "cubatao":                      "13",
  "bertioga":                     "13",
  "mongagua":                     "13",
  "itanhaem":                     "13",
  "peruibe":                      "13",
  "registro":                     "13",

  // ── DDD 14 — Bauru / Marilia ─────────────────────────────────────────────
  "bauru":                        "14",
  "marilia":                      "14",
  "avare":                        "14",
  "botucatu":                     "14",
  "jau":                          "14",
  "lins":                         "14",
  "pederneiras":                  "14",
  "ourinhos":                     "14",

  // ── DDD 15 — Sorocaba / Itapetininga ─────────────────────────────────────
  "sorocaba":                     "15",
  "itapetininga":                 "15",
  "itu":                          "15",
  "salto":                        "15",
  "tatui":                        "15",
  "pilar do sul":                 "15",
  "porto feliz":                  "15",

  // ── DDD 16 — Ribeirão Preto ──────────────────────────────────────────────
  "ribeirao preto":               "16",
  "franca":                       "16",
  "sertaozinho":                  "16",
  "bebedouro":                    "16",
  "catanduva":                    "16",
  "mococa":                       "16",
  "batatais":                     "16",
  "jardinopolis":                 "16",
  "brodowski":                    "16",

  // ── DDD 17 — São José do Rio Preto ───────────────────────────────────────
  "sao jose do rio preto":        "17",
  "mirassol":                     "17",
  "votuporanga":                  "17",
  "fernandopolis":                "17",
  "olimpia":                      "17",
  "sao carlos":                   "16", // São Carlos → 16

  // ── DDD 18 — Presidente Prudente ─────────────────────────────────────────
  "presidente prudente":          "18",
  "assis":                        "18",
  "araçatuba":                    "18",
  "aracatuba":                    "18",
  "andradina":                    "18",
  "birigui":                      "18",
  "penapolis":                    "18",

  // ── DDD 19 — Campinas / Piracicaba ───────────────────────────────────────
  "campinas":                     "19",
  "piracicaba":                   "19",
  "americana":                    "19",
  "santa barbara d'oeste":        "19",
  "santa barbara doeste":         "19",
  "nova odessa":                  "19",
  "hortolândia":                  "19",
  "hortolandia":                  "19",
  "sumare":                       "19",
  "rio claro":                    "19",
  "limeira":                      "19",
  "araras":                       "19",
  "sao joao da boa vista":        "19",
  "mogi mirim":                   "19",
  "mogi guacu":                   "19",
  "aguai":                        "19",
  "holambra":                     "19",
  "pedreira":                     "19",
  "louveira":                     "19",
  "vinhedo":                      "19",
  "valinhos":                     "19",
  "paulinia":                     "19",
  "indaiatuba":                   "19",
  "cosmopolis":                   "19",

  // ── DDD 21 — Rio de Janeiro / Grande Rio ─────────────────────────────────
  "rio de janeiro":               "21",
  "niteroi":                      "21",
  "sao goncalo":                  "21",
  "duque de caxias":              "21",
  "nova iguacu":                  "21",
  "belford roxo":                 "21",
  "sao joao de meriti":           "21",
  "nilópolis":                    "21",
  "nilopolis":                    "21",
  "mesquita":                     "21",
  "queimados":                    "21",
  "itaguai":                      "21",
  "seropedica":                   "21",
  "mangaratiba":                  "21",
  "angra dos reis":               "21",
  "parati":                       "21",
  "paraty":                       "21",
  "petropolis":                   "21",
  "teresopolis":                  "21",
  "nova friburgo":                "21",
  "marica":                       "21",
  "saquarema":                    "21",
  "arraial do cabo":              "21",
  "buzios":                       "21",
  "cabo frio":                    "22",
  "araruama":                     "22",
  "rio das ostras":               "22",
  "macae":                        "22",

  // ── DDD 22 — Norte Fluminense / Lagos ────────────────────────────────────
  "campos dos goytacazes":        "22",
  "campos":                       "22",

  // ── DDD 24 — Sul Fluminense ──────────────────────────────────────────────
  "volta redonda":                "24",
  "barra mansa":                  "24",
  "resende":                      "24",
  "itatiaia":                     "24",
  "penedo":                       "24",
  "vassouras":                    "24",
  "valenca":                      "24",
  "tres rios":                    "24",

  // ── DDD 27 — Grande Vitória ──────────────────────────────────────────────
  "vitoria":                      "27",
  "vila velha":                   "27",
  "cariacica":                    "27",
  "serra":                        "27",
  "viana":                        "27",
  "guarapari":                    "27",
  "aracruz":                      "27",
  "linhares":                     "27",

  // ── DDD 28 — Sul do ES ───────────────────────────────────────────────────
  "cachoeiro de itapemirim":      "28",
  "marataizes":                   "28",
  "presidente kennedy":           "28",
  "domingos martins":             "28",
  "pedra azul":                   "28",

  // ── DDD 31 — Grande BH ───────────────────────────────────────────────────
  "belo horizonte":               "31",
  "betim":                        "31",
  "contagem":                     "31",
  "santa luzia":                  "31",
  "ribeirao das neves":           "31",
  "sabara":                       "31",
  "nova lima":                    "31",
  "brumadinho":                   "31",
  "ibirité":                      "31",
  "ibirite":                      "31",
  "lagoa santa":                  "31",
  "pedro leopoldo":               "31",
  "vespasiano":                   "31",
  "sete lagoas":                  "31",
  "confins":                      "31",
  "esmeraldas":                   "31",
  "baldim":                       "31",
  "jaboticatubas":                "31",
  "brejo das almas":              "31",

  // ── DDD 32 — Zona da Mata MG ─────────────────────────────────────────────
  "juiz de fora":                 "32",
  "muriae":                       "32",
  "cataguases":                   "32",
  "ubá":                          "32",
  "uba":                          "32",
  "barbacena":                    "32",
  "sao joao del rei":             "32",
  "tiradentes":                   "32",
  "lavras":                       "32",

  // ── DDD 33 — Leste MG ────────────────────────────────────────────────────
  "governador valadares":         "33",
  "ipatinga":                     "33",
  "coronel fabriciano":           "33",
  "timoteo":                      "33",
  "caratinga":                    "33",
  "mantena":                      "33",

  // ── DDD 34 — Triângulo MG ────────────────────────────────────────────────
  "uberlandia":                   "34",
  "uberaba":                      "34",
  "patos de minas":               "34",
  "araguari":                     "34",
  "ituiutaba":                    "34",

  // ── DDD 35 — Sul MG / Poços ──────────────────────────────────────────────
  "pocos de caldas":              "35",
  "varginha":                     "35",
  "passos":                       "35",
  "alfenas":                      "35",
  "pouso alegre":                 "35",
  "itajuba":                      "35",
  "santa rita do sapucai":        "35",

  // ── DDD 37 — Oeste MG ────────────────────────────────────────────────────
  "divinopolis":                  "37",
  "formiga":                      "37",
  "para de minas":                "37",
  "luz":                          "37",

  // ── DDD 38 — Norte MG ────────────────────────────────────────────────────
  "montes claros":                "38",
  "pirapora":                     "38",
  "januaria":                     "38",
  "janauba":                      "38",

  // ── DDD 41 — Curitiba / Grande CWB ──────────────────────────────────────
  "curitiba":                     "41",
  "sao jose dos pinhais":         "41",
  "colombo":                      "41",
  "almirante tamandare":          "41",
  "pinhais":                      "41",
  "araucaria":                    "41",
  "fazenda rio grande":           "41",
  "campo largo":                  "41",
  "campo magro":                  "41",
  "balsa nova":                   "41",
  "lapa":                         "41",
  "piraquara":                    "41",

  // ── DDD 42 — Campos Gerais PR ────────────────────────────────────────────
  "ponta grossa":                 "42",
  "guarapuava":                   "42",
  "castro":                       "42",
  "palmeira":                     "42",
  "telêmaco borba":               "42",
  "telemaco borba":               "42",

  // ── DDD 43 — Norte PR ────────────────────────────────────────────────────
  "londrina":                     "43",
  "apucarana":                    "43",
  "arapongas":                    "43",
  "cambe":                        "43",
  "ibipora":                      "43",
  "rolandia":                     "43",

  // ── DDD 44 — Noroeste PR ─────────────────────────────────────────────────
  "maringa":                      "44",
  "umuarama":                     "44",
  "cianorte":                     "44",
  "paranavai":                    "44",
  "campo mourao":                 "44",

  // ── DDD 45 — Oeste PR ────────────────────────────────────────────────────
  "cascavel":                     "45",
  "foz do iguacu":                "45",
  "toledo":                       "45",
  "corbelia":                     "45",

  // ── DDD 46 — Sudoeste PR ─────────────────────────────────────────────────
  "francisco beltrao":            "46",
  "pato branco":                  "46",

  // ── DDD 47 — Norte SC ────────────────────────────────────────────────────
  "joinville":                    "47",
  "blumenau":                     "47",
  "itajai":                       "47",
  "navegantes":                   "47",
  "brusque":                      "47",
  "gaspar":                       "47",
  "balneario camboriu":           "47",
  "camboriu":                     "47",
  "balneário camboriú":           "47",
  "tijucas":                      "47",
  "penha":                        "47",

  // ── DDD 48 — Grande Florianópolis ────────────────────────────────────────
  "florianopolis":                "48",
  "sao jose":                     "48",
  "palhoca":                      "48",
  "biguacu":                      "48",
  "governador celso ramos":       "48",
  "antonio carlos":               "48",
  "imbituba":                     "48",
  "laguna":                       "48",
  "tubarao":                      "48",

  // ── DDD 49 — Oeste SC ────────────────────────────────────────────────────
  "chapeco":                      "49",
  "concordia":                    "49",
  "sao miguel do oeste":          "49",

  // ── DDD 51 — Grande Porto Alegre ─────────────────────────────────────────
  "porto alegre":                 "51",
  "canoas":                       "51",
  "sao leopoldo":                 "51",
  "novo hamburgo":                "51",
  "sapucaia do sul":              "51",
  "alvorada":                     "51",
  "viamao":                       "51",
  "gravataí":                     "51",
  "gravatai":                     "51",
  "cachoeirinha":                 "51",
  "esteio":                       "51",
  "sapiranga":                    "51",
  "campo bom":                    "51",
  "dois irmaos":                  "51",
  "ivoti":                        "51",
  "estancia velha":               "51",
  "triunfo":                      "51",
  "gramado":                      "54",  // Gramado → DDD 54 (Caxias do Sul area)
  "canela":                       "54",
  "nova petropolis":              "54",
  "flores da cunha":              "54",
  "bento goncalves":              "54",
  "garibaldi":                    "54",

  // ── DDD 53 — Pelotas / Rio Grande ────────────────────────────────────────
  "pelotas":                      "53",
  "rio grande":                   "53",
  "bage":                         "53",
  "camaqua":                      "53",

  // ── DDD 54 — Serra Gaúcha ────────────────────────────────────────────────
  "caxias do sul":                "54",
  "lages":                        "49",  // Lages → DDD 49

  // ── DDD 55 — Santa Maria / Noroeste RS ───────────────────────────────────
  "santa maria":                  "55",
  "cruz alta":                    "55",
  "ijui":                         "55",
  "passo fundo":                  "54",  // Passo Fundo → 54
  "erechim":                      "54",

  // ── DDD 61 — Brasília / DF ───────────────────────────────────────────────
  "brasilia":                     "61",
  "taguatinga":                   "61",
  "ceilandia":                    "61",
  "samambaia":                    "61",
  "planaltina":                   "61",
  "sobradinho":                   "61",
  "gama":                         "61",
  "aguas claras":                 "61",
  "guara":                        "61",
  "nucleo bandeirante":           "61",
  "luziania":                     "61",  // GO mas usa 61
  "aguas lindas de goias":        "61",
  "formosa":                      "61",
  "planaltina de goias":          "61",

  // ── DDD 62 — Goiânia ─────────────────────────────────────────────────────
  "goiania":                      "62",
  "aparecida de goiania":         "62",
  "anapolis":                     "62",
  "trindade":                     "62",
  "goianesia":                    "62",
  "inhumas":                      "62",
  "senador canedo":               "62",

  // ── DDD 63 — Tocantins ───────────────────────────────────────────────────
  "palmas":                       "63",
  "araguaina":                    "63",
  "gurupi":                       "63",

  // ── DDD 64 — Sul de Goiás ────────────────────────────────────────────────
  "rio verde":                    "64",
  "jatai":                        "64",
  "itumbiara":                    "64",
  "caldas novas":                 "64",
  "quirinopolis":                 "64",

  // ── DDD 65 — Cuiabá ──────────────────────────────────────────────────────
  "cuiaba":                       "65",
  "varzea grande":                "65",
  "rondonopolis":                 "66",
  "caceres":                      "65",
  "sinop":                        "66",
  "lucas do rio verde":           "66",
  "alta floresta":                "66",

  // ── DDD 67 — Campo Grande ────────────────────────────────────────────────
  "campo grande":                 "67",
  "dourados":                     "67",
  "tres lagoas":                  "67",
  "corumba":                      "67",
  "nova andradina":               "67",

  // ── DDD 68 — Acre ────────────────────────────────────────────────────────
  "rio branco":                   "68",
  "cruzeiro do sul":              "68",

  // ── DDD 69 — Rondônia ────────────────────────────────────────────────────
  "porto velho":                  "69",
  "ji-parana":                    "69",
  "ji parana":                    "69",
  "cacoal":                       "69",
  "ariquemes":                    "69",

  // ── DDD 71 — Salvador / Grande Salvador ──────────────────────────────────
  "salvador":                     "71",
  "lauro de freitas":             "71",
  "camaçari":                     "71",
  "camacari":                     "71",
  "simoes filho":                 "71",
  "candeias":                     "71",
  "madre de deus":                "71",
  "sao francisco do conde":       "71",
  "praia do forte":               "71",

  // ── DDD 73 — Sul da Bahia ────────────────────────────────────────────────
  "ilheus":                       "73",
  "itabuna":                      "73",
  "porto seguro":                 "73",
  "arraial d'ajuda":              "73",
  "arraial dajuda":               "73",
  "trancoso":                     "73",
  "canaveiras":                   "73",
  "eunapolis":                    "73",
  "teixeira de freitas":          "73",

  // ── DDD 74 — Norte/Nordeste da Bahia ─────────────────────────────────────
  "juazeiro":                     "74",
  "petrolina":                    "87",  // PE, DDD 87
  "jacobina":                     "74",
  "senhor do bonfim":             "74",
  "paulo afonso":                 "74",

  // ── DDD 75 — Feira de Santana ────────────────────────────────────────────
  "feira de santana":             "75",
  "alagoinhas":                   "75",
  "santo antonio de jesus":       "75",

  // ── DDD 77 — Centro-Oeste da Bahia ───────────────────────────────────────
  "vitoria da conquista":         "77",
  "barreiras":                    "77",
  "guanambi":                     "77",
  "brumado":                      "77",

  // ── DDD 79 — Sergipe ─────────────────────────────────────────────────────
  "aracaju":                      "79",
  "nossa senhora do socorro":     "79",
  "lagarto":                      "79",

  // ── DDD 81 — Recife / Grande Recife ──────────────────────────────────────
  "recife":                       "81",
  "olinda":                       "81",
  "caruaru":                      "81",
  "paulista":                     "81",
  "camaragibe":                   "81",
  "jaboatao dos guararapes":      "81",
  "jaboatao":                     "81",
  "cabo de santo agostinho":      "81",
  "abreu e lima":                 "81",
  "igarassu":                     "81",
  "garanhuns":                    "87",

  // ── DDD 82 — Alagoas ─────────────────────────────────────────────────────
  "maceio":                       "82",
  "arapiraca":                    "82",
  "palmeira dos indios":          "82",

  // ── DDD 83 — João Pessoa ─────────────────────────────────────────────────
  "joao pessoa":                  "83",
  "campina grande":               "83",
  "patos":                        "83",
  "sousa":                        "83",
  "bayeux":                       "83",
  "santa rita":                   "83",

  // ── DDD 84 — Natal ───────────────────────────────────────────────────────
  "natal":                        "84",
  "mossoro":                      "84",
  "parnamirim":                   "84",
  "sao goncalo do amarante":      "84",
  "macaiba":                      "84",

  // ── DDD 85 — Fortaleza / Grande Fortaleza ────────────────────────────────
  "fortaleza":                    "85",
  "caucaia":                      "85",
  "maracanau":                    "85",
  "quixada":                      "85",
  "horizonte":                    "85",
  "pacatuba":                     "85",

  // ── DDD 86 — Piauí ───────────────────────────────────────────────────────
  "teresina":                     "86",
  "parnaiba":                     "86",
  "picos":                        "89",
  "floriano":                     "89",

  // ── DDD 87 — Sertão PE ───────────────────────────────────────────────────
  "petrolina pe":                 "87",
  "salgueiro":                    "87",
  "araripina":                    "87",

  // ── DDD 88 — Interior do Ceará ───────────────────────────────────────────
  "juazeiro do norte":            "88",
  "crato":                        "88",
  "barbalha":                     "88",

  // ── DDD 91 — Belém / Grande Belém ────────────────────────────────────────
  "belem":                        "91",
  "ananindeua":                   "91",
  "marituba":                     "91",
  "castanhal":                    "91",

  // ── DDD 92 — Manaus ──────────────────────────────────────────────────────
  "manaus":                       "92",
  "itacoatiara":                  "92",
  "parintins":                    "92",

  // ── DDD 93 — Santarém ────────────────────────────────────────────────────
  "santarem":                     "93",
  "itaituba":                     "93",

  // ── DDD 94 — Marabá ──────────────────────────────────────────────────────
  "maraba":                       "94",
  "tucurui":                      "94",
  "redencao":                     "94",
  "xinguara":                     "94",

  // ── DDD 95 — Roraima ─────────────────────────────────────────────────────
  "boa vista":                    "95",

  // ── DDD 96 — Amapá ───────────────────────────────────────────────────────
  "macapa":                       "96",
  "santana":                      "96",

  // ── DDD 98 — São Luís ────────────────────────────────────────────────────
  "sao luis":                     "98",
  "imperatriz":                   "99",
  "caxias":                       "99",
  "timon":                        "99",

  // ── DDD 99 — Imperatriz / Leste MA ───────────────────────────────────────
  "bacabal":                      "99",
  "codó":                         "99",
  "codo":                         "99",
};

// ── Normalisation ──────────────────────────────────────────────────────────

function normalise(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip accents
    .replace(/[^a-z0-9\s-]/g, "")       // keep alphanumeric, spaces, hyphens
    .trim();
}

// Pre-build normalised lookup once
const NORMALISED_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_DDD_RAW).map(([city, ddd]) => [normalise(city), ddd]),
);

/**
 * Returns the DDD for a given city name, or null if not found.
 * Handles accented characters and minor variations.
 */
export function cityToDDD(city: string | null | undefined): string | null {
  if (!city) return null;
  return NORMALISED_MAP[normalise(city)] ?? null;
}
