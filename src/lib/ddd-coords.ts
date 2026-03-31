/**
 * Approximate geographic center (lat, lon) for each Brazilian DDD area.
 * Used to compute km-based travel distances for attendance simulation.
 */
export const DDD_COORDS: Record<string, [number, number]> = {
  // São Paulo
  "11": [-23.55, -46.63], // São Paulo
  "12": [-23.20, -45.88], // São José dos Campos
  "13": [-23.96, -46.33], // Santos
  "14": [-22.32, -49.07], // Bauru
  "15": [-23.50, -47.46], // Sorocaba
  "16": [-21.17, -47.81], // Ribeirão Preto
  "17": [-20.82, -49.38], // São José do Rio Preto
  "18": [-22.12, -51.39], // Presidente Prudente
  "19": [-22.91, -47.06], // Campinas
  // Rio de Janeiro
  "21": [-22.91, -43.18], // Rio de Janeiro
  "22": [-21.75, -41.33], // Campos dos Goytacazes
  "24": [-22.52, -44.10], // Volta Redonda
  // Espírito Santo
  "27": [-20.32, -40.34], // Vitória
  "28": [-20.85, -41.11], // Cachoeiro de Itapemirim
  // Minas Gerais
  "31": [-19.92, -43.94], // Belo Horizonte
  "32": [-21.76, -43.35], // Juiz de Fora
  "33": [-18.85, -41.95], // Governador Valadares
  "34": [-18.92, -48.28], // Uberlândia
  "35": [-21.79, -46.56], // Poços de Caldas
  "37": [-20.14, -44.88], // Divinópolis
  "38": [-16.73, -43.86], // Montes Claros
  // Paraná
  "41": [-25.43, -49.27], // Curitiba
  "42": [-25.09, -50.16], // Ponta Grossa
  "43": [-23.31, -51.17], // Londrina
  "44": [-23.42, -51.93], // Maringá
  "45": [-24.96, -53.46], // Cascavel
  "46": [-26.08, -53.05], // Francisco Beltrão
  // Santa Catarina
  "47": [-26.30, -48.85], // Joinville
  "48": [-27.60, -48.55], // Florianópolis
  "49": [-27.10, -52.62], // Chapecó
  // Rio Grande do Sul
  "51": [-30.03, -51.23], // Porto Alegre
  "53": [-31.77, -52.34], // Pelotas
  "54": [-29.17, -51.18], // Caxias do Sul
  "55": [-29.69, -53.81], // Santa Maria
  // Brasília / Centro-Oeste
  "61": [-15.79, -47.88], // Brasília (DF)
  "62": [-16.69, -49.25], // Goiânia
  "63": [-10.19, -48.33], // Palmas
  "64": [-17.79, -50.93], // Rio Verde
  "65": [-15.60, -56.10], // Cuiabá
  "66": [-16.47, -54.64], // Rondonópolis
  "67": [-20.46, -54.62], // Campo Grande
  "68": [ -9.97, -67.82], // Rio Branco
  "69": [ -8.76, -63.90], // Porto Velho
  // Bahia
  "71": [-12.97, -38.51], // Salvador
  "73": [-14.79, -39.04], // Ilhéus
  "74": [ -9.41, -40.50], // Juazeiro
  "75": [-12.26, -38.97], // Feira de Santana
  "77": [-14.86, -40.84], // Vitória da Conquista
  // Sergipe
  "79": [-10.91, -37.07], // Aracaju
  // Nordeste
  "81": [ -8.06, -34.88], // Recife
  "82": [ -9.67, -35.74], // Maceió
  "83": [ -7.12, -34.86], // João Pessoa
  "84": [ -5.79, -35.21], // Natal
  "85": [ -3.72, -38.54], // Fortaleza
  "86": [ -5.09, -42.80], // Teresina
  "87": [ -9.39, -40.51], // Petrolina
  "88": [ -7.22, -39.32], // Juazeiro do Norte
  "89": [ -7.08, -41.47], // Picos
  // Norte
  "91": [ -1.46, -48.50], // Belém
  "92": [ -3.10, -60.02], // Manaus
  "93": [ -2.44, -54.71], // Santarém
  "94": [ -5.37, -49.12], // Marabá
  "95": [  2.82, -60.67], // Boa Vista
  "96": [  0.03, -51.07], // Macapá
  "97": [ -3.36, -64.71], // Tefé
  "98": [ -2.53, -44.30], // São Luís
  "99": [ -5.52, -47.48], // Imperatriz
};

/**
 * Approximate geographic centroid for each Brazilian state.
 * Used as wedding venue location when no DDD is available.
 */
export const STATE_CENTROID: Record<string, [number, number]> = {
  AC: [ -9.02, -70.81],
  AL: [ -9.57, -36.78],
  AM: [ -3.47, -65.10],
  AP: [  1.41, -51.77],
  BA: [-12.96, -41.71],
  CE: [ -5.49, -39.32],
  DF: [-15.79, -47.88],
  ES: [-19.19, -40.34],
  GO: [-15.83, -49.84],
  MA: [ -5.42, -45.44],
  MG: [-18.51, -44.55],
  MS: [-20.51, -54.54],
  MT: [-12.64, -55.42],
  PA: [ -3.41, -52.29],
  PB: [ -7.24, -36.68],
  PE: [ -8.38, -37.86],
  PI: [ -7.72, -42.73],
  PR: [-24.89, -51.55],
  RJ: [-22.25, -42.66],
  RN: [ -5.81, -36.59],
  RO: [-10.83, -63.34],
  RR: [  2.09, -61.66],
  RS: [-30.17, -53.50],
  SC: [-27.45, -50.95],
  SE: [-10.57, -37.45],
  SP: [-22.26, -48.64],
  TO: [-10.18, -48.33],
};

/**
 * Haversine great-circle distance in km.
 */
export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns the km distance from a DDD area to a wedding location (state centroid).
 * Returns null if either lookup fails.
 */
export function dddToWeddingKm(
  guestDdd: string,
  weddingState: string,
): number | null {
  const gCoords = DDD_COORDS[guestDdd];
  const wCoords = STATE_CENTROID[weddingState.toUpperCase()];
  if (!gCoords || !wCoords) return null;
  return haversineKm(gCoords[0], gCoords[1], wCoords[0], wCoords[1]);
}
