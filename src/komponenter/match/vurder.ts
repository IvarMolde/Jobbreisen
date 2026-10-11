import type { MatchKrav, MatchSvar } from '../../modell/typer'

export function erRiktigMatchSvar(krav: MatchKrav, personId: string, svar: MatchSvar): boolean {
  return krav.fasit[personId] === svar
}

export function forklaringForKrav(krav: MatchKrav, personId: string): string {
  const fasit = krav.fasit[personId]
  return fasit === 'passer' ? krav.forklaringPasser : krav.forklaringPasserIkke
}

export const KATEGORI_NAVN: Record<MatchKrav['kategori'], string> = {
  kompetanse: 'Det du kan',
  egenskaper: 'Slik du er',
  logistikk: 'Reisevei',
}

export const MATCH_SVAR: Array<{ id: MatchSvar; tekst: string }> = [
  { id: 'passer', tekst: 'Passer' },
  { id: 'passer_ikke', tekst: 'Passer ikke' },
]
