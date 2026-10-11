import type { Episode } from '../modell/typer'
import type { Fremdrift, SpillModus } from './tilstand'

export type EpisodeKortStatus = 'fullfort' | 'aktiv' | 'neste' | 'aapen' | 'laast'

export interface EpisodeOversiktRad {
  id: string
  nummer: number
  tittel: string
  fil?: string | null
}

export function finnNesteEpisodeId(
  episoder: EpisodeOversiktRad[],
  fullforteEpisoder: string[],
): string | null {
  return (
    episoder.find((ep) => {
      const forrige = episoder.find((x) => x.nummer === ep.nummer - 1)
      const harFil = Boolean(ep.fil)
      const forrigeOk = !forrige || fullforteEpisoder.includes(forrige.id)
      const ferdig = fullforteEpisoder.includes(ep.id)
      return harFil && forrigeOk && !ferdig
    })?.id ?? null
  )
}

export function episodeErUlast(
  ep: EpisodeOversiktRad,
  episoder: EpisodeOversiktRad[],
  fullforteEpisoder: string[],
  spillModus: SpillModus | null,
): boolean {
  const forrige = episoder.find((x) => x.nummer === ep.nummer - 1)
  const harFil = Boolean(ep.fil)
  const forrigeOk = !forrige || fullforteEpisoder.includes(forrige.id)
  return harFil && (spillModus === 'valgfri' || forrigeOk)
}

export function episodeKortStatus(args: {
  ep: EpisodeOversiktRad
  episoder: EpisodeOversiktRad[]
  fremdrift: Fremdrift
  nesteId: string | null
}): EpisodeKortStatus {
  const { ep, episoder, fremdrift, nesteId } = args
  const ferdig = fremdrift.fullforteEpisoder.includes(ep.id)
  if (ferdig) return 'fullfort'
  if (fremdrift.visning === 'scene' && fremdrift.aktivEpisodeId === ep.id) return 'aktiv'
  if (fremdrift.spillModus !== 'valgfri' && ep.id === nesteId) return 'neste'
  if (episodeErUlast(ep, episoder, fremdrift.fullforteEpisoder, fremdrift.spillModus)) {
    return 'aapen'
  }
  return 'laast'
}

export function episodeProgresjon(
  episode: Episode | undefined,
  episodeId: string,
  fremdrift: Fremdrift,
): { stegnr: number; totalt: number; prosent: number } {
  const totalt = episode?.scener.length ?? 0
  if (fremdrift.fullforteEpisoder.includes(episodeId)) {
    return { stegnr: totalt, totalt, prosent: 100 }
  }
  if (!episode || totalt === 0) {
    return { stegnr: 0, totalt: 0, prosent: 0 }
  }
  const stegnr = episode.scener.filter((scene) =>
    fremdrift.fullforteScener.includes(scene.id),
  ).length
  const prosent = Math.round((stegnr / totalt) * 100)
  return { stegnr, totalt, prosent }
}

export function totalReiseProgresjon(
  episoder: Episode[],
  fremdrift: Fremdrift,
): { fullforte: number; totalt: number; prosent: number } {
  const totalt = episoder.length
  const fullforte = fremdrift.fullforteEpisoder.filter((id) =>
    episoder.some((ep) => ep.id === id),
  ).length
  const prosent = totalt === 0 ? 0 : Math.round((fullforte / totalt) * 100)
  return { fullforte, totalt, prosent }
}

export function statusEtikett(status: EpisodeKortStatus, valgfri: boolean): string {
  switch (status) {
    case 'fullfort':
      return 'Fullført'
    case 'aktiv':
      return 'Du er her'
    case 'neste':
      return 'Neste'
    case 'aapen':
      return valgfri ? 'Åpen' : 'Klar'
    case 'laast':
      return 'Låst'
  }
}
