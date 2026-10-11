import { useState } from 'react'
import { AKTIVITET_STATUS_NAVN, type Aktivitet, type AktivitetStatus } from '../../modell/typer'
import { AktivitetsplanOverlay } from '../aktivitetsplan/AktivitetsplanOverlay'

const KOLONNER: AktivitetStatus[] = ['skal_soke', 'sendt_soknad', 'innkalt', 'avslag']

interface Props {
  aktiviteter: Aktivitet[]
  soknadTekst: string | null
  /** Når true (episode 5), vis knapp for stort arbeidsvindu. */
  kanAapneStor?: boolean
}

export function Aktivitetsplan({ aktiviteter, soknadTekst, kanAapneStor = true }: Props) {
  const [storAapen, setStorAapen] = useState(false)

  return (
    <div>
      <header className="hjem-hode">
        <h1>Aktivitetsplan</h1>
        <p>Dine aktiviteter.</p>
      </header>
      <p className="plan-maal">Mål: Registrer jobbene. Følg status og frist.</p>
      {kanAapneStor ? (
        <button type="button" className="knapp plan-stor-knapp" onClick={() => setStorAapen(true)}>
          Åpne på stor skjerm
        </button>
      ) : null}
      {aktiviteter.length === 0 ? (
        <p className="tom-tilstand">
          Ingen aktiviteter ennå. Trykk «Åpne på stor skjerm» for å registrere jobbene.
        </p>
      ) : (
        <div className="plan-brett">
          {KOLONNER.map((status) => {
            const kort = aktiviteter.filter((a) => a.status === status)
            return (
              <section className="plan-kolonne" key={status} aria-label={AKTIVITET_STATUS_NAVN[status]}>
                <h2>{AKTIVITET_STATUS_NAVN[status]}</h2>
                {kort.length === 0 ? <p className="plan-tom">Ingen kort</p> : null}
                {kort.map((a) => (
                  <article className={`plan-kort status-${status}`} key={a.id}>
                    <h3>{a.tittel}</h3>
                    <p>{a.bedrift}</p>
                    <p>
                      Frist: <strong>{a.frist}</strong>
                    </p>
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}
      {soknadTekst ? (
        <article className="kort">
          <h2>Lagret søknad</h2>
          <p>{soknadTekst}</p>
        </article>
      ) : null}
      <AktivitetsplanOverlay open={storAapen} onLukk={() => setStorAapen(false)} />
    </div>
  )
}
