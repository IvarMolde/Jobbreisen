import { useEffect, useState } from 'react'
import type { Annonse, Person, VelgJobberOppgave } from '../../modell/typer'
import { TilbakemeldingBoks } from './TilbakemeldingBoks'

interface Props {
  oppgave: VelgJobberOppgave
  person: Person
  annonser: Annonse[]
  ferdig: boolean
  valgteJobber: string[]
  onSvar: (riktig: boolean) => void
  onVelgJobber: (ids: string[], flagg: string[]) => void
}

export function VelgJobber({
  oppgave,
  person,
  annonser,
  ferdig,
  valgteJobber,
  onSvar,
  onVelgJobber,
}: Props) {
  const [valgte, setValgte] = useState<string[]>(valgteJobber)
  const [status, setStatus] = useState<'ok' | 'feil' | null>(ferdig ? 'ok' : null)

  useEffect(() => {
    setValgte(valgteJobber)
  }, [valgteJobber])

  useEffect(() => {
    if (ferdig) setStatus('ok')
  }, [ferdig])

  const toggle = (id: string) => {
    if (status === 'ok') return
    setValgte((forrige) => {
      const neste = forrige.includes(id)
        ? forrige.filter((x) => x !== id)
        : forrige.length >= oppgave.max
          ? forrige
          : [...forrige, id]
      onVelgJobber(neste, [])
      return neste
    })
  }

  const lagre = () => {
    if (status === 'ok') return
    const riktig = valgte.length >= oppgave.min && valgte.length <= oppgave.max
    setStatus(riktig ? 'ok' : 'feil')
    onSvar(riktig)
    if (riktig) onVelgJobber(valgte, oppgave.flagg ?? [])
  }

  return (
    <div className="velg-jobber">
      <p>
        Velg {oppgave.min}–{oppgave.max} jobber som kan passe {person.fornavn}. Du kan også velge
        stillingene i Jobbmagasinet på telefonen.
      </p>
      <p className="velg-jobber-status" role="status">
        Valgt: {valgte.length} av {oppgave.min}–{oppgave.max}
      </p>
      <div className="valggruppe">
        {annonser.map((a) => {
          const erValgt = valgte.includes(a.id)
          return (
            <button
              key={a.id}
              type="button"
              className={`knapp knapp-sekundaer${erValgt ? ' velg-jobber-valgt' : ''}`}
              aria-pressed={erValgt}
              disabled={status === 'ok'}
              onClick={() => toggle(a.id)}
            >
              {erValgt ? '✓ ' : ''}
              {a.tittel} · {a.bedrift}
            </button>
          )
        })}
      </div>
      <button type="button" className="knapp" disabled={status === 'ok'} onClick={lagre}>
        Gå videre med disse jobbene
      </button>
      <TilbakemeldingBoks
        status={status}
        riktig={oppgave.tilbakemeldingRiktig}
        feil={oppgave.tilbakemeldingFeil}
      />
    </div>
  )
}
