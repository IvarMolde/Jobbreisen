import { useMemo, useState } from 'react'
import type { Aktivitet, Annonse, Person, RegistrerAktiviteterOppgave } from '../../modell/typer'
import { aktivitetFraAnnonse, jobberForPerson } from '../../spill/aktiviteter'
import { AktivitetsplanOverlay } from '../aktivitetsplan/AktivitetsplanOverlay'
import { TilbakemeldingBoks } from './TilbakemeldingBoks'

interface Props {
  oppgave: RegistrerAktiviteterOppgave
  person: Person
  annonser: Annonse[]
  valgteJobber: string[]
  aktiviteter: Aktivitet[]
  ferdig: boolean
  onSvar: (riktig: boolean) => void
  onLagre: (aktiviteter: Aktivitet[], flagg: string[]) => void
}

export function RegistrerAktiviteter({
  oppgave,
  person,
  annonser,
  valgteJobber,
  aktiviteter,
  ferdig,
  onSvar,
  onLagre,
}: Props) {
  const jobber = useMemo(
    () => jobberForPerson(valgteJobber, person.id, annonser),
    [annonser, person.id, valgteJobber],
  )
  const alleredeOk =
    !ferdig &&
    jobber.length > 0 &&
    jobber.every((jobb) => {
      const a = aktiviteter.find((x) => x.annonseId === jobb.id)
      return a?.status === oppgave.riktigStatusId && a.frist === jobb.soknadsfrist
    })

  const [status, setStatus] = useState<Record<string, string>>(() =>
    ferdig || alleredeOk ? Object.fromEntries(jobber.map((jobb) => [jobb.id, oppgave.riktigStatusId])) : {},
  )
  const [frist, setFrist] = useState<Record<string, string>>(() =>
    ferdig || alleredeOk
      ? Object.fromEntries(jobber.map((jobb) => [jobb.id, jobb.soknadsfrist]))
      : {},
  )
  const [resultat, setResultat] = useState<'ok' | 'feil' | null>(ferdig || alleredeOk ? 'ok' : null)
  const [storAapen, setStorAapen] = useState(false)

  const bekreftFraOverlay = () => {
    if (resultat === 'ok') return
    if (!alleredeOk) return
    setResultat('ok')
    onSvar(true)
    onLagre(
      jobber.map((j) => {
        const eksisterende = aktiviteter.find((a) => a.annonseId === j.id)
        return eksisterende ?? aktivitetFraAnnonse(j)
      }),
      oppgave.flagg,
    )
  }

  const lagre = () => {
    if (resultat === 'ok' || jobber.length === 0) return
    const riktig = jobber.every(
      (jobb) => status[jobb.id] === oppgave.riktigStatusId && frist[jobb.id] === jobb.soknadsfrist,
    )
    setResultat(riktig ? 'ok' : 'feil')
    onSvar(riktig)
    if (riktig) {
      onLagre(jobber.map(aktivitetFraAnnonse), oppgave.flagg)
    }
  }

  if (ferdig || resultat === 'ok') {
    return (
      <div>
        <p className="skjema-hjelp">Jobbene er registrert i Aktivitetsplanen.</p>
        <TilbakemeldingBoks
          status="ok"
          riktig={oppgave.tilbakemeldingRiktig}
          feil={oppgave.tilbakemeldingFeil}
        />
      </div>
    )
  }

  if (alleredeOk) {
    return (
      <div>
        <p className="skjema-hjelp">
          Du har allerede registrert jobbene på stor skjerm. Trykk Bekreft for å fullføre oppgaven.
        </p>
        <button type="button" className="knapp" onClick={bekreftFraOverlay}>
          Bekreft registrering
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="skjema-hjelp">
        Bruk stor skjerm for å øve som i Aktivitetsplanen. Du kan også fylle ut feltene under.
      </p>
      <button type="button" className="knapp" onClick={() => setStorAapen(true)}>
        Åpne Aktivitetsplanen
      </button>
      <p className="skjema-hjelp" style={{ marginTop: '1rem' }}>
        Eller fyll ut her: Velg status. Velg frist. Trykk på Registrer.
      </p>
      {jobber.map((jobb) => {
        const fristValg = [jobb.soknadsfrist, ...oppgave.fristDistraktorer.filter((d) => d !== jobb.soknadsfrist)]
        return (
          <fieldset className="plan-skjema" key={jobb.id}>
            <legend>
              {jobb.tittel} · {jobb.bedrift}
            </legend>
            <p>
              <span className="pakrevd">Velg status *</span>
            </p>
            <div className="valggruppe">
              {oppgave.statuser.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  className="knapp knapp-sekundaer"
                  aria-pressed={status[jobb.id] === alt.id}
                  disabled={resultat === 'ok'}
                  onClick={() => {
                    setStatus((forrige) => ({ ...forrige, [jobb.id]: alt.id }))
                    setResultat(null)
                  }}
                >
                  {alt.tekst}
                </button>
              ))}
            </div>
            <p>
              <span className="pakrevd">Velg frist *</span>
            </p>
            <div className="valggruppe">
              {fristValg.map((dato) => (
                <button
                  key={dato}
                  type="button"
                  className="knapp knapp-sekundaer"
                  aria-pressed={frist[jobb.id] === dato}
                  disabled={resultat === 'ok'}
                  onClick={() => {
                    setFrist((forrige) => ({ ...forrige, [jobb.id]: dato }))
                    setResultat(null)
                  }}
                >
                  {dato}
                </button>
              ))}
            </div>
          </fieldset>
        )
      })}
      <button type="button" className="knapp" disabled={resultat === 'ok'} onClick={lagre}>
        Registrer aktivitetene
      </button>
      <TilbakemeldingBoks
        status={resultat}
        riktig={oppgave.tilbakemeldingRiktig}
        feil={oppgave.tilbakemeldingFeil}
      />
      <AktivitetsplanOverlay open={storAapen} onLukk={() => setStorAapen(false)} />
    </div>
  )
}
