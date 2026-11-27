// Pasa el texto a minúsculas y le quita las tildes.
// Ejemplo: "Guayaquil, Zurdo y MAÑANA" -> "guayaquil, zurdo y manana"
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}