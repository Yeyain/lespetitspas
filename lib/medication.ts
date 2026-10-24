// Règle de comparaison des noms de médicaments, partagée entre l'écran et le
// serveur : sans majuscules, sans accents, sans espaces autour.
// « Doliprane » = « doliprane » = « DOLIPRANE » = « Dolipràne ».
export function normalizeMedicationName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export function sameMedication(a: string, b: string): boolean {
  const left = normalizeMedicationName(a)
  return left !== "" && left === normalizeMedicationName(b)
}
