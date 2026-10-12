# Status og oppfølging – Jobbreisen

Levende oversikt over hva som er ferdig, hva du bør sjekke, og hva som bør gjøres senere.

## Slik bruker du filen

1. Oppdater **Sist oppdatert** når du endrer noe.
2. Huk av `[ ]` → `[x]` når noe er testet eller gjort.
3. Flytt punkter mellom **Ferdig**, **Bør snart** og **Senere** etter hvert som arbeidet går.
4. Hold punktene korte — detaljer ligger i kode, episoder og commit-historikk.

**Sist oppdatert:** 2026-10-12

---

## Ferdig nylig

- [x] Aktivitetsplan-overlay i episode 5 (stort arbeidsvindu, Escape/Lukk, øvingsbanner)
- [x] Sjekkliste («øvingsoppdrag») koblet til Jobbreisen-flagg / `registrerOppgave`
- [x] Registrering av valgte jobber fra e04 → `fremdrift.aktiviteter`
- [x] Telefon-Aktivitetsplan speiler kortene live
- [x] Scenebilde `e05-s01-plan.jpg` (NAV Min side / Aktivitetsplan)
- [x] A2-tekst: Aktivitetsplanen på NAV, Min side, veileder, søknader
- [x] A2-tekst: ordenstall i datoer (e05-s02), med skriv-oppgave a–e
- [x] Scenebilde `e05-s02-dato.jpg` (bordkalender 12. oktober i Dato-ramme)
- [x] Telefon-kort: tekst brytes inne i kortet, bedre kontrast
- [x] GitHub Pages-bygg fikset (TypeScript i `RegistrerAktiviteter`)

---

## Personvalg — fakta

Disse gjelder for **Olena**, **Taras** og **Sofiia**:

| Del | Oppførsel |
|-----|-----------|
| Scenebilder (`media.bilde`) | **Felles** for alle personer. Det finnes ingen `mediaPerPerson`. |
| Scenetekst | Kan variere via `tekstPerPerson` (brukes lite; e03 har eksempel). |
| Match-svar (e04 m.fl.) | Følger `fasit[personId]` i `annonser.json`. |
| Valgte jobber | Lagres i `valgteJobber`. Mangler valg → `STANDARD_JOBBER` per person. |
| e05 overlay / telefon | Viser jobbene til den valgte personen. |
| e04 magasinrunde | **Med vilje felles**: alle ser butikk → lager → omsorg → velg. |

**Konklusjon:** Nye e05-bilder og -tekster er OK for alle personer. Oppgaver som matcher/registrerer jobber tilpasser seg personen. e04-bilder følger sceneruten, ikke «bare min favorittjobb».

---

## Sjekkliste QA

- [ ] Hard refresh (Ctrl+F5) etter Pages-deploy
- [ ] Episode 5 med **Olena** — overlay, registrering, telefon
- [ ] Episode 5 med **Taras** — samme flyt, andre standardjobber hvis ikke valgt i e04
- [ ] Episode 5 med **Sofiia** — samme flyt
- [ ] e04: velg 2–3 jobber → e05: samme kort i overlay **og** på telefonen
- [ ] Lange stillingsnavn (f.eks. Butikkmedarbeider) brytes inne i kortet
- [ ] «Åpne Aktivitetsplanen» / «Åpne på stor skjerm» fungerer på mobil bredde

---

## Bør gjøres snart

- [ ] Oppdatere/innspille lyd til ny e05-tekst: `e05-s01-plan.wav`, `e05-s02-dato.wav` (se [INNSPILLING.md](INNSPILLING.md))
- [ ] Manuell QA av overlay på telefon/smal skjerm
- [ ] Gå gjennom QA-sjekklisten over og huk av

---

## Senere / backlog

- [ ] Personspesifikke scenebilder (`mediaPerPerson`) — bare hvis e04 skal følge «din» jobb i stedet for felles rundtur
- [ ] Flere aktivitetstyper i overlay som egne hovedmål (egenaktivitet, filter, print)
- [ ] BankID-øvingsinnlogging (bevisst utelatt; personvalg dekker rollen)
- [ ] Eget mission-poengsystem (bevisst utelatt; bruk episodemeny + oppsummering)

---

## Episode-oversikt

Status er grov: **OK** = spillbart; merk behov under merknad.

| Ep | Tittel (kort) | Innhold | Merknad |
|----|---------------|---------|---------|
| 1 | Melding til NAV-veilederen | OK | |
| 2 | Hvem er jeg som arbeidstaker? | OK | |
| 3 | Finn jobber | OK | |
| 4 | Passer jobben for meg? | OK | Felles magasinbilder for alle personer |
| 5 | Registrer i Aktivitetsplanen | OK | Overlay + ny tekst; **lyd bør synces** |
| 6 | Søk jobben | OK | |
| 7 | Svar fra bedriftene | OK | |
| 8 | Jobbintervjuet | OK | |
| 9 | Reisen til jobb og første dag | OK | |
| 10 | (se `e10.json`) | OK | |
| 11 | (se `e11.json`) | OK | |

Oppdater merknader når du finner hull (bilde / tekst / lyd / oppgave).

---

## Nyttige lenker

- Spill (Pages): https://ivarmolde.github.io/Jobbreisen/
- [README.md](README.md) · [LAERERVEILEDNING.md](LAERERVEILEDNING.md) · [INNSPILLING.md](INNSPILLING.md)
- Repo: `Jobbreisen`
