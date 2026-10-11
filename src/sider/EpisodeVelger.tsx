import { useSpill } from '../spill/SpillProvider'
import {
  episodeErUlast,
  episodeKortStatus,
  finnNesteEpisodeId,
  statusEtikett,
} from '../spill/episodeStatus'

export function EpisodeVelger() {
  const { innhold, fremdrift, startEpisode, person, aapneSlutt, velgSpillModus } = useSpill()
  const harSlutt = fremdrift.fullforteEpisoder.includes('e11')
  const valgfri = fremdrift.spillModus === 'valgfri'
  const oversikt = innhold.scenario.episoder
  const nesteId = finnNesteEpisodeId(oversikt, fremdrift.fullforteEpisoder)

  return (
    <section className="panel" id="oppgave-innhold" aria-labelledby="episode-liste-tittel" tabIndex={-1}>
      <h1 id="episode-liste-tittel">Episoder</h1>
      {person ? (
        <p className="ingress">
          Du er {person.fornavn} {person.etternavn}. Mål: {person.yrkesmal}.
        </p>
      ) : null}

      <div className="modus-bytte" role="group" aria-label="Spillmodus">
        <button
          type="button"
          className={`modus-bytte-knapp${!valgfri ? ' er-valgt' : ''}`}
          aria-pressed={!valgfri}
          onClick={() => velgSpillModus('scenario')}
        >
          Fast scenario
        </button>
        <button
          type="button"
          className={`modus-bytte-knapp${valgfri ? ' er-valgt' : ''}`}
          aria-pressed={valgfri}
          onClick={() => velgSpillModus('valgfri')}
        >
          Valgfri scenario
        </button>
      </div>

      <p>
        {valgfri
          ? 'Valgfri modus: Du kan åpne hvilken episode du vil.'
          : 'Fast scenario: Fullfør episodene i rekkefølge. Du kan spille en ferdig episode på nytt.'}
      </p>

      <div className="liste">
        {oversikt.map((ep) => {
          const status = episodeKortStatus({
            ep,
            episoder: oversikt,
            fremdrift,
            nesteId,
          })
          const ulast = episodeErUlast(
            ep,
            oversikt,
            fremdrift.fullforteEpisoder,
            fremdrift.spillModus,
          )
          const ferdig = status === 'fullfort'
          const erNeste = status === 'neste'

          return (
            <button
              key={ep.id}
              type="button"
              className={`kort episodekort episodekort--${status === 'aktiv' ? 'neste' : status}`}
              disabled={!ulast}
              onClick={() => startEpisode(ep.id)}
            >
              <span className="episodekort-topp">
                <span className="episodekort-nummer" aria-hidden="true">
                  {ep.nummer}
                </span>
                <span className="episodekort-tittel">{ep.tittel}</span>
                {ferdig || erNeste || (valgfri && ulast && !ferdig) ? (
                  <span
                    className={`episodekort-merke episodekort-merke--${
                      ferdig ? 'fullfort' : erNeste ? 'neste' : 'aapen'
                    }`}
                  >
                    {statusEtikett(ferdig ? 'fullfort' : erNeste ? 'neste' : 'aapen', valgfri)}
                  </span>
                ) : null}
              </span>
              <p className="episodekort-tekst">
                {ferdig
                  ? 'Du kan spille på nytt.'
                  : erNeste
                    ? 'Trykk for å fortsette her.'
                    : ulast
                      ? 'Trykk for å starte denne episoden.'
                      : ep.fil
                        ? 'Låst. Fullfør episoden over først.'
                        : 'Låst.'}
              </p>
            </button>
          )
        })}
      </div>
      {harSlutt ? (
        <div className="handlinger">
          <button type="button" className="knapp knapp-amber" onClick={aapneSlutt}>
            Se kursbeviset
          </button>
        </div>
      ) : null}
    </section>
  )
}
