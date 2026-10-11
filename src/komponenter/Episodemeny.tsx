import { useEffect, useId, useRef, useState } from 'react'
import { useSpill } from '../spill/SpillProvider'
import {
  episodeKortStatus,
  episodeProgresjon,
  finnNesteEpisodeId,
  statusEtikett,
  totalReiseProgresjon,
  type EpisodeKortStatus,
} from '../spill/episodeStatus'

function statusHjelp(status: EpisodeKortStatus, valgfri: boolean): string {
  switch (status) {
    case 'fullfort':
      return 'Ferdig. Du kan spille på nytt.'
    case 'aktiv':
      return 'Du spiller denne episoden nå.'
    case 'neste':
      return 'Trykk for å fortsette her.'
    case 'aapen':
      return valgfri ? 'Trykk for å åpne.' : 'Klar når du vil.'
    case 'laast':
      return 'Fullfør episoden over først.'
  }
}

export function Episodemeny() {
  const { innhold, fremdrift, startEpisode, scene } = useSpill()
  const tittelId = useId()
  const aktivRef = useRef<HTMLLIElement | null>(null)
  const [mobilAapen, setMobilAapen] = useState(false)

  const oversikt = innhold.scenario.episoder
  const valgfri = fremdrift.spillModus === 'valgfri'
  const nesteId = finnNesteEpisodeId(oversikt, fremdrift.fullforteEpisoder)
  const reise = totalReiseProgresjon(innhold.episoder, fremdrift)

  const aktivEpisode =
    fremdrift.visning === 'scene' && fremdrift.aktivEpisodeId
      ? innhold.episoder.find((ep) => ep.id === fremdrift.aktivEpisodeId)
      : null
  const aktivProgresjon = aktivEpisode
    ? episodeProgresjon(aktivEpisode, aktivEpisode.id, fremdrift)
    : null

  useEffect(() => {
    if (!aktivRef.current) return
    aktivRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [fremdrift.aktivEpisodeId, fremdrift.aktivSceneId, fremdrift.visning])

  useEffect(() => {
    setMobilAapen(false)
  }, [fremdrift.aktivSceneId, fremdrift.visning])

  if (fremdrift.visning === 'start') return null

  const kompaktTekst = aktivEpisode
    ? `Episode ${aktivEpisode.nummer} · ${aktivProgresjon?.stegnr ?? 0}/${aktivProgresjon?.totalt ?? 0}`
    : `${reise.fullforte} av ${reise.totalt} episoder`

  return (
    <aside className="episodemeny" aria-labelledby={tittelId}>
      <button
        type="button"
        className="episodemeny-mobil-toggle"
        aria-expanded={mobilAapen}
        aria-controls="episodemeny-panel"
        onClick={() => setMobilAapen((v) => !v)}
      >
        <span className="episodemeny-mobil-toggle-tekst">
          <strong>Din reise</strong>
          <span>{kompaktTekst}</span>
        </span>
        <span className="episodemeny-mobil-meter" aria-hidden="true">
          <span style={{ width: `${aktivProgresjon?.prosent ?? reise.prosent}%` }} />
        </span>
        <span className="episodemeny-mobil-chevron" aria-hidden="true">
          {mobilAapen ? '▲' : '▼'}
        </span>
      </button>

      <div
        id="episodemeny-panel"
        className={`episodemeny-panel${mobilAapen ? ' er-aapen' : ''}`}
      >
        <header className="episodemeny-hode">
          <p className="episodemeny-oyenvippe">Jobbreisen</p>
          <h2 id={tittelId}>Din reise</h2>
          <p className="episodemeny-ingress">
            Se hvor du er, og hvor langt du har kommet i hver episode.
          </p>

          <div
            className="episodemeny-total"
            role="group"
            aria-label={`Total fremdrift: ${reise.fullforte} av ${reise.totalt} episoder`}
          >
            <div className="episodemeny-total-rad">
              <span>Hele kurset</span>
              <strong>
                {reise.fullforte}/{reise.totalt}
              </strong>
            </div>
            <div
              className="episodemeny-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reise.prosent}
              aria-label="Fremdrift i hele kurset"
            >
              <span style={{ width: `${reise.prosent}%` }} />
            </div>
          </div>

          {aktivEpisode && scene && aktivProgresjon ? (
            <div className="episodemeny-her" role="status">
              <p className="episodemeny-her-merke">Du er her</p>
              <p className="episodemeny-her-tittel">
                Episode {aktivEpisode.nummer}: {aktivEpisode.tittel}
              </p>
              <p className="episodemeny-her-scene">{scene.tittel}</p>
              <div
                className="episodemeny-bar episodemeny-bar--aktiv"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={aktivProgresjon.totalt}
                aria-valuenow={aktivProgresjon.stegnr}
                aria-label={`Steg ${aktivProgresjon.stegnr} av ${aktivProgresjon.totalt} i episoden`}
              >
                <span style={{ width: `${aktivProgresjon.prosent}%` }} />
              </div>
              <p className="episodemeny-her-steg">
                Steg {aktivProgresjon.stegnr} av {aktivProgresjon.totalt}
              </p>
            </div>
          ) : null}
        </header>

        <ol className="episodemeny-liste">
          {oversikt.map((ep, indeks) => {
            const fullEpisode = innhold.episoder.find((e) => e.id === ep.id)
            const status = episodeKortStatus({
              ep,
              episoder: oversikt,
              fremdrift,
              nesteId,
            })
            const progresjon = episodeProgresjon(fullEpisode, ep.id, fremdrift)
            const ulast = status !== 'laast'
            const erAktiv = status === 'aktiv'
            const visSteg =
              erAktiv && fullEpisode
                ? fullEpisode.scener
                : null

            return (
              <li
                key={ep.id}
                ref={erAktiv ? aktivRef : undefined}
                className={`episodemeny-punkt episodemeny-punkt--${status}`}
                data-siste={indeks === oversikt.length - 1 ? 'true' : undefined}
              >
                <button
                  type="button"
                  className="episodemeny-knapp"
                  disabled={!ulast}
                  aria-current={erAktiv ? 'step' : undefined}
                  onClick={() => {
                    if (!ulast) return
                    if (erAktiv) return
                    startEpisode(ep.id)
                    setMobilAapen(false)
                  }}
                >
                  <span className="episodemeny-spor" aria-hidden="true">
                    <span className="episodemeny-node">{status === 'fullfort' ? '✓' : ep.nummer}</span>
                  </span>
                  <span className="episodemeny-innhold">
                    <span className="episodemeny-rad">
                      <span className="episodemeny-tittel">{ep.tittel}</span>
                      <span className={`episodemeny-merke episodemeny-merke--${status}`}>
                        {statusEtikett(status, valgfri)}
                      </span>
                    </span>
                    <span className="episodemeny-hjelp">{statusHjelp(status, valgfri)}</span>
                    <span
                      className="episodemeny-bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={progresjon.totalt || 100}
                      aria-valuenow={progresjon.stegnr}
                      aria-label={`Episode ${ep.nummer}: ${progresjon.prosent} prosent`}
                    >
                      <span style={{ width: `${progresjon.prosent}%` }} />
                    </span>
                    <span className="episodemeny-stegtekst">
                      {progresjon.totalt > 0
                        ? `${progresjon.stegnr} av ${progresjon.totalt} steg · ${progresjon.prosent} %`
                        : status === 'laast'
                          ? 'Ikke startet'
                          : 'Klar til start'}
                    </span>
                  </span>
                </button>

                {visSteg ? (
                  <ol className="episodemeny-scener" aria-label="Steg i episoden">
                    {visSteg.map((s, i) => {
                      const besokt = fremdrift.fullforteScener.includes(s.id)
                      const erScene = fremdrift.aktivSceneId === s.id
                      return (
                        <li
                          key={s.id}
                          className={
                            erScene
                              ? 'episodemeny-scene er-naa'
                              : besokt
                                ? 'episodemeny-scene er-besokt'
                                : 'episodemeny-scene'
                          }
                        >
                          <span className="episodemeny-scene-nr" aria-hidden="true">
                            {i + 1}
                          </span>
                          <span>{s.tittel}</span>
                        </li>
                      )
                    })}
                  </ol>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}
