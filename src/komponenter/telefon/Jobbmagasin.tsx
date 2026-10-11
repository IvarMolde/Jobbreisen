import { useState } from 'react'
import type { Annonse } from '../../modell/typer'
import { SceneBilde } from '../SceneBilde'
import { KlikkbarTekst } from '../KlikkbarTekst'
import { KOMMUNE_NAVN } from '../../spill/sok'

interface Props {
  annonser: Annonse[]
  startId: string | null
  onVelgOrd: (id: string) => void
  onBytt: (id: string) => void
  /** Når true: eleven kan velge stillinger å ta videre i spillet */
  kanVelge?: boolean
  valgteJobber?: string[]
  minValg?: number
  maxValg?: number
  valgFerdig?: boolean
  onToggleJobb?: (id: string) => void
  onBekreftValg?: () => void
}

export function Jobbmagasin({
  annonser,
  startId,
  onVelgOrd,
  onBytt,
  kanVelge = false,
  valgteJobber = [],
  minValg = 2,
  maxValg = 3,
  valgFerdig = false,
  onToggleJobb,
  onBekreftValg,
}: Props) {
  const startIndeks = Math.max(
    0,
    annonser.findIndex((a) => a.id === startId),
  )
  const [brukerIndeks, setBrukerIndeks] = useState<number | null>(null)
  const indeks = brukerIndeks ?? (startIndeks < 0 ? 0 : startIndeks)
  const annonse = annonser[indeks]

  if (!annonse) {
    return (
      <div>
        <header className="hjem-hode">
          <h1>Jobbmagasinet</h1>
        </header>
        <p className="tom-tilstand">Ingen annonser.</p>
      </div>
    )
  }

  const bytt = (delta: number) => {
    const neste = (indeks + delta + annonser.length) % annonser.length
    setBrukerIndeks(neste)
    const id = annonser[neste]?.id
    if (id) onBytt(id)
  }

  const erValgt = valgteJobber.includes(annonse.id)
  const antall = valgteJobber.length
  const kanBekrefte = antall >= minValg && antall <= maxValg
  const fullt = antall >= maxValg && !erValgt

  return (
    <div>
      <header className="hjem-hode">
        <h1>Jobbmagasinet</h1>
        <p>
          Annonse {indeks + 1} av {annonser.length}.
        </p>
      </header>
      <div className="magasin-nav">
        <button type="button" className="knapp knapp-sekundaer" onClick={() => bytt(-1)}>
          Forrige
        </button>
        <button type="button" className="knapp knapp-sekundaer" onClick={() => bytt(1)}>
          Neste
        </button>
      </div>

      {kanVelge ? (
        <p className="magasin-valg-status" role="status">
          {valgFerdig
            ? `Lagret: ${antall} stillinger valgt.`
            : `Valgt: ${antall} av ${minValg}–${maxValg}`}
        </p>
      ) : null}

      <article className={`kort${erValgt ? ' magasin-annonse--valgt' : ''}`}>
        <SceneBilde
          key={annonse.id}
          fil={annonse.bilde}
          alt={`${annonse.tittel} hos ${annonse.bedrift}`}
          kanZoom
          zoomModus="telefon"
          prioritet
        />
        <h2>{annonse.tittel}</h2>
        <p>{annonse.bedrift}</p>
        <p>
          {annonse.sted} · {KOMMUNE_NAVN[annonse.kommune] ?? annonse.kommune}
        </p>
        <ul className="nokkelord">
          <li>Søknadsfrist: {annonse.soknadsfrist}</li>
          <li>Stillingsprosent: {annonse.stillingsprosent}</li>
          <li>Tiltredelse: {annonse.tiltredelse}</li>
          <li>
            {Array.isArray(annonse.kontaktperson) && annonse.kontaktperson.length > 1
              ? `Kontaktpersoner: ${annonse.kontaktperson.join(' og ')}`
              : `Kontaktperson: ${Array.isArray(annonse.kontaktperson) ? annonse.kontaktperson[0] : annonse.kontaktperson}`}
          </li>
        </ul>
        <KlikkbarTekst tekst={annonse.tekst} onVelgOrd={onVelgOrd} />

        {kanVelge ? (
          <div className="magasin-valg-handlinger">
            <button
              type="button"
              className={`knapp ${erValgt ? 'knapp-amber' : 'knapp-sekundaer'}`}
              aria-pressed={erValgt}
              disabled={valgFerdig || (fullt && !erValgt)}
              onClick={() => onToggleJobb?.(annonse.id)}
            >
              {erValgt ? '✓ Valgt – trykk for å fjerne' : 'Velg denne stillingen'}
            </button>
            {fullt && !erValgt && !valgFerdig ? (
              <p className="magasin-valg-hjelp">Du har valgt {maxValg} stillinger. Fjern en før du velger en ny.</p>
            ) : null}
          </div>
        ) : null}
      </article>

      {kanVelge && !valgFerdig ? (
        <div className="magasin-valg-bekreft">
          <button
            type="button"
            className="knapp"
            disabled={!kanBekrefte}
            onClick={() => onBekreftValg?.()}
          >
            Gå videre med disse jobbene
          </button>
          {!kanBekrefte ? (
            <p className="magasin-valg-hjelp">Velg {minValg} eller {maxValg} stillinger først.</p>
          ) : (
            <p className="magasin-valg-hjelp">Da lagres valget i spillet.</p>
          )}
        </div>
      ) : null}

      {kanVelge && valgFerdig ? (
        <p className="tilbakemelding ok" role="status">
          Valget er lagret. Du bruker disse jobbene senere i spillet.
        </p>
      ) : null}
    </div>
  )
}
