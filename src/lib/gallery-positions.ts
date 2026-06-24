export interface PositionOption {
  value: string
  label: string
}

export const PAGE_POSITIONS: Record<string, PositionOption[]> = {
  home: [
    { value: 'top',          label: 'En haut de page' },
    { value: 'after_events', label: 'Après les événements' },
    { value: 'after_clubs',  label: 'Après les clubs' },
    { value: 'after_shop',   label: 'Après le shop' },
    { value: 'after_team',   label: 'Après l\'équipe' },
  ],
  'a-propos': [
    { value: 'after_team',        label: 'Après l\'équipe' },
    { value: 'after_manifesto',   label: 'Après le manifesto' },
    { value: 'after_partners',    label: 'Après les partenaires' },
  ],
  agenda: [
    { value: 'top',    label: 'En haut de page' },
    { value: 'bottom', label: 'En bas de page' },
  ],
  clubs: [
    { value: 'top',    label: 'En haut de page' },
    { value: 'bottom', label: 'En bas de page' },
  ],
  shop: [
    { value: 'top',    label: 'En haut de page' },
    { value: 'bottom', label: 'En bas de page' },
  ],
}

export function getPositionsForPages(pages: string[]): PositionOption[] {
  const seen = new Set<string>()
  const result: PositionOption[] = []
  for (const page of pages) {
    for (const pos of PAGE_POSITIONS[page] ?? []) {
      if (!seen.has(pos.value)) {
        seen.add(pos.value)
        result.push(pos)
      }
    }
  }
  return result
}
