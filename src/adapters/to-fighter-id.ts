// Traduce el texto que llega desde la URL a un id válido.
// Si el texto no es un número entero positivo, devuelve null.
export function toFighterId(param: string | undefined): number | null {
  if (param === undefined) {
    return null
  }

  if (!/^\d+$/.test(param)) {
    return null
  }

  return Number(param)
}