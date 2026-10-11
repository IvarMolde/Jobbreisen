import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AKTIVITET_STATUS_NAVN,
  type Aktivitet,
  type AktivitetStatus,
  type Annonse,
} from '../../modell/typer'
import { aktivitetFraAnnonse, jobberForPerson } from '../../spill/aktiviteter'
import { useSpill } from '../../spill/SpillProvider'

const KOLONNER: AktivitetStatus[] = ['skal_soke', 'sendt_soknad', 'innkalt', 'avslag']

const FRIST_DISTRAKTORER = ['i går', 'i morgen', '01.01.2020']

type SjekkId = 'aapne' | 'registrer' | 'status' | 'brett' | 'ferdig'

interface Props {
  open: boolean
  onLukk: () => void
}

export function AktivitetsplanOverlay({ open, onLukk }: Props) {
  const { fremdrift, person, innhold, lagreAktiviteter, registrerOppgave } = useSpill()
  const tittelId = useId()
  const lukkRef = useRef<HTMLButtonElement>(null)
  const [aktivSkjemaId, setAktivSkjemaId] = useState<string | null>(null)
  const [statusValg, setStatusValg] = useState<AktivitetStatus>('skal_soke')
  const [fristValg, setFristValg] = useState('')
  const [feil, setFeil] = useState<string | null>(null)

  const jobber = useMemo(() => {
    if (!person) return [] as Annonse[]
    return jobberForPerson(fremdrift.valgteJobber, person.id, innhold.annonser)
  }, [fremdrift.valgteJobber, innhold.annonser, person])

  const aktiviteter = fremdrift.aktiviteter
  const registrerteIds = useMemo(
    () => new Set(aktiviteter.map((a) => a.annonseId)),
    [aktiviteter],
  )

  const alleRegistrert =
    jobber.length > 0 &&
    jobber.every((j) => {
      const a = aktiviteter.find((x) => x.annonseId === j.id)
      return a?.status === 'skal_soke' && a.frist === j.soknadsfrist
    })

  const sjekkliste: Array<{ id: SjekkId; tekst: string; ferdig: boolean }> = [
    { id: 'aapne', tekst: 'Åpne Aktivitetsplanen', ferdig: open },
    {
      id: 'registrer',
      tekst: `Registrer ${jobber.length || 2}–${Math.max(jobber.length, 3)} valgte jobber`,
      ferdig: jobber.length > 0 && jobber.every((j) => registrerteIds.has(j.id)),
    },
    {
      id: 'status',
      tekst: 'Sett status «Skal søke» og riktig frist',
      ferdig: alleRegistrert,
    },
    {
      id: 'brett',
      tekst: 'Se kortene under «Skal søke»',
      ferdig: aktiviteter.some((a) => a.status === 'skal_soke'),
    },
    {
      id: 'ferdig',
      tekst: 'Lagre i spillet',
      ferdig: fremdrift.flagg.includes('aktiviteter_registrert'),
    },
  ]

  useEffect(() => {
    if (!open) return
    lukkRef.current?.focus()
    const forrige = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onTaste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onLukk()
    }
    window.addEventListener('keydown', onTaste)
    return () => {
      document.body.style.overflow = forrige
      window.removeEventListener('keydown', onTaste)
    }
  }, [open, onLukk])

  if (!open || !person) return null

  const startSkjema = (annonse: Annonse) => {
    setAktivSkjemaId(annonse.id)
    setStatusValg('skal_soke')
    setFristValg(annonse.soknadsfrist)
    setFeil(null)
  }

  const lagreEn = (annonse: Annonse) => {
    if (statusValg !== 'skal_soke') {
      setFeil('Nå skal du søke. Velg status «Skal søke».')
      return
    }
    if (fristValg !== annonse.soknadsfrist) {
      setFeil('Velg fristen som står i stillingsannonsen.')
      return
    }
    const ny: Aktivitet = {
      ...aktivitetFraAnnonse(annonse),
      status: 'skal_soke',
      frist: annonse.soknadsfrist,
    }
    const uten = aktiviteter.filter((a) => a.annonseId !== annonse.id)
    const neste = [...uten, ny]
    const ferdigAlle =
      jobber.length > 0 &&
      jobber.every((j) => {
        const treff = neste.find((x) => x.annonseId === j.id)
        return treff?.status === 'skal_soke' && treff.frist === j.soknadsfrist
      })
    lagreAktiviteter(neste, ferdigAlle ? ['aktiviteter_registrert'] : [])
    if (ferdigAlle) {
      const oppgave = innhold.episoder
        .find((e) => e.id === 'e05')
        ?.scener.flatMap((s) => s.oppgaver)
        .find((o) => o.type === 'registrer_aktiviteter')
      if (oppgave) registrerOppgave(oppgave.id, 'registrer_aktiviteter', true)
    }
    setAktivSkjemaId(null)
    setFeil(null)
  }

  const leggTilEgen = () => {
    const id = 'egen-arbeidsplassen'
    if (aktiviteter.some((a) => a.id === id)) return
    const egen: Aktivitet = {
      id,
      annonseId: id,
      tittel: 'Sjekke Arbeidsplassen',
      bedrift: 'Egen aktivitet',
      status: 'skal_soke',
      frist: 'Denne uka',
    }
    lagreAktiviteter([...aktiviteter, egen], [])
  }

  return createPortal(
    <div
      className="aktivitetsplan-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onLukk()
      }}
    >
      <div
        className="aktivitetsplan-vindu"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tittelId}
      >
        <header className="aktivitetsplan-vindu-topp">
          <div>
            <p className="aktivitetsplan-oving">ØVING · Ikke ekte NAV</p>
            <h2 id={tittelId}>Aktivitetsplanen din</h2>
          </div>
          <button ref={lukkRef} type="button" className="knapp knapp-sekundaer" onClick={onLukk}>
            Lukk
          </button>
        </header>

        <p className="aktivitetsplan-banner" role="note">
          Dette er en øving i Jobbreisen. Ingen data sendes til NAV. Du registrerer jobbene du valgte
          i episode 4.
        </p>

        <div className="aktivitetsplan-maal">
          <h3>Mitt mål</h3>
          <p>
            Jeg vil søke jobb som passer meg. Først registrerer jeg stillingene i Aktivitetsplanen.
          </p>
        </div>

        <div className="aktivitetsplan-layout">
          <aside className="aktivitetsplan-sjekkliste" aria-label="Øvingsoppdrag">
            <h3>Øvingsoppdrag</h3>
            <ol>
              {sjekkliste.map((s) => (
                <li key={s.id} className={s.ferdig ? 'er-ferdig' : undefined}>
                  <span className="aktivitetsplan-sjekk" aria-hidden="true">
                    {s.ferdig ? '✓' : ''}
                  </span>
                  <span>{s.tekst}</span>
                </li>
              ))}
            </ol>
            {alleRegistrert ? (
              <p className="aktivitetsplan-ok" role="status">
                Bra! Jobbene er lagret. Telefonen viser det samme.
              </p>
            ) : null}
            <button type="button" className="knapp knapp-sekundaer" onClick={leggTilEgen}>
              + Jobbrettet egenaktivitet
            </button>
          </aside>

          <div className="aktivitetsplan-hoved">
            <div className="aktivitetsplan-toolbar">
              <p>
                <strong>{person.fornavn}</strong> · Valgte jobber: {jobber.length}
              </p>
            </div>

            {jobber.length === 0 ? (
              <p className="tilbakemelding feil" role="alert">
                Ingen jobber er valgt ennå. Gå tilbake til episode 4 og velg 2 eller 3 stillinger.
              </p>
            ) : (
              <ul className="aktivitetsplan-jobbliste">
                {jobber.map((j) => {
                  const lagret = aktiviteter.find((a) => a.annonseId === j.id)
                  const aapen = aktivSkjemaId === j.id
                  return (
                    <li key={j.id} className="aktivitetsplan-jobbkort">
                      <div className="aktivitetsplan-jobbrad">
                        <div>
                          <strong>
                            {j.tittel} · {j.bedrift}
                          </strong>
                          <p>Frist i annonsen: {j.soknadsfrist}</p>
                          {lagret ? (
                            <p className="aktivitetsplan-ok">
                              Registrert · {AKTIVITET_STATUS_NAVN[lagret.status]} · {lagret.frist}
                            </p>
                          ) : (
                            <p>Ikke registrert ennå</p>
                          )}
                        </div>
                        {!lagret || aapen ? (
                          <button
                            type="button"
                            className="knapp"
                            onClick={() => (aapen ? setAktivSkjemaId(null) : startSkjema(j))}
                          >
                            {aapen ? 'Lukk skjema' : 'Registrer denne jobben'}
                          </button>
                        ) : (
                          <button type="button" className="knapp knapp-sekundaer" onClick={() => startSkjema(j)}>
                            Endre
                          </button>
                        )}
                      </div>

                      {aapen ? (
                        <form
                          className="aktivitetsplan-skjema"
                          onSubmit={(e) => {
                            e.preventDefault()
                            lagreEn(j)
                          }}
                        >
                          <p className="pakrevd">En jobb jeg vil søke på</p>
                          <label className="lbl">
                            Stillingstittel *
                            <input type="text" value={j.tittel} readOnly />
                          </label>
                          <label className="lbl">
                            Arbeidsgiver *
                            <input type="text" value={j.bedrift} readOnly />
                          </label>
                          <p>
                            <span className="pakrevd">Status *</span>
                          </p>
                          <div className="valggruppe">
                            {KOLONNER.map((s) => (
                              <button
                                key={s}
                                type="button"
                                className="knapp knapp-sekundaer"
                                aria-pressed={statusValg === s}
                                onClick={() => setStatusValg(s)}
                              >
                                {AKTIVITET_STATUS_NAVN[s]}
                              </button>
                            ))}
                          </div>
                          <p>
                            <span className="pakrevd">Frist *</span>
                          </p>
                          <div className="valggruppe">
                            {[j.soknadsfrist, ...FRIST_DISTRAKTORER.filter((d) => d !== j.soknadsfrist)].map(
                              (d) => (
                                <button
                                  key={d}
                                  type="button"
                                  className="knapp knapp-sekundaer"
                                  aria-pressed={fristValg === d}
                                  onClick={() => setFristValg(d)}
                                >
                                  {d}
                                </button>
                              ),
                            )}
                          </div>
                          {feil ? (
                            <p className="tilbakemelding feil" role="alert">
                              {feil}
                            </p>
                          ) : null}
                          <button type="submit" className="knapp">
                            Lagre aktivitet
                          </button>
                        </form>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}

            <h3 className="aktivitetsplan-brett-tittel">Brettet</h3>
            <div className="plan-brett aktivitetsplan-brett">
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
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
